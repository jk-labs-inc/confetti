python
"""Opinion‑Market API – production‑ready FastAPI router.

Provides a secure, well‑typed, fully logged, and fully validated FastAPI router
for managing opinions (items) with in‑memory storage. The implementation follows
clean‑code best practices, comprehensive error handling, and performance‑aware
asynchronous design.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Request,
    status,
)
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field, ValidationError, validator

# --------------------------------------------------------------------------- #
# Logging configuration (application should configure handlers globally)
# --------------------------------------------------------------------------- #
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Security – simple API‑key header validation
# --------------------------------------------------------------------------- #
API_KEY_NAME = "X-API-KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


def verify_api_key(api_key: Optional[str] = Depends(api_key_header)) -> None:
    """
    Validate the supplied API key.

    Args:
        api_key: API key extracted from request headers.

    Raises:
        HTTPException: If the API key is missing, malformed, or invalid.
    """
    if api_key is None:
        logger.warning("Missing API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required",
        )
    if not isinstance(api_key, str) or len(api_key) < 10:
        logger.warning("Malformed API key: %s", api_key)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed API key",
        )
    # In a real system, replace this with a secure lookup
    if api_key != "super-secret-key":
        logger.warning("Invalid API key: %s", api_key)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )
    logger.debug("API key validated successfully")


# --------------------------------------------------------------------------- #
# Request/Response models
# --------------------------------------------------------------------------- #
class OpinionCreateRequest(BaseModel):
    """Schema for creating an opinion (item)."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Opinion title",
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional opinion description",
    )
    price: float = Field(
        ...,
        gt=0,
        description="Opinion price in USD",
    )

    @validator("price")
    def _validate_price(cls, value: float) -> float:
        """
        Ensure price is a finite number.

        Args:
            value: The price to validate.

        Returns:
            The original price if valid.

        Raises:
            ValueError: If the price is NaN or infinite.
        """
        if not (value == value and value != float("inf") and value != float("-inf")):
            raise ValueError("Price must be a finite number")
        return value


class OpinionResponse(BaseModel):
    """Schema for opinion response."""

    id: int
    name: str
    description: Optional[str]
    price: float


# --------------------------------------------------------------------------- #
# Router definition
# --------------------------------------------------------------------------- #
router = APIRouter()
__all__: list[str] = ["router"]


# --------------------------------------------------------------------------- #
# Thread‑safe in‑memory storage (placeholder for a real persistence layer)
# --------------------------------------------------------------------------- #
class OpinionStore:
    """In‑memory storage for opinions with async‑safe operations."""

    def __init__(self) -> None:
        self._store: Dict[int, OpinionResponse] = {}
        self._next_id: int = 1
        self._lock = asyncio.Lock()

    async def generate_id(self) -> int:
        """Generate a new unique identifier in a thread‑safe manner."""
        async with self._lock:
            opinion_id = self._next_id
            self._next_id += 1
        logger.debug("Generated new opinion id: %d", opinion_id)
        return opinion_id

    async def add(self, opinion: OpinionResponse) -> None:
        """Store an opinion."""
        async with self._lock:
            self._store[opinion.id] = opinion
        logger.info("Opinion %d stored", opinion.id)

    async def get(self, opinion_id: int) -> OpinionResponse:
        """Retrieve an opinion by id.

        Args:
            opinion_id: Identifier of the opinion to retrieve.

        Returns:
            OpinionResponse: The stored opinion.

        Raises:
            KeyError: If the opinion does not exist.
        """
        async with self._lock:
            try:
                opinion = self._store[opinion_id]
                logger.debug("Opinion %d fetched from store", opinion_id)
                return opinion
            except KeyError as exc:
                logger.warning("Opinion %d not found", opinion_id)
                raise exc


_opinion_store = OpinionStore()


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #
@router.post(
    "/opinions",
    response_model=OpinionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new opinion",
    tags=["opinions"],
)
async def create_opinion(
    request: Request,
    payload: OpinionCreateRequest,
    _: None = Depends(verify_api_key),
) -> OpinionResponse:
    """
    Create a new opinion after validating the request body.

    Args:
        request: FastAPI request object (used for logging request metadata).
        payload: Validated request payload.
        _: Dependency placeholder for API‑key verification.

    Returns:
        OpinionResponse: The created opinion with a generated identifier.

    Raises:
        HTTPException: If validation fails or an unexpected error occurs.
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.info("Create opinion request from %s", client_ip)

    try:
        opinion_id = await _opinion_store.generate_id()
        opinion = OpinionResponse(
            id=opinion_id,
            name=payload.name,
            description=payload.description,
            price=payload.price,
        )
        await _opinion_store.add(opinion)
        logger.info("Opinion %d created successfully", opinion_id)
        return opinion
    except ValidationError as ve:
        logger.warning("Payload validation error: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ve.errors(),
        ) from ve
    except ValueError as ve:
        logger.warning("Invalid payload data: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        ) from ve
    except Exception as exc:  # pragma: no cover – defensive catch‑all
        logger.error("Failed to create opinion: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create opinion",
        ) from exc


@router.get(
    "/opinions/{opinion_id}",
    response_model=OpinionResponse,
    summary="Retrieve an opinion by ID",
    tags=["opinions"],
)
async def get_opinion(
    opinion_id: int = Path(..., gt=0, description="Positive opinion identifier"),
    _: None = Depends(verify_api_key),
) -> OpinionResponse:
    """
    Retrieve a stored opinion.

    Args:
        opinion_id: Identifier of the opinion to retrieve; must be a positive integer.
        _: Dependency placeholder for API‑key verification.

    Returns:
        OpinionResponse: The requested opinion.

    Raises:
        HTTPException: If the opinion does not exist or an unexpected error occurs.
    """
    logger.debug("Fetching opinion with id %d", opinion_id)
    try:
        opinion = await _opinion_store.get(opinion_id)
        logger.info("Opinion %d retrieved successfully", opinion_id)
        return opinion
    except KeyError:
        logger.warning("Opinion %d not found", opinion_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Opinion with id {opinion_id} not found",
        )
    except Exception as exc:  # pragma: no cover – defensive catch‑all
        logger.error("Failed to retrieve opinion %d: %s", opinion_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve opinion",
        ) from exc
