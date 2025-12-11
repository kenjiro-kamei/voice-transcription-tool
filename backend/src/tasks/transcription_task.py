"""
Celery task for processing transcription with OpenAI Whisper API.
"""

import logging
import os
import tempfile
from datetime import datetime
from uuid import UUID
from io import BytesIO
from openai import OpenAI
from pydub import AudioSegment

from src.celery_app import celery_app
from src.config import settings
from src.database import SessionLocal
from src.models import TranscriptionJob, TranscriptionStatus

logger = logging.getLogger(__name__)

# OpenAI Whisper API file size limit (25MB)
WHISPER_MAX_FILE_SIZE = 25 * 1024 * 1024

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


@celery_app.task(bind=True, max_retries=3)
def process_transcription(self, job_id: str) -> None:
    """
    Process transcription using OpenAI Whisper API.

    Process flow:
    1. Download file from R2
    2. Check file size and compress if needed (>25MB)
    3. Call Whisper API
    4. Update database with result or error

    Args:
        job_id: UUID of the transcription job (as string)

    Raises:
        Exception: If processing fails after retries
    """
    job_uuid = UUID(job_id)
    db = SessionLocal()

    try:
        # Fetch job from database
        job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_uuid).first()
        if not job:
            logger.error(f'Job not found: {job_id}')
            return

        logger.info(f'Processing transcription job: {job_id}')

        # Download file from R2
        file_content = _download_file_from_r2(job.file_url)
        file_size = len(file_content)
        file_ext = os.path.splitext(job.original_filename)[1].lower()

        # Check if compression is needed
        if file_size > WHISPER_MAX_FILE_SIZE:
            logger.info(f'File size {file_size} bytes exceeds limit. Compressing...')
            file_content = _compress_audio(file_content, file_ext)
            logger.info(f'Compressed file size: {len(file_content)} bytes')

        # Create temporary file for Whisper API
        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        try:
            # Call Whisper API
            logger.info(f'Calling Whisper API for job {job_id}')
            with open(temp_file_path, 'rb') as audio_file:
                transcript = client.audio.transcriptions.create(
                    model='whisper-1',
                    file=audio_file,
                    language='ja',
                    response_format='text',
                )

            # Update job with result
            job.transcription_text = transcript
            job.status = TranscriptionStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.updated_at = datetime.utcnow()
            db.commit()

            logger.info(f'Transcription completed for job {job_id}')

        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        logger.error(f'Transcription failed for job {job_id}: {e}')

        # Update job with error
        try:
            job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_uuid).first()
            if job:
                job.status = TranscriptionStatus.FAILED
                job.error_message = str(e)
                job.updated_at = datetime.utcnow()
                db.commit()
        except Exception as db_error:
            logger.error(f'Failed to update job error status: {db_error}')
            db.rollback()

        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

    finally:
        db.close()


def _download_file_from_r2(file_url: str) -> bytes:
    """
    Download file from R2 storage or local storage.

    Args:
        file_url: Full URL of the file (R2 URL or file:// URL)

    Returns:
        File content as bytes

    Raises:
        Exception: If download fails
    """
    from src.services.r2_service import r2_service, LocalStorageService

    # Check if using local storage (file:// URL)
    if file_url.startswith('file://'):
        file_path = file_url.replace('file://', '')
        try:
            with open(file_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f'Failed to read local file: {e}')
            raise

    # Extract object name from R2 URL
    # Format: https://{account_id}.r2.cloudflarestorage.com/{bucket_name}/{object_name}
    object_name = file_url.split('/')[-1]

    # Check if using LocalStorageService
    if isinstance(r2_service, LocalStorageService):
        try:
            return r2_service.get_file_content(object_name)
        except Exception as e:
            logger.error(f'Failed to read file from local storage: {e}')
            raise

    # Use R2 client
    try:
        response = r2_service.client.get_object(
            Bucket=r2_service.bucket_name,
            Key=object_name
        )
        return response['Body'].read()
    except Exception as e:
        logger.error(f'Failed to download file from R2: {e}')
        raise


def _compress_audio(file_content: bytes, file_ext: str) -> bytes:
    """
    Compress audio file to reduce size below Whisper API limit.

    Strategy:
    1. Convert to MP3 format
    2. Reduce bitrate to 64kbps (voice-optimized)
    3. Convert to mono if stereo

    Args:
        file_content: Original file content
        file_ext: File extension (e.g., '.mp3', '.wav')

    Returns:
        Compressed file content as bytes

    Raises:
        Exception: If compression fails
    """
    try:
        # Load audio file
        audio = AudioSegment.from_file(BytesIO(file_content), format=file_ext[1:])

        # Convert to mono
        if audio.channels > 1:
            audio = audio.set_channels(1)

        # Export as MP3 with reduced bitrate
        output = BytesIO()
        audio.export(
            output,
            format='mp3',
            bitrate='64k',
            parameters=['-ac', '1']  # Force mono
        )

        return output.getvalue()

    except Exception as e:
        logger.error(f'Failed to compress audio: {e}')
        raise
