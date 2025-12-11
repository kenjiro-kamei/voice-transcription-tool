"""
FastAPI main application.
"""

import logging
import signal
import sys
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from src.config import settings
from src.routers import health, transcription

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

logger = logging.getLogger(__name__)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        # CSP - Allow self and configured origins
        # Note: CSP is primarily for the frontend, backend API doesn't need strict CSP
        # Keeping minimal CSP for API responses
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "font-src 'self'; "
            "connect-src 'self' *"
        )
        # HSTS - Enable in production only (requires HTTPS)
        if settings.ENVIRONMENT == 'production':
            response.headers['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains'
            )
        return response


# Graceful shutdown handler
shutdown_event = False


def handle_sigterm(signum, frame):
    """Handle SIGTERM signal for graceful shutdown."""
    global shutdown_event
    logger.info('Received SIGTERM, initiating graceful shutdown...')
    shutdown_event = True


signal.signal(signal.SIGTERM, handle_sigterm)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    logger.info('Starting application...')
    yield
    logger.info('Shutting down application...')


# Create FastAPI app
app = FastAPI(
    title='Voice Transcription Tool API',
    description='Backend API for audio/video transcription service',
    version='1.0.0',
    lifespan=lifespan,
)

# Add Security Headers Middleware (must be added before CORS)
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled exceptions.
    Logs the error and returns a safe error response.
    """
    # Generate a unique error ID for tracking
    import uuid
    error_id = str(uuid.uuid4())[:8]

    # Log the full error with traceback
    logger.error(
        f'Unhandled exception [error_id={error_id}] '
        f'path={request.url.path} method={request.method}: {exc}',
        exc_info=True,
    )

    # Return a safe error response (don't expose internal details)
    return JSONResponse(
        status_code=500,
        content={
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred. Please try again later.',
            'error_id': error_id,
        },
    )


# Include routers
app.include_router(health.router, prefix='/api', tags=['health'])
app.include_router(transcription.router, prefix='/api', tags=['transcription'])


@app.get('/')
def root():
    """Root endpoint."""
    return {
        'message': 'Voice Transcription Tool API',
        'version': '1.0.0',
        'health_check': '/api/health',
    }
