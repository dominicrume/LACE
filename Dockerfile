FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (e.g. for psycopg2)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .
ENV PYTHONPATH=/app/src
CMD ["uvicorn", "lcx.main:app", "--host", "0.0.0.0", "--port", "8000"]
