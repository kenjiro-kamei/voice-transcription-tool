"""
Celery tasks package.
Contains all asynchronous task definitions.
"""

from src.tasks.transcription_task import process_transcription

__all__ = ['process_transcription']
