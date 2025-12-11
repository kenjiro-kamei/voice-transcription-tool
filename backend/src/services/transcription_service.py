"""
Transcription service for handling file upload and job creation.
"""

import logging
import uuid
from io import BytesIO
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from src.models import TranscriptionJob, TranscriptionStatus
from src.services.r2_service import r2_service

logger = logging.getLogger(__name__)

# Allowed file extensions and MIME types
ALLOWED_EXTENSIONS = {'.mp3', '.mp4', '.wav', '.m4a', '.mov', '.webm', '.mpeg'}
ALLOWED_MIME_TYPES = {
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/x-m4a',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/mpeg',
}
MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024  # 2GB in bytes


class TranscriptionService:
    """Service for handling transcription job operations."""

    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[bool, str]:
        """
        Validate uploaded file for size and type.

        Args:
            file: Uploaded file from FastAPI

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file extension
        filename = file.filename or ''
        file_ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

        if file_ext not in ALLOWED_EXTENSIONS:
            return False, f'File type not supported. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'

        # Check MIME type
        content_type = file.content_type or ''
        if content_type not in ALLOWED_MIME_TYPES:
            return False, f'MIME type not supported. Allowed types: {", ".join(ALLOWED_MIME_TYPES)}'

        return True, ''

    @staticmethod
    async def create_transcription_job(
        file: UploadFile,
        db: Session
    ) -> TranscriptionJob:
        """
        Create a new transcription job.

        Process flow:
        1. Validate file (type and size)
        2. Upload file to R2
        3. Create database record
        4. Return job record (Celery task will be triggered from the router)

        Args:
            file: Uploaded file from FastAPI
            db: Database session

        Returns:
            Created TranscriptionJob instance

        Raises:
            HTTPException: If validation or upload fails
        """
        # Validate file type
        is_valid, error_msg = TranscriptionService.validate_file(file)
        if not is_valid:
            logger.warning(f'File validation failed: {error_msg}')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={'error': error_msg, 'type': 'fileType', 'retryable': False}
            )

        # Read file content and check size
        try:
            file_content = await file.read()
            file_size = len(file_content)

            if file_size > MAX_FILE_SIZE:
                logger.warning(f'File too large: {file_size} bytes (max: {MAX_FILE_SIZE})')
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        'error': f'File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024**3):.1f}GB',
                        'type': 'fileSize',
                        'retryable': False
                    }
                )

            # Generate unique object name
            job_id = uuid.uuid4()
            file_ext = '.' + (file.filename or '').rsplit('.', 1)[-1].lower()
            object_name = f'{job_id}{file_ext}'

            # Upload to R2
            logger.info(f'Uploading file to R2: {object_name} ({file_size} bytes)')
            file_obj = BytesIO(file_content)
            file_url = r2_service.upload_file(
                file_obj=file_obj,
                object_name=object_name
            )

            # Create database record
            job = TranscriptionJob(
                id=job_id,
                original_filename=file.filename or 'unknown',
                file_url=file_url,
                file_size=file_size,
                status=TranscriptionStatus.PROCESSING,
                language='ja',
            )

            db.add(job)
            db.commit()
            db.refresh(job)

            logger.info(f'Created transcription job: {job.id}')
            return job

        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f'Failed to create transcription job: {e}')
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={'error': 'Failed to process file upload', 'type': 'server', 'retryable': True}
            )


# Global service instance
transcription_service = TranscriptionService()
