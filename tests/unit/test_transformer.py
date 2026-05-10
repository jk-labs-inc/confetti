import asyncio
import logging
from typing import Any, Dict

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Import the FastAPI application and the business logic function.
# Adjust the import paths according to your project structure.
from app.main import app  # FastAPI instance
from service.transformer import transform_wording  # Business logic

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@pytest.fixture(scope="module")
def event_loop() -> asyncio.AbstractEventLoop:
    """Create an event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="module")
async def async_client(event_loop: asyncio.AbstractEventLoop) -> httpx.AsyncClient:
    """Provide an async HTTP client for the FastAPI app."""
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        yield client


def _make_payload(wording: str) -> Dict[str, Any]:
    """Create a JSON payload for the transformer endpoint."""
    return {"wording": wording}


def _assert_response(response: httpx.Response, expected_status: int) -> None:
    """Validate common response attributes."""
    assert response.status_code == expected_status, f"Unexpected status {response.status_code}"
    logger.info("Response status %d: %s", response.status_code, response.text)


@pytest.mark.asyncio
async def test_transform_success(async_client: httpx.AsyncClient) -> None:
    """Typical case – valid wording is transformed correctly."""
    payload = _make_payload("transition to opinion markets")
    response = await async_client.post("/transform", json=payload)
    _assert_response(response, 200)

    data = response.json()
    assert "result" in data
    assert isinstance(data["result"], str)
    assert data["result"] != payload["wording"]


@pytest.mark.asyncio
async def test_transform_empty_input(async_client: httpx.AsyncClient) -> None:
    """Edge case – empty string should be handled gracefully."""
    payload = _make_payload("")
    response = await async_client.post("/transform", json=payload)
    _assert_response(response, 200)

    data = response.json()
    assert data["result"] == ""


@pytest.mark.asyncio
async def test_transform_missing_field(async_client: httpx.AsyncClient) -> None:
    """Error case – request without required field should return 422."""
    response = await async_client.post("/transform", json={})
    _assert_response(response, 422)


@pytest.mark.asyncio
async def test_transform_malformed_json(async_client: httpx.AsyncClient) -> None:
    """Error case – malformed JSON payload should return 422."""
    malformed = "not a json"
    response = await async_client.post("/transform", content=malformed, headers={"Content-Type": "application/json"})
    _assert_response(response, 422)


@pytest.mark.asyncio
async def test_transform_internal_error(monkeypatch: pytest.MonkeyPatch, async_client: httpx.AsyncClient) -> None:
    """Simulate an unexpected exception in the business logic."""

    def _raise(*args: Any, **kwargs: Any) -> str:
        raise RuntimeError("Simulated failure")

    monkeypatch.setattr(service.transformer, "transform_wording", _raise)

    payload = _make_payload("transition to opinion markets")
    response = await async_client.post("/transform", json=payload)
    _assert_response(response, 500)

    data = response.json()
    assert data.get("detail") == "Internal Server Error"