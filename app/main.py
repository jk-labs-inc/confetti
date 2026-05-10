python
# -*- coding: utf-8 -*-
"""
Opinion Market Converter – production‑ready FastAPI service.

The service receives plain text and returns a JSON payload suitable for
opinion‑market platforms.  It demonstrates comprehensive production‑grade
practices:
* Structured logging with rotating file handler
* Request size limiting
* Detailed exception handling
* Pydantic validation and security checks
* Full type hints and docstrings
* Async implementation for high concurrency
"""

from __future__ import annotations

import os
import sys
import logging
import logging.handlers
from pathlib import Path
from typing import Any, List, Optional

import uvicorn
from fastapi import (
    FastAPI,
    Request,
    HTTPException,
    status,
    APIRouter,
    Body,
)
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

# --------------------------------------------------------------------------- #
# Constants & Configuration
# --------------------------------------------------------------------------- #
LOGGER_NAME: str = "opinion_market_converter"
DEFAULT_LOG_PATH: Path = Path("/var/log/opinion_market_converter/app.log")
LOG_FILE_PATH: Path = Path(
    os.getenv("LOG_FILE_PATH", str(DEFAULT_LOG_PATH))
).expanduser()
MAX_LOG_SIZE: int = 10 * 1024 * 1024  # 10 MiB
BACKUP_COUNT: int = 5
MAX_REQUEST_SIZE: int = int(os.getenv("MAX_REQUEST_SIZE", "1048576"))  # 1 MiB
CORS_ORIGINS: List[str] = [
    origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()
]

# --------------------------------------------------------------------------- #
# Logger Setup
# --------------------------------------------------------------------------- #
def _configure_logging() -> None:
    """
    Initialise a rotating file logger and a console handler.

    The logger is attached to ``LOGGER_NAME`` and set to ``INFO`` by default.
    ``uvicorn.error`` and ``uvicorn.access`` inherit the same level for
    consistency across the application stack.
    """
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Ensure log directory exists
    LOG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)

    file_handler = logging.handlers.RotatingFileHandler(
        filename=LOG_FILE_PATH,
        maxBytes=MAX_LOG_SIZE,
        backupCount=BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    # Reset handlers to avoid duplicate logs on reload
    logger.handlers.clear()
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    # Align uvicorn loggers
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)


# --------------------------------------------------------------------------- #
# Global Logger
# --------------------------------------------------------------------------- #
logger: logging.Logger = logging.getLogger(LOGGER_NAME)


# --------------------------------------------------------------------------- #
# Middleware – Request Size Limiter
# --------------------------------------------------------------------------- #
class RequestSizeLimiter(BaseHTTPMiddleware):
    """
    Abort requests that exceed ``MAX_REQUEST_SIZE`` and log the event.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Validate the ``Content‑Length`` header before delegating to the next
        handler.

        Args:
            request: Incoming FastAPI request.
            call_next: Callable that forwards the request to the downstream
                handler.

        Returns:
            ``Response`` – either a ``413`` error or the normal response.
        """
        content_length: Optional[str] = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
                if length > MAX_REQUEST_SIZE:
                    logger.warning(
                        "Request rejected: %d bytes exceeds limit %d bytes",
                        length,
                        MAX_REQUEST_SIZE,
                    )
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={"detail": "Request payload too large"},
                    )
            except ValueError:
                logger.error("Invalid Content‑Length header: %s", content_length)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Content‑Length header",
                )
        return await call_next(request)


# --------------------------------------------------------------------------- #
# Pydantic Models
# --------------------------------------------------------------------------- #
class ConvertRequest(BaseModel):
    """
    Input model for the conversion endpoint.

    Attributes:
        text: The raw text to be transformed for opinion‑market platforms.
    """

    text: str = Field(..., min_length=1, max_length=10_000)

    @validator("text")
    def _sanitize_text(cls, value: str) -> str:
        """
        Basic sanitisation – strip leading/trailing whitespace and reject
        control characters that could be used for injection attacks.

        Args:
            value: Raw input string.

        Returns:
            Sanitised string.

        Raises:
            ValueError: If prohibited characters are detected.
        """
        sanitized = value.strip()
        if any(ord(ch) < 32 and ch not in ("\n", "\r", "\t") for ch in sanitized):
            raise ValueError("Control characters are not allowed.")
        return sanitized


