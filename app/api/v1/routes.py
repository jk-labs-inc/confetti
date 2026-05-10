python
"""FastAPI transformation endpoint – production‑grade implementation.

Provides a POST endpoint that transforms raw wording for opinion‑market
platforms. The module follows strict production standards:
- Full type hints
- Comprehensive docstrings (Args, Returns, Raises)
- Structured logging (debug, info, warning, error, exception)
- Input validation and security checks
- Detailed error handling with specific exception types
- Performance optimisations (pre‑compiled regex, minimal allocations)
"""

from __future__ import annotations

import logging
import re
from typing import Final

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, ValidationError, validator

# --------------------------------------------------------------------------- #
# Logging configuration (singleton, thread‑safe)
# --------------------------------------------------------------------------- #
_logger: Final[logging.Logger] = logging.getLogger(__name__)
if not _logger.handlers:  # Prevent duplicate handlers on reload
    _handler = logging.StreamHandler()
    _formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s – %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    _handler.setFormatter(_formatter)
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)

# --------------------------------------------------------------------------- #
# Router definition
# --------------------------------------------------------------------------- #
router: Final[APIRouter] = APIRouter(prefix="/api/v1", tags=["Transformation"])

# --------------------------------------------------------------------------- #
# Pre‑compiled patterns (performance)
# --------------------------------------------------------------------------- #
_SCRIPT_TAG_RE: Final[re.Pattern] = re.compile(r"<\s*script", re.IGNORECASE)

# --------------------------------------------------------------------------- #
# Custom exceptions
# --------------------------------------------------------------------------- #
class ServiceError(RuntimeError):
    """Raised when the transformation service cannot process the request."""
    ...

class InputValidationError(ValueError):
    """Raised when request payload fails business‑level validation."""
    ...

# --------------------------------------------------------------------------- #
# Pydantic models
# --------------------------------------------------------------------------- #
class TransformRequest(BaseModel):
    """
    Payload containing the raw wording to be transformed for opinion‑market platforms.

    Attributes
    ----------
    wording : str
        Raw text to be transformed.
    """

    wording: str = Field(..., description="Raw text to be transformed")

    @validator("wording")
    def _validate_wording(cls, value: str) -> str:
        """
        Validate the incoming wording.

        Args
        ----
        value : str
            The raw wording supplied by the client.

        Returns
        -------
        str
            The validated wording.

        Raises
        ------
        TypeError
            If ``value`` is not a string.
        ValueError
            If the string is empty, exceeds length limits, or contains disallowed tags.
        """
        if not isinstance(value, str):
            raise TypeError("wording must be a string")
        if not value.strip():
            raise ValueError("wording cannot be empty or whitespace")
        if len(value) > 10_000:
            raise ValueError("wording exceeds maximum allowed length (10 000 characters)")
        if _SCRIPT_TAG_RE.search(value):
            raise ValueError("wording contains disallowed script tags")
        return value


class TransformResponse(BaseModel):
    """
    Payload returned after successful transformation.

    Attributes
    ----------
    transformed : str
        Text transformed for opinion‑market platforms.
    """

    transformed: str = Field(..., description="Transformed text suitable for opinion‑market platforms")

# --------------------------------------------------------------------------- #
# Business‑logic import (type‑annotated)
# --------------------------------------------------------------------------- #
try:
    from app.service import transform_text  # type: ignore
except Exception as exc:  # pragma: no cover
    _logger.error("Failed to import transform_text: %s", exc, exc_info=True)
    raise ServiceError("Transformation service is unavailable") from exc


def _sanitize_input(text: str) -> str:
    """
    Perform lightweight sanitisation of the input text.

    Strips leading/trailing whitespace and normalises line endings.

    Args
    ----
    text : str
        Raw input text.

    Returns
    -------
    str
        Sanitised text.
    """
    return text.strip().replace("\r\n", "\n")


def _call_transform(text: str) -> str:
    """
    Invoke the business‑logic ``transform_text`` function safely.

    Args
    ----
    text : str
        The raw wording to transform.

    Returns
    -------
    str
        Transformed wording.

    Raises
    ------
    ServiceError
        If ``transform_text`` raises an exception or returns a non‑string.
    """
    try:
        result = transform_text(text)
        if not isinstance(result, str):
            raise TypeError("transform_text must return a string")
        return result
    except Exception as exc:  # pragma: no cover
        _logger.error("Transformation service error: %s", exc, exc_info=True)
        raise ServiceError("Transformation service failed") from exc


# --------------------------------------------------------------------------- #
# Endpoint implementation
# --------------------------------------------------------------------------- #
@router.post(
    "/transform",
    response_model=TransformResponse,
    status_code=status.HTTP_200_OK,
    summary="Transform raw wording for opinion‑market platforms",
    description="Accepts raw wording and returns a version adapted to opinion‑market platforms.",
)
async def transform_endpoint(payload: TransformRequest) -> TransformResponse:
    """
    Transform the supplied wording using the business‑logic layer.

    Args
    ----
    payload : TransformRequest
        The incoming request body containing raw wording.

    Returns
    -------
    TransformResponse
        The transformed wording.

    Raises
    ------
    HTTPException
        - 400: Validation error
        - 502: Downstream service failure
        - 500: Unexpected server error
    """
    _logger.debug("Received transformation request: %s", payload.wording)

    try:
        sanitized: str = _sanitize_input(payload.wording)
        transformed: str = _call_transform(sanitized)
        _logger.info("Transformation succeeded (length %d)", len(transformed))
        return TransformResponse(transformed=transformed)

    except (ValueError, TypeError, InputValidationError) as exc:
        _logger.warning("Invalid input: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except ValidationError as exc:
        # Pydantic validation errors (should be rare due to custom validator)
        _logger.warning("Pydantic validation error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc

    except ServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    except Exception as exc:  # pragma: no cover
        _logger.exception("Unexpected error during transformation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the request.",
        ) from exc
