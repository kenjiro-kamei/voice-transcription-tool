"""
Pydantic schemas for request/response validation.
These schemas match the frontend TypeScript types for consistency.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class TranscriptionStatus(str):
    """Transcription job status values."""
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'


class TranscriptionJobBase(BaseModel):
    """Base schema for TranscriptionJob."""
    original_filename: str = Field(..., max_length=255)
    file_size: int = Field(..., gt=0)
    duration: Optional[float] = None
    language: str = Field(default='ja', max_length=10)


class TranscriptionJobCreate(TranscriptionJobBase):
    """Schema for creating a new transcription job."""
    file_url: str = Field(..., max_length=1024)


class TranscriptionJobUpdate(BaseModel):
    """Schema for updating a transcription job."""
    transcription_text: Optional[str] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None


class TranscriptionJobResponse(TranscriptionJobBase):
    """Schema for transcription job response."""
    id: UUID
    file_url: str
    transcription_text: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TranscriptionStatusResponse(BaseModel):
    """Schema for transcription status check response."""
    id: UUID
    status: str
    transcription_text: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ServiceStatus(BaseModel):
    """Schema for individual service status."""
    status: str  # 'connected', 'disconnected', 'unknown'
    latency_ms: Optional[float] = None
    error: Optional[str] = None


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""
    status: str = 'healthy'  # 'healthy', 'degraded', 'unhealthy'
    timestamp: datetime
    database: str = 'connected'
    services: Optional[dict[str, ServiceStatus]] = None
    version: str = '1.0.0'


class UploadErrorResponse(BaseModel):
    """Schema for upload error response."""
    error: str
    type: str  # "fileSize" | "fileType"
    retryable: bool


class TranscriptionHistoryResponse(BaseModel):
    """Schema for transcription history response."""
    id: UUID
    original_filename: str = Field(..., alias='originalFilename')
    transcription_text: str = Field(..., alias='transcriptionText')
    created_at: datetime = Field(..., alias='createdAt')
    preview_text: Optional[str] = Field(None, alias='previewText')
    file_size: Optional[int] = Field(None, alias='fileSize')
    duration: Optional[float] = None

    class Config:
        from_attributes = True
        populate_by_name = True

    @classmethod
    def from_transcription_job(cls, job):
        """Convert TranscriptionJob to TranscriptionHistoryResponse."""
        preview = None
        if job.transcription_text:
            preview = job.transcription_text[:100] if len(job.transcription_text) > 100 else job.transcription_text

        return cls(
            id=job.id,
            originalFilename=job.original_filename,
            transcriptionText=job.transcription_text or '',
            createdAt=job.created_at,
            previewText=preview,
            fileSize=job.file_size,
            duration=job.duration
        )


class TranscriptionHistoryCreate(BaseModel):
    """Schema for creating a transcription history record."""
    id: UUID
    original_filename: str = Field(..., alias='originalFilename')
    transcription_text: str = Field(..., alias='transcriptionText')
    created_at: datetime = Field(..., alias='createdAt')
    preview_text: Optional[str] = Field(None, alias='previewText')
    file_size: Optional[int] = Field(None, alias='fileSize')
    duration: Optional[float] = None

    class Config:
        populate_by_name = True
