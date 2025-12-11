"""
Cloudflare R2 (S3-compatible) storage service.
Supports local file storage as fallback for development.
"""

import logging
import os
from pathlib import Path
from typing import BinaryIO

from src.config import settings

logger = logging.getLogger(__name__)

# Local storage directory for development
LOCAL_STORAGE_DIR = Path(__file__).parent.parent.parent / 'uploads'


def _is_r2_configured() -> bool:
    """Check if R2 credentials are properly configured."""
    return (
        settings.R2_ACCOUNT_ID
        and not settings.R2_ACCOUNT_ID.startswith('<')
        and settings.R2_ACCESS_KEY_ID
        and not settings.R2_ACCESS_KEY_ID.startswith('<')
    )


class LocalStorageService:
    """Local file storage service for development."""

    def __init__(self):
        """Initialize local storage directory."""
        self.storage_dir = LOCAL_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f'Using local storage: {self.storage_dir}')

    def upload_file(self, file_obj: BinaryIO, object_name: str) -> str:
        """Save file to local storage."""
        file_path = self.storage_dir / object_name
        with open(file_path, 'wb') as f:
            f.write(file_obj.read())
        file_url = f'file://{file_path.absolute()}'
        logger.info(f'File saved locally: {object_name}')
        return file_url

    def delete_file(self, object_name: str) -> None:
        """Delete file from local storage."""
        file_path = self.storage_dir / object_name
        if file_path.exists():
            file_path.unlink()
            logger.info(f'File deleted locally: {object_name}')
        else:
            logger.warning(f'File not found for deletion: {object_name}')

    def get_file_url(self, object_name: str) -> str:
        """Get local file path as URL."""
        file_path = self.storage_dir / object_name
        return f'file://{file_path.absolute()}'

    def get_file_content(self, object_name: str) -> bytes:
        """Read file content from local storage."""
        file_path = self.storage_dir / object_name
        with open(file_path, 'rb') as f:
            return f.read()


class R2Service:
    """Service for interacting with Cloudflare R2 storage."""

    def __init__(self):
        """Initialize R2 client with S3-compatible API."""
        import boto3

        self.bucket_name = settings.R2_BUCKET_NAME
        self.client = boto3.client(
            's3',
            endpoint_url=f'https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name='auto',
        )

    def upload_file(self, file_obj: BinaryIO, object_name: str) -> str:
        """Upload a file to R2."""
        from botocore.exceptions import ClientError

        try:
            self.client.upload_fileobj(file_obj, self.bucket_name, object_name)
            file_url = f'https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{self.bucket_name}/{object_name}'
            logger.info(f'File uploaded to R2: {object_name}')
            return file_url
        except ClientError as e:
            logger.error(f'Failed to upload file {object_name}: {e}')
            raise

    def delete_file(self, object_name: str) -> None:
        """Delete a file from R2."""
        from botocore.exceptions import ClientError

        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
            logger.info(f'File deleted from R2: {object_name}')
        except ClientError as e:
            logger.error(f'Failed to delete file {object_name}: {e}')
            raise

    def get_file_url(self, object_name: str) -> str:
        """Get the public URL for a file in R2."""
        return f'https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{self.bucket_name}/{object_name}'


# Global storage service instance - use local storage if R2 not configured
if _is_r2_configured():
    logger.info('Using Cloudflare R2 storage')
    r2_service = R2Service()
else:
    logger.info('R2 not configured, using local file storage')
    r2_service = LocalStorageService()
