python
"""
Opinion‑market text transformation module.

Provides a production‑ready API that validates input, sanitises content,
applies a lightweight linguistic transformation, and returns a typed response.
"""

from __future__ import annotations

import logging
import re
from typing import Final, Literal, Mapping, Sequence, List

from pydantic import BaseModel, Field, ValidationError, validator

# --------------------------------------------------------------------------- #
# Logging configuration – adjust as needed for the production environment.
# --------------------------------------------------------------------------- #
_logger: logging.Logger = logging.getLogger(__name__)
if not _logger.handlers:
    _handler = logging.StreamHandler()
    _formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    _handler.setFormatter(_formatter)
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)

# --------------------------------------------------------------------------- #
# Constants
# --------------------------------------------------------------------------- #
_MAX_WORDING_LENGTH: Final[int] = 10_000  # Prevent excessively large payloads.
_DISALLOWED_PATTERNS: Final[re.Pattern] = re.compile(r"[<>]")  # Simple HTML/JS injection guard.
_CTRL_CHAR_PATTERN: Final[re.Pattern] = re.compile(r"[\x00-\x1F\x7F]")  # Control characters.

# Pre‑compile pronoun patterns for performance.
_PRONOUN_PATTERNS: Final[Mapping[re.Pattern, str]] = {
    re.compile(r"\byou\b", flags=re.IGNORECASE): "one",
    re.compile(r"\byour\b", flags=re.IGNORECASE): "one's",
    re.compile(r"\byours\b", flags=re.IGNORECASE): "one's",
    re.compile(r"\byourselves\b", flags=re.IGNORECASE): "oneself",
}
_SENTENCE_SPLIT_PATTERN: Final[re.Pattern] = re.compile(r"(?<=[.!?])\s+")

# --------------------------------------------------------------------------- #
# Custom exceptions
# --------------------------------------------------------------------------- #
class TransformationError(RuntimeError):
    """Raised when the transformation process fails."""


class UnsupportedMarketError(ValueError):
    """Raised when an unsupported target market is supplied."""


# --------------------------------------------------------------------------- #
# Data models
# --------------------------------------------------------------------------- #
class TransformRequest(BaseModel):
    """
    Request model for text transformation.

    Attributes
    ----------
    wording : str
        Original text that should be adapted for opinion‑market platforms.
    target_market : Literal["opinion"] | None
        Target market identifier; defaults to ``"opinion"``.
    """

    wording: str = Field(..., description="Original text to be transformed")
    target_market: Literal["opinion"] | None = Field(
        default="opinion",
        description="Identifier of the target market; currently only 'opinion' is supported",
    )

    @validator("wording")
    def _non_empty_wording(cls, value: str) -> str:
        """Ensure ``wording`` is not empty or whitespace‑only."""
        if not value.strip():
            raise ValueError("The 'wording' field must not be empty")
        return value

    @validator("wording")
    def _max_length(cls, value: str) -> str:
        """Enforce a maximum length to protect against DoS attacks."""
        if len(value) > _MAX_WORDING_LENGTH:
            raise ValueError(
                f"The 'wording' field exceeds the maximum allowed length of {_MAX_WORDING_LENGTH}"
            )
        return value

    @validator("wording")
    def _no_malicious_content(cls, value: str) -> str:
        """Reject obvious HTML/JS injection attempts and control characters."""
        if _DISALLOWED_PATTERNS.search(value):
            raise ValueError("The 'wording' field contains disallowed characters")
        if _CTRL_CHAR_PATTERN.search(value):
            raise ValueError("The 'wording' field contains control characters")
        return value


class TransformResponse(BaseModel):
    """
    Response model containing the transformed text.

    Attributes
    ----------
    transformed_text : str
        Text adapted for the opinion‑market format.
    original_wording : str
        Echo of the original input text.
    """

    transformed_text: str = Field(..., description="Text adapted for opinion‑market platforms")
    original_wording: str = Field(..., description="Original input text")

    @classmethod
    def from_request(cls, request: TransformRequest, transformed: str) -> "TransformResponse":
        """
        Factory method to create a response from a request and transformed result.

        Parameters
        ----------
        request : TransformRequest
            The original request data.
        transformed : str
            The result of the transformation process.

        Returns
        -------
        TransformResponse
            Populated response instance.

        Raises
        ------
        ValidationError
            If the response model cannot be instantiated.
        """
        try:
            return cls(transformed_text=transformed, original_wording=request.wording)
        except ValidationError as exc:
            _logger.error("Failed to build TransformResponse: %s", exc)
            raise


# --------------------------------------------------------------------------- #
# Core transformation logic
# --------------------------------------------------------------------------- #
def _apply_opinion_market_style(text: str) -> str:
    """
    Apply a lightweight transformation that makes the text suitable for opinion‑market
    platforms. The implementation performs three simple adjustments:

    1. Replace second‑person pronouns with third‑person equivalents.
    2. Normalise whitespace.
    3. Capitalise the first character of each sentence.

    Parameters
    ----------
    text : str
        The original text.

    Returns
    -------
    str
        The transformed text.

    Raises
    ------
    re.error
        If a regular‑expression operation fails.
    """
    transformed: str = text

    # 1️⃣ Replace second‑person pronouns.
    for pattern, replacement in _PRONOUN_PATTERNS.items():
        transformed = pattern.sub(replacement, transformed)

    # 2️⃣ Normalise whitespace.
    transformed = re.sub(r"\s+", " ", transformed).strip()

    # 3️⃣ Capitalise the first character of each sentence.
    sentences: List[str] = _SENTENCE_SPLIT_PATTERN.split(transformed)
    capitalised: List[str] = [
        s[:1].upper() + s[1:] if s else "" for s in sentences
    ]

    result: str = " ".join(capitalised)
    _logger.debug("Applied opinion market style: %s", result)
    return result


def transform_text(request: TransformRequest) -> TransformResponse:
    """
    Public API to transform ``wording`` into the opinion‑market format.

    Parameters
    ----------
    request : TransformRequest
        Validated request containing the original text and target market.

    Returns
    -------
    TransformResponse
        Response containing the transformed text and a copy of the original.

    Raises
    ------
    UnsupportedMarketError
        If an unsupported ``target_market`` is supplied.
    TransformationError
        For unexpected errors during transformation.
    """
    _logger.debug("Received transformation request: %s", request.json())

    if request.target_market != "opinion":
        error_msg = f"Unsupported target market: {request.target_market}"
        _logger.error(error_msg)
        raise UnsupportedMarketError(error_msg)

    try:
        transformed: str = _apply_opinion_market_style(request.wording)
        _logger.info(
            "Transformation succeeded (original length=%d, transformed length=%d)",
            len(request.wording),
            len(transformed),
        )
        return TransformResponse.from_request(request, transformed)
    except re.error as exc:
        _logger.exception("Regex processing error")
        raise TransformationError("Transformation failed due to regex error") from exc
    except ValidationError as exc:
        _logger.exception("Response validation error")
        raise TransformationError("Failed to build response") from exc
    except Exception as exc:  # pragma: no cover
        _logger.exception("Unexpected error during transformation")
        raise TransformationError("Unexpected transformation error") from exc
