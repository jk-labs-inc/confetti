import logging
from typing import Any, Dict

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Adjust import path according to project layout
from app.main import app  # noqa: E402

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Create a synchronous TestClient for the FastAPI application."""
    return TestClient(app)


@pytest.fixture(scope="module")
async def async_client() -> AsyncClient:
    """Create an asynchronous HTTPX client for the FastAPI application."""
    async with AsyncClient(app=app, base_url="http://testserver") as ac:
        yield ac


def _validate_response(response: Any, expected_key: str) -> Dict[str, Any]:
    """
    Validate the HTTP response and extract JSON payload.

    Args:
        response: The HTTP response object.
        expected_key: JSON key expected in the response body.

    Returns:
        Parsed JSON dictionary.

    Raises:
        AssertionError: If validation fails.
    """
    try:
        assert response.status_code == 200, f"Unexpected status {response.status_code}"
        payload = response.json()
        assert isinstance(payload, dict), "Response payload is not a JSON object"
        assert expected_key in payload, f"Missing key '{expected_key}' in response"
        return payload
    except Exception as exc:
        logger.error("Response validation failed: %s", exc)
        raise


def test_convert_endpoint_sync(client: TestClient) -> None:
    """
    Verify the synchronous conversion endpoint works as expected.

    The test sends a sample ``wording`` payload and checks that the
    returned JSON contains a ``converted`` field.
    """
    request_body: Dict[str, str] = {"wording": "transition to opinion markets"}
    try:
        response = client.post("/convert", json=request_body)
        payload = _validate_response(response, "converted")
        assert isinstance(payload["converted"], str), "Converted value is not a string"
        logger.info("Synchronous conversion succeeded")
    except Exception as exc:
        logger.exception("Synchronous conversion test failed")
        raise exc


@pytest.mark.asyncio
async def test_convert_endpoint_async(async_client: AsyncClient) -> None:
    """
    Verify the asynchronous conversion endpoint works as expected.

    The test sends a sample ``wording`` payload and checks that the
    returned JSON contains a ``converted`` field.
    """
    request_body: Dict[str, str] = {"wording": "transition to opinion markets"}
    try:
        response = await async_client.post("/convert", json=request_body)
        payload = _validate_response(response, "converted")
        assert isinstance(payload["converted"], str), "Converted value is not a string"
        logger.info("Asynchronous conversion succeeded")
    except Exception as exc:
        logger.exception("Asynchronous conversion test failed")
        raise exc