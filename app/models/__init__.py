python
"""Opinion‑market conversion service – production‑grade implementation.

Provides:
- Typed request/response models (Pydantic).
- Secure JSON parsing with validation.
- Payload sanitisation and transformation.
- Comprehensive logging, error handling and input validation.
"""

from __future__ import annotations

import json
import logging
import re
from functools import lru_cache
from typing import Any, Dict, Literal, Mapping, MutableMapping

from pydantic import BaseModel, ValidationError, field_validator

# --------------------------------------------------------------------------- #
# Logging configuration (singleton per module)
# --------------------------------------------------------------------------- #
_logger = logging.getLogger(__name__)
if not _logger.handlers:  # avoid duplicate handlers in interactive sessions
    _handler = logging.StreamHandler()
    _formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    _handler.setFormatter(_formatter)
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)


# --------------------------------------------------------------------------- #
# Constants & compiled patterns (performance‑optimised)
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=1)
def _allowed_market_pattern() -> re.Pattern:
    """Return a compiled regex for validating market identifiers."""
    return re.compile(r"^[A-Za-z0-9_\-]{1,30}$")


_ALLOWED_COUNTRY_CODES = frozenset(
    {
        "US",
        "GB",
        "DE",
        "FR",
        "JP",
        "CN",
        "IN",
        "BR",
        "CA",
        "AU",
    }
)

_MAX_PAYLOAD_ITEMS = 500  # security limit
_PROHIBITED_KEYS = frozenset({"__proto__", "constructor", "prototype"})


# --------------------------------------------------------------------------- #
# Custom exception hierarchy
# --------------------------------------------------------------------------- #
class MarketConversionError(RuntimeError):
    """Base class for conversion‑related errors."""


class PayloadValidationError(MarketConversionError):
    """Raised when the payload fails security or size checks."""


# --------------------------------------------------------------------------- #
# Pydantic models
# --------------------------------------------------------------------------- #
class OpinionMarketRequest(BaseModel):
    """Validated request schema for the conversion endpoint."""

    market: str
    country: str
    payload: Mapping[str, Any]

    @field_validator("market")
    def _validate_market(cls, value: str) -> str:
        """Validate that the market identifier conforms to the allowed pattern."""
        if not _allowed_market_pattern().fullmatch(value):
            raise ValueError(
                f"Invalid market identifier '{value}'. "
                "Allowed: alphanumerics, hyphens, underscores (max 30 chars)."
            )
        return value

    @field_validator("country")
    def _validate_country(cls, value: str) -> str:
        """Validate ISO‑3166‑1 alpha‑2 country code against whitelist."""
        code = value.upper()
        if code not in _ALLOWED_COUNTRY_CODES:
            raise ValueError(f"Unsupported country code '{value}'.")
        return code


class OpinionMarketResponse(BaseModel):
    """Successful conversion response schema."""

    status: Literal["success"]
    market: str
    country: str
    transformed: Dict[str, Any]


# --------------------------------------------------------------------------- #
# Helper utilities
# --------------------------------------------------------------------------- #
def _sanitize_string(value: str) -> str:
    """Trim whitespace and remove control characters."""
    return value.strip()


def _validate_payload(payload: Mapping[str, Any]) -> None:
    """Enforce size limits and prohibit dangerous keys."""
    if len(payload) > _MAX_PAYLOAD_ITEMS:
        raise PayloadValidationError(
            f"Payload contains {len(payload)} items; exceeds limit of {_MAX_PAYLOAD_ITEMS}."
        )
    for key in payload:
        if key in _PROHIBITED_KEYS:
            raise PayloadValidationError(f"Prohibited key detected in payload: '{key}'.")


