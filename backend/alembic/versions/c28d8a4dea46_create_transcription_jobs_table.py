"""Create transcription_jobs table

Revision ID: c28d8a4dea46
Revises: 
Create Date: 2025-12-11 10:17:56.292856

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c28d8a4dea46'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'transcription_jobs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_url', sa.String(1024), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('language', sa.String(10), nullable=False, server_default='ja'),
        sa.Column('transcription_text', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('PROCESSING', 'COMPLETED', 'FAILED', name='transcriptionstatus'), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_transcription_jobs_id', 'transcription_jobs', ['id'])


def downgrade() -> None:
    op.drop_index('ix_transcription_jobs_id', table_name='transcription_jobs')
    op.drop_table('transcription_jobs')
    op.execute('DROP TYPE IF EXISTS transcriptionstatus')
