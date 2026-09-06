# TruthLens AI — backend
# No compiler toolchain needed: every dependency ships a prebuilt wheel,
# which keeps this image small and the build fast (seconds, not minutes).
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first so this layer is cached across code changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN mkdir -p data/uploads data/chat_sessions

EXPOSE 8000

# Render/Railway inject $PORT at runtime; default to 8000 for local `docker run`.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WEB_CONCURRENCY:-2}"]
