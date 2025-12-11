"""
SQLAlchemy models for the application.
All models are defined in this single file to follow the Single Source of Truth principle.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import enum

from src.database import Base


class TranscriptionStatus(str, enum.Enum):
    """Transcription job status."""
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'


class TranscriptionJob(Base):
    """
    Transcription job model.
    Represents a single file transcription job with its status and results.
    """

    __tablename__ = 'transcription_jobs'

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Basic file information
    original_filename = Column(String(255), nullable=False)
    file_url = Column(String(1024), nullable=False)
    file_size = Column(Integer, nullable=False)
    duration = Column(Float, nullable=True)
    language = Column(String(10), nullable=False, default='ja')

    # Transcription information
    transcription_text = Column(Text, nullable=True)
    status = Column(SQLEnum(TranscriptionStatus), nullable=False, default=TranscriptionStatus.PROCESSING)
    error_message = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        Index('ix_transcription_jobs_status', 'status'),
        Index('ix_transcription_jobs_status_created_at', 'status', 'created_at'),
    )

    def __repr__(self):
        return f'<TranscriptionJob {self.id} - {self.original_filename} ({self.status})>'
