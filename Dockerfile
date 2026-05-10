FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:${PATH}"

# Create a non‑root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies in a virtual environment
RUN python -m venv /app/.venv && \
    pip install --upgrade pip && \
    pip install --no-cache-dir fastapi>=0.110.0 uvicorn[standard]>=0.28.0 pydantic>=2.5.0 pytest>=8.0.0 httpx>=0.27.0 pytest-cov>=5.0.0

# Copy application source code
COPY . /app

# Adjust permissions
RUN chown -R appuser:appgroup /app

# Switch to non‑root user
USER appuser

# Expose the default FastAPI port
EXPOSE 8000

# Define healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]