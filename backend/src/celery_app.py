"""
Celery configuration for asynchronous task processing.
"""

from celery import Celery

from src.config import settings

# Create Celery app
celery_app = Celery(
    'transcription_tasks',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    task_soft_time_limit=3300,  # 55 minutes soft limit
)

# Auto-discover tasks from tasks module
celery_app.autodiscover_tasks(['src.tasks'])
