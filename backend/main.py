"""
TruthLens AI - backend entrypoint.

Run locally with:
    uvicorn main:app --reload --port 8000

Run in production with:
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from config import settings
from knowledge_base import knowledge_base
from rate_limit import limiter
from routers import chat, documents, history, verify

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("truthlens")


@asynccontextmanager
async def lifespan(app: FastAPI):
    stats = knowledge_base.stats()
    logger.info("Starting %s (%s)", settings.APP_NAME, settings.ENVIRONMENT)
    logger.info("Knowledge base ready: %s", stats)
    if not settings.GROQ_API_KEY:
        logger.warning(
            "GROQ_API_KEY is not set - /api/verify and /api/chat will return a clear "
            "error until you add one. Get a free key at https://console.groq.com/keys"
        )
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="Evidence-grounded fact verification and a retrieval-augmented AI assistant.",
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "You're sending requests a little too fast. Please slow down and try again."},
    )


app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


app.include_router(verify.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(history.router)


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "groq_configured": bool(settings.GROQ_API_KEY),
        "groq_model": settings.GROQ_MODEL,
        "knowledge_base": knowledge_base.stats(),
    }


@app.get("/")
def root() -> dict:
    return {
        "application": settings.APP_NAME,
        "status": "online",
        "docs": "/docs",
        "endpoints": [
            "/api/verify",
            "/api/chat",
            "/api/chat/stream",
            "/api/documents",
            "/api/history",
            "/api/health",
        ],
    }
