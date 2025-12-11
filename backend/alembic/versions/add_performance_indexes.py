"""Add performance indexes for transcription_jobs

Revision ID: add_perf_indexes
Revises: c28d8a4dea46
Create Date: 2025-12-11 21:00:00.000000

This migration adds indexes for:
- status column (frequently filtered)
- created_at column (frequently sorted)
- status + created_at composite index (history queries)
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_perf_indexes'
down_revision = 'c28d8a4dea46'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add performance indexes."""
    # Index on status column (used for filtering by status)
    op.create_index(
        'ix_transcription_jobs_status',
        'transcription_jobs',
        ['status']
    )

    # Index on created_at column (used for sorting by date)
    op.create_index(
        'ix_transcription_jobs_created_at',
        'transcription_jobs',
        ['created_at']
    )

    # Composite index on status + created_at (used for history queries)
    # e.g., SELECT * FROM transcription_jobs WHERE status = 'COMPLETED' ORDER BY created_at DESC
    op.create_index(
        'ix_transcription_jobs_status_created_at',
        'transcription_jobs',
        ['status', 'created_at']
    )


def downgrade() -> None:
    """Remove performance indexes."""
    op.drop_index('ix_transcription_jobs_status_created_at', table_name='transcription_jobs')
    op.drop_index('ix_transcription_jobs_created_at', table_name='transcription_jobs')
    op.drop_index('ix_transcription_jobs_status', table_name='transcription_jobs')
