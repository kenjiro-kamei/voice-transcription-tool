#!/bin/bash

# Backend Setup Script

set -e

echo "========================================="
echo "Backend Setup for Voice Transcription Tool"
echo "========================================="

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check environment variables
echo "Checking environment variables..."
if [ ! -f "../.env.local" ]; then
    echo "Error: .env.local not found in project root"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

echo "Environment variables found"

# Run Alembic migrations
echo "Running database migrations..."
alembic upgrade head

echo "========================================="
echo "Setup completed successfully!"
echo "========================================="
echo ""
echo "To start the server, run:"
echo "  source venv/bin/activate"
echo "  uvicorn src.main:app --reload --host 0.0.0.0 --port 8567"
echo ""
echo "To start Celery worker (in another terminal):"
echo "  source venv/bin/activate"
echo "  celery -A src.celery_app worker --loglevel=info"
