"""
Integration test for health check endpoint.
"""

import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint returns 200 OK."""
    response = client.get('/api/health')
    assert response.status_code == 200

    data = response.json()
    assert data['status'] == 'healthy'
    assert data['database'] == 'connected'
    assert 'timestamp' in data


def test_root_endpoint():
    """Test root endpoint returns API info."""
    response = client.get('/')
    assert response.status_code == 200

    data = response.json()
    assert data['message'] == 'Voice Transcription Tool API'
    assert data['version'] == '1.0.0'
    assert data['health_check'] == '/api/health'