def _to_snake_case(name: str) -> str:
    """Convert CamelCase / PascalCase identifiers to snake_case."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


# --------------------------------------------------------------------------- #
# Core conversion logic (pure, testable)
# --------------------------------------------------------------------------- #
def _transform_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    """
    Apply domain‑specific sanitisation and key normalisation.

    Args:
        payload: Original data mapping.

    Returns:
        New dictionary with snake_case keys and sanitized string values.

    Raises:
        TypeError: If ``payload`` is not a mapping.
        PayloadValidationError: If payload violates security constraints.
    """
    if not isinstance(payload, Mapping):
        raise TypeError("Payload must be a mapping (dict‑like).")
    _validate_payload(payload)

    transformed: Dict[str, Any] = {}
    for key, value in payload.items():
        snake_key = _to_snake_case(key)
        if isinstance(value, str):
            transformed[snake_key] = _sanitize_string(value)
        else:
            transformed[snake_key] = value
    return transformed


def convert_market(request: OpinionMarketRequest) -> OpinionMarketResponse:
    """
    Convert a validated request into a structured response.

    Args:
        request: Instance of :class:`OpinionMarketRequest`.

    Returns:
        :class:`OpinionMarketResponse` with transformed payload.

    Raises:
        MarketConversionError: If an unexpected error occurs during transformation.
    """
    _logger.debug(
        "Starting conversion: market=%s, country=%s", request.market, request.country
    )
    try:
        transformed = _transform_payload(request.payload)
    except (PayloadValidationError, TypeError) as exc:
        _logger.error("Payload validation failed: %s", exc, exc_info=True)
        raise MarketConversionError("Payload validation error.") from exc
    except Exception as exc:  # pragma: no cover – defensive catch
        _logger.error("Unexpected error during payload transformation: %s", exc, exc_info=True)
        raise MarketConversionError("Failed to transform payload.") from exc

    response = OpinionMarketResponse(
        status="success",
        market=request.market,
        country=request.country,
        transformed=transformed,
    )
    _logger.info("Conversion successful for market %s", request.market)
    return response


# --------------------------------------------------------------------------- #
# Public API – safe JSON handling
# --------------------------------------------------------------------------- #
def _load_json(json_str: str) -> Dict[str, Any]:
    """
    Parse a JSON string safely.

    Args:
        json_str: Raw JSON payload.

    Returns:
        Parsed dictionary.

    Raises:
        json.JSONDecodeError: If the JSON is malformed.
    """
    _logger.debug("Parsing JSON input")
    return json.loads(json_str)


def process_request(json_input: str) -> str:
    """
    End‑to‑end processing of a raw JSON request.

    Steps:
    1. Parse JSON.
    2. Validate against :class:`OpinionMarketRequest`.
    3. Convert payload.
    4. Return JSON‑encoded response.

    Args:
        json_input: Raw JSON string from the client.

    Returns:
        JSON string of the successful response.

    Raises:
        ValueError: For malformed JSON or validation errors.
        MarketConversionError: For unexpected processing failures.
    """
    _logger.info("Received new request")
    try:
        raw_data = _load_json(json_input)
    except json.JSONDecodeError as exc:
        _logger.warning("Malformed JSON: %s", exc)
        raise ValueError("Malformed JSON.") from exc

    try:
        request = OpinionMarketRequest(**raw_data)  # type: ignore[arg-type]
    except ValidationError as exc:
        _logger.warning("Request validation failed: %s", exc)
        raise ValueError("Request validation error.") from exc
    except Exception as exc:  # pragma: no cover – defensive catch
        _logger.error("Unexpected error during request construction: %s", exc, exc_info=True)
        raise ValueError("Invalid request data.") from exc

    try:
        response = convert_market(request)
    except MarketConversionError as exc:
        _logger.error("Conversion failed: %s", exc)
        raise
    except Exception as exc:  # pragma: no cover – defensive catch
        _logger.error("Unexpected error during conversion: %s", exc, exc_info=True)
        raise MarketConversionError("Unexpected conversion failure.") from exc

    response_json = json.dumps(response.dict())
    _logger.debug("Response JSON generated")
    return response_json


# --------------------------------------------------------------------------- #
# Exported symbols (for static analysis / star imports)
# --------------------------------------------------------------------------- #
__all__ = [
    "OpinionMarketRequest",
    "OpinionMarketResponse",
    "process_request",
    "convert_market",
    "MarketConversionError",
    "PayloadValidationError",
]
