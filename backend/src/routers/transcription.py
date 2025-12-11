"""
Transcription API endpoints.
"""

import logging
from typing import List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body, BackgroundTasks
from sqlalchemy.orm import Session

from src.database import get_db
from src.models import TranscriptionJob, TranscriptionStatus
from src.schemas import (
    TranscriptionJobResponse,
    TranscriptionHistoryResponse,
    TranscriptionHistoryCreate
)
from src.services.r2_service import r2_service
from src.services.transcription_service import transcription_service
from src.tasks.transcription_task import process_transcription_sync

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post('/transcriptions/upload', response_model=TranscriptionJobResponse, status_code=status.HTTP_201_CREATED)
async def upload_file_for_transcription(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> TranscriptionJobResponse:
    """
    Upload a file for transcription.

    Process flow:
    1. Validate file (type and size)
    2. Upload file to R2 storage
    3. Create database record with status='processing'
    4. Queue background task for transcription
    5. Return job details immediately

    Args:
        background_tasks: FastAPI background tasks
        file: Audio or video file to transcribe
        db: Database session

    Returns:
        TranscriptionJobResponse with job details

    Raises:
        HTTPException: 400 if validation fails, 500 if processing fails
    """
    # Create transcription job (validates, uploads to R2, creates DB record)
    job = await transcription_service.create_transcription_job(file, db)

    # Queue background task for async processing (no Celery needed)
    background_tasks.add_task(process_transcription_sync, str(job.id))
    logger.info(f'Queued background transcription task for job {job.id}')

    return TranscriptionJobResponse.from_orm(job)


@router.get('/transcriptions/{job_id}/status', response_model=TranscriptionJobResponse)
def get_transcription_status(
    job_id: UUID,
    db: Session = Depends(get_db)
) -> TranscriptionJobResponse:
    """
    Get transcription job status.

    Args:
        job_id: UUID of the transcription job
        db: Database session

    Returns:
        TranscriptionJobResponse with current job status

    Raises:
        HTTPException: 404 if job not found
    """
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()

    if not job:
        logger.warning(f'Transcription job not found: {job_id}')
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Transcription not found'
        )

    logger.info(f'Retrieved status for job {job_id}: {job.status}')
    return TranscriptionJobResponse.from_orm(job)


@router.get('/transcriptions/{job_id}', response_model=TranscriptionJobResponse)
def get_transcription(
    job_id: UUID,
    db: Session = Depends(get_db)
) -> TranscriptionJobResponse:
    """
    Get transcription job result.

    This endpoint returns the complete transcription result.
    If the job is not completed, it returns the current status.

    Args:
        job_id: UUID of the transcription job
        db: Database session

    Returns:
        TranscriptionJobResponse with job details and transcription text

    Raises:
        HTTPException: 404 if job not found
    """
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()

    if not job:
        logger.warning(f'Transcription job not found: {job_id}')
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Transcription not found'
        )

    logger.info(f'Retrieved transcription for job {job_id}: {job.status}')
    return TranscriptionJobResponse.from_orm(job)


@router.delete('/transcriptions/{job_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_transcription(
    job_id: UUID,
    db: Session = Depends(get_db)
) -> None:
    """
    Delete transcription job and associated file.

    This endpoint:
    1. Deletes the job record from the database
    2. Deletes the associated file from R2 storage

    Args:
        job_id: UUID of the transcription job
        db: Database session

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 404 if job not found
        HTTPException: 500 if R2 deletion fails
    """
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()

    if not job:
        logger.warning(f'Transcription job not found for deletion: {job_id}')
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Transcription not found'
        )

    # Extract object name from file URL
    # Format: https://{account_id}.r2.cloudflarestorage.com/{bucket_name}/{object_name}
    file_url = job.file_url
    try:
        object_name = file_url.split('/')[-1]
    except Exception as e:
        logger.error(f'Failed to extract object name from URL {file_url}: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to parse file URL'
        )

    # Delete from database first
    try:
        db.delete(job)
        db.commit()
        logger.info(f'Deleted transcription job from database: {job_id}')
    except Exception as e:
        db.rollback()
        logger.error(f'Failed to delete job from database: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to delete transcription from database'
        )

    # Delete from R2 storage
    try:
        r2_service.delete_file(object_name)
        logger.info(f'Deleted file from R2: {object_name}')
    except Exception as e:
        logger.error(f'Failed to delete file from R2 {object_name}: {e}')
        # Database record is already deleted, so log error but don't raise exception
        # This follows the fail-fast principle while maintaining data consistency
        logger.warning(f'R2 file deletion failed for {object_name}, but database record was deleted')

    return None


