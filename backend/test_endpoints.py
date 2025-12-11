#!/usr/bin/env python3
"""
Manual test script for transcription endpoints.
This script requires the backend server to be running.
"""

import sys
import requests
from uuid import uuid4

# Configuration
BASE_URL = 'http://localhost:8567/api'

def test_get_status_not_found():
    """Test GET /transcriptions/{job_id}/status with non-existent job."""
    print('\n=== Test 1: GET /transcriptions/{job_id}/status (404) ===')

    job_id = uuid4()
    response = requests.get(f'{BASE_URL}/transcriptions/{job_id}/status')

    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')

    assert response.status_code == 404, f'Expected 404, got {response.status_code}'
    assert response.json()['detail'] == 'Transcription not found'
    print('✓ Test passed')


def test_get_transcription_not_found():
    """Test GET /transcriptions/{job_id} with non-existent job."""
    print('\n=== Test 2: GET /transcriptions/{job_id} (404) ===')

    job_id = uuid4()
    response = requests.get(f'{BASE_URL}/transcriptions/{job_id}')

    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')

    assert response.status_code == 404, f'Expected 404, got {response.status_code}'
    assert response.json()['detail'] == 'Transcription not found'
    print('✓ Test passed')


def test_delete_not_found():
    """Test DELETE /transcriptions/{job_id} with non-existent job."""
    print('\n=== Test 3: DELETE /transcriptions/{job_id} (404) ===')

    job_id = uuid4()
    response = requests.delete(f'{BASE_URL}/transcriptions/{job_id}')

    print(f'Status: {response.status_code}')
    print(f'Response: {response.text if response.text else "(empty)"}')

    assert response.status_code == 404, f'Expected 404, got {response.status_code}'
    assert response.json()['detail'] == 'Transcription not found'
    print('✓ Test passed')


def test_invalid_uuid():
    """Test with invalid UUID format."""
    print('\n=== Test 4: GET with invalid UUID (422) ===')

    response = requests.get(f'{BASE_URL}/transcriptions/invalid-uuid/status')

    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')

    assert response.status_code == 422, f'Expected 422, got {response.status_code}'
    print('✓ Test passed')


def main():
    """Run all tests."""
    print('========================================')
    print('Testing Transcription Endpoints')
    print('========================================')
    print(f'Base URL: {BASE_URL}')

    # Check if server is running
    try:
        response = requests.get(f'{BASE_URL}/health', timeout=5)
        print(f'\n✓ Server is running (status: {response.status_code})')
    except requests.exceptions.RequestException as e:
        print(f'\n✗ Server is not running: {e}')
        print('\nPlease start the server first:')
        print('  cd /home/kamei/test/backend')
        print('  source venv/bin/activate')
        print('  uvicorn src.main:app --reload --host 0.0.0.0 --port 8567')
        sys.exit(1)

    # Run tests
    try:
        test_get_status_not_found()
        test_get_transcription_not_found()
        test_delete_not_found()
        test_invalid_uuid()

        print('\n========================================')
        print('All tests passed! ✓')
        print('========================================')

    except AssertionError as e:
        print(f'\n✗ Test failed: {e}')
        sys.exit(1)
    except Exception as e:
        print(f'\n✗ Unexpected error: {e}')
        sys.exit(1)


if __name__ == '__main__':
    main()
