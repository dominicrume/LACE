# Stage 1: Build the Vite (React) Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/driver-app
COPY driver-app/package*.json ./
RUN npm install
COPY driver-app/ ./
RUN npm run build

# Stage 2: Build the FastAPI Backend & Serve
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies (e.g. for PyTorch / OpenCV if needed)
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY src/ src/
RUN pip install --no-cache-dir .

# Copy the built frontend
COPY --from=frontend-builder /app/driver-app/dist /app/frontend_dist
ENV FRONTEND_DIST_DIR="/app/frontend_dist"

# Railway provides PORT dynamically
ENV PORT=8000
EXPOSE $PORT

# Run Uvicorn
CMD uvicorn lcx.main:app --host 0.0.0.0 --port $PORT