# ==========================================
# History Management Endpoints (MVP Version)
# ==========================================

@router.get('/transcriptions/history', response_model=List[TranscriptionHistoryResponse])
def get_transcription_history(
    db: Session = Depends(get_db)
) -> List[TranscriptionHistoryResponse]:
    """
    Get all transcription history.

    MVP version: Returns all completed transcriptions from database.
    Frontend uses localStorage for history management, but this endpoint
    allows backup/sync functionality.

    Args:
        db: Database session

    Returns:
        List of TranscriptionHistoryResponse with preview text

    Note:
        - Only returns completed transcriptions
        - Ordered by created_at descending (newest first)
        - Preview text is first 100 characters of transcription
    """
    jobs = db.query(TranscriptionJob).filter(
        TranscriptionJob.status == TranscriptionStatus.COMPLETED
    ).order_by(
        TranscriptionJob.created_at.desc()
    ).all()

    history = [TranscriptionHistoryResponse.from_transcription_job(job) for job in jobs]
    logger.info(f'Retrieved {len(history)} transcription history records')

    return history


@router.post('/transcriptions/history', status_code=status.HTTP_201_CREATED)
def create_transcription_history(
    history_data: TranscriptionHistoryCreate = Body(...),
    db: Session = Depends(get_db)
) -> None:
    """
    Create a new transcription history record.

    MVP version: Creates a database record from localStorage data.
    This allows users to persist their localStorage history to database.

    Args:
        history_data: Transcription history data from frontend
        db: Database session

    Returns:
        None (201 Created)

    Raises:
        HTTPException: 500 if database operation fails

    Note:
        - Frontend sends complete history data including ID
        - If ID already exists, returns success (idempotent)
        - This is primarily for localStorage backup functionality
    """
    # Check if record already exists
    existing_job = db.query(TranscriptionJob).filter(
        TranscriptionJob.id == history_data.id
    ).first()

    if existing_job:
        logger.info(f'Transcription history already exists: {history_data.id}')
        return None

    # Create new transcription job record
    try:
        job = TranscriptionJob(
            id=history_data.id,
            original_filename=history_data.original_filename,
            file_url='',  # Not needed for history-only records
            file_size=history_data.file_size or 0,
            duration=history_data.duration,
            transcription_text=history_data.transcription_text,
            status=TranscriptionStatus.COMPLETED,
            created_at=history_data.created_at,
            updated_at=history_data.created_at,
            completed_at=history_data.created_at
        )

        db.add(job)
        db.commit()
        logger.info(f'Created transcription history record: {history_data.id}')

    except Exception as e:
        db.rollback()
        logger.error(f'Failed to create transcription history: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to save transcription history'
        )

    return None


@router.get('/transcriptions/history/{history_id}', response_model=TranscriptionHistoryResponse)
def get_transcription_history_detail(
    history_id: UUID,
    db: Session = Depends(get_db)
) -> TranscriptionHistoryResponse:
    """
    Get transcription history detail by ID.

    Args:
        history_id: UUID of the transcription history record
        db: Database session

    Returns:
        TranscriptionHistoryResponse with full details

    Raises:
        HTTPException: 404 if history not found
    """
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == history_id).first()

    if not job:
        logger.warning(f'Transcription history not found: {history_id}')
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='History not found'
        )

    logger.info(f'Retrieved transcription history detail: {history_id}')
    return TranscriptionHistoryResponse.from_transcription_job(job)


@router.delete('/transcriptions/history/{history_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_transcription_history(
    history_id: UUID,
    db: Session = Depends(get_db)
) -> None:
    """
    Delete transcription history by ID.

    MVP version: Deletes the database record only.
    Frontend manages localStorage separately.

    Args:
        history_id: UUID of the transcription history record
        db: Database session

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 404 if history not found
        HTTPException: 500 if database operation fails

    Note:
        - This only deletes the database record
        - R2 file deletion is handled separately if needed
        - Frontend should also delete from localStorage
    """
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == history_id).first()

    if not job:
        logger.warning(f'Transcription history not found for deletion: {history_id}')
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='History not found'
        )

    try:
        db.delete(job)
        db.commit()
        logger.info(f'Deleted transcription history: {history_id}')
    except Exception as e:
        db.rollback()
        logger.error(f'Failed to delete transcription history: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to delete transcription history'
        )

    return None
