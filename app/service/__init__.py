"""Business‑logic utilities package.

This module marks the ``app.service`` package and provides a logger
that can be used by submodules within the package.
"""

import logging

# Configure a module‑level logger. Configuration (handlers, formatters, etc.)
# should be performed by the application entry point.
logger = logging.getLogger(__name__)

__all__: list[str] = []