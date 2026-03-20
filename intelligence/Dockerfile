FROM python:3.11-slim

# Prevent .pyc files and enable unbuffered output for Easypanel logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    GRPC_DNS_RESOLVER=native

WORKDIR /app

# Install system dependencies (required by some ML/vision packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install FastAPI + Uvicorn (not in the original requirements.txt)
RUN pip install --no-cache-dir fastapi uvicorn[standard]

# Copy application code
COPY . .

# Expose the intelligence API port
EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
