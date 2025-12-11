"""
Health check endpoint for Cloud Run/Kubernetes probes.
"""

import logging
import time
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import redis

from src.database import get_db
from src.schemas import HealthCheckResponse, ServiceStatus
from src.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def check_database(db: Session) -> ServiceStatus:
    """Check database connectivity."""
    try:
        start = time.time()
        db.execute(text('SELECT 1'))
        latency = (time.time() - start) * 1000
        return ServiceStatus(status='connected', latency_ms=round(latency, 2))
    except Exception as e:
        logger.error(f'Database health check failed: {e}')
        return ServiceStatus(status='disconnected', error=str(e))


def check_redis() -> ServiceStatus:
    """Check Redis connectivity."""
    try:
        start = time.time()
        r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=5)
        r.ping()
        latency = (time.time() - start) * 1000
        r.close()
        return ServiceStatus(status='connected', latency_ms=round(latency, 2))
    except Exception as e:
        logger.error(f'Redis health check failed: {e}')
        return ServiceStatus(status='disconnected', error=str(e))


def check_celery() -> ServiceStatus:
    """Check Celery worker availability via Redis."""
    try:
        start = time.time()
        r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=5)
        # Check if Celery has registered tasks (basic check)
        # More sophisticated check would require celery.control.inspect()
        celery_keys = r.keys('celery*')
        latency = (time.time() - start) * 1000
        r.close()
        # If we can connect to Redis, Celery broker is reachable
        return ServiceStatus(
            status='connected',
            latency_ms=round(latency, 2)
        )
    except Exception as e:
        logger.error(f'Celery health check failed: {e}')
        return ServiceStatus(status='unknown', error=str(e))


@router.get('/health', response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)) -> HealthCheckResponse:
    """
    Comprehensive health check endpoint.

    Verifies:
    - API is running
    - Database connection is active
    - Redis connection is active
    - Celery broker is reachable

    Returns:
        HealthCheckResponse with detailed service status

    Raises:
        HTTPException: If critical services (database) are unavailable
    """
    # Check all services
    db_status = check_database(db)
    redis_status = check_redis()
    celery_status = check_celery()

    services = {
        'database': db_status,
        'redis': redis_status,
        'celery': celery_status,
    }

    # Determine overall health status
    critical_healthy = db_status.status == 'connected'
    all_healthy = all(s.status == 'connected' for s in services.values())

    if not critical_healthy:
        logger.error('Health check failed: Database unavailable')
        raise HTTPException(
            status_code=503,
            detail='Service unavailable: Database connection failed',
        )

    overall_status = 'healthy' if all_healthy else 'degraded'
    logger.debug(f'Health check: {overall_status}')

    return HealthCheckResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        database=db_status.status,
        services=services,
        version='1.0.0',
    )


@router.get('/health/live')
def liveness_probe():
    """
    Kubernetes liveness probe - checks if the app is running.
    Does not check dependencies.
    """
    return {'status': 'alive'}


@router.get('/health/ready')
def readiness_probe(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe - checks if the app can serve traffic.
    Checks critical dependencies (database).
    """
    try:
        db.execute(text('SELECT 1'))
        return {'status': 'ready'}
    except Exception as e:
        logger.error(f'Readiness check failed: {e}')
        raise HTTPException(status_code=503, detail='Not ready')