class ConvertResponse(BaseModel):
    """
    Output model for the conversion endpoint.

    Attributes:
        converted: The transformed representation ready for opinion‑market
            consumption.
    """

    converted: str


# --------------------------------------------------------------------------- #
# Router & Endpoints
# --------------------------------------------------------------------------- #
router = APIRouter()


@router.post(
    "/convert",
    response_model=ConvertResponse,
    status_code=status.HTTP_200_OK,
    summary="Convert text for opinion‑market platforms",
)
async def convert_text(payload: ConvertRequest = Body(...)) -> ConvertResponse:
    """
    Convert the supplied text into the format required by opinion‑market
    platforms.

    The function demonstrates defensive programming: it validates the input,
    logs the operation, and catches unexpected errors.

    Args:
        payload: Validated request payload.

    Returns:
        ConvertResponse containing the transformed text.

    Raises:
        HTTPException: If conversion fails due to unexpected conditions.
    """
    logger.debug("Received conversion request: %s", payload.text[:50])

    try:
        # Placeholder for the real conversion logic – replace with actual
        # implementation as needed.
        converted = _perform_conversion(payload.text)
        logger.info("Conversion successful")
        return ConvertResponse(converted=converted)
    except Exception as exc:  # pragma: no cover – defensive catch‑all
        logger.exception("Conversion failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to convert the supplied text",
        ) from exc


def _perform_conversion(text: str) -> str:
    """
    Core conversion routine.

    This stub simply returns the original text wrapped in a JSON‑compatible
    structure.  Replace with domain‑specific logic.

    Args:
        text: Sanitised input text.

    Returns:
        Converted representation as a string.
    """
    # Example transformation – make the text uppercase and trim whitespace.
    return text.upper().strip()


# --------------------------------------------------------------------------- #
# Exception Handlers
# --------------------------------------------------------------------------- #
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Convert :class:`HTTPException` into a JSON payload.

    Args:
        request: The request that triggered the exception.
        exc: The raised HTTPException.

    Returns:
        ``JSONResponse`` with the appropriate status code and detail.
    """
    logger.info(
        "HTTPException %s %s – %s",
        request.method,
        request.url.path,
        exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors.

    Args:
        request: The request that failed validation.
        exc: Validation error details.

    Returns:
        ``JSONResponse`` with status 422 and a structured error payload.
    """
    logger.warning(
        "Validation error %s %s: %s",
        request.method,
        request.url.path,
        exc.errors(),
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch‑all for unexpected errors.

    Args:
        request: The request that caused the exception.
        exc: The raised exception.

    Returns:
        ``JSONResponse`` with status 500 and a generic error message.
    """
    logger.exception("Unhandled exception during request processing")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# --------------------------------------------------------------------------- #
# Application Factory
# --------------------------------------------------------------------------- #
def create_app() -> FastAPI:
    """
    Construct and configure the FastAPI application.

    Returns:
        A fully‑initialised :class:`FastAPI` instance ready for deployment.
    """
    _configure_logging()

    app = FastAPI(
        title="Opinion Market Converter",
        description=(
            "Transition to opinion markets: convert input text into a format "
            "suitable for opinion‑market platforms."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS configuration – whitelist when not "*"
    cors_origins = CORS_ORIGINS or ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestSizeLimiter)

    # Register router
    app.include_router(router, prefix="/api/v1")

    # Register exception handlers
    app.exception_handler(HTTPException)(http_exception_handler)
    app.exception_handler(RequestValidationError)(validation_exception_handler)
    app.exception_handler(Exception)(generic_exception_handler)

    logger.info("FastAPI application created")
    return app


# --------------------------------------------------------------------------- #
# Entrypoint
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    # When executed directly, start the server with uvicorn.
    # Host and port can be overridden via environment variables.
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:create_app",
        host=host,
        port=port,
        log_config=None,  # Use our own logger configuration
        reload=False,
    )
