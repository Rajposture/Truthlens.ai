"""
Centralized configuration for TruthLens AI.

Everything that changes between local development and a live deployment
(Render, Railway, Docker, etc.) lives here and is read from environment
variables / a local .env file. Nothing sensitive is hardcoded.
"""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    # --- General ---
    APP_NAME: str = "TruthLens AI"
    ENVIRONMENT: str = "development"  # development | production
    LOG_LEVEL: str = "INFO"

    # Comma separated list of allowed origins for CORS, e.g.
    # "https://truthlens.vercel.app,https://www.truthlens.app"
    FRONTEND_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Groq (LLM provider) ---
    # Get a free key at https://console.groq.com/keys
    GROQ_API_KEY: str = ""
    # openai/gpt-oss-120b = best quality, still extremely fast on Groq's LPUs.
    # openai/gpt-oss-20b  = smaller + even faster, slightly less thorough.
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    # low | medium | high — lower effort answers faster, higher effort reasons harder.
    GROQ_REASONING_EFFORT: str = "low"
    GROQ_TIMEOUT_SECONDS: float = 30.0

    # --- Retrieval / knowledge base ---
    TOP_K_RESULTS: int = 4
    MIN_RELEVANCE_SCORE: float = 0.15
    CHUNK_SIZE: int = 900
    CHUNK_OVERLAP: int = 150

    # --- Uploads ---
    MAX_UPLOAD_MB: int = 15

    # --- Rate limiting (protects your Groq quota on a public deployment) ---
    RATE_LIMIT_VERIFY: str = "20/minute"
    RATE_LIMIT_CHAT: str = "30/minute"
    RATE_LIMIT_UPLOAD: str = "10/minute"

    # --- Storage paths (all relative to backend/) ---
    DATA_DIR: str = "data"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def frontend_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip()]

    @property
    def data_dir(self) -> Path:
        path = BASE_DIR / self.DATA_DIR
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def uploads_dir(self) -> Path:
        path = self.data_dir / "uploads"
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def chat_sessions_dir(self) -> Path:
        path = self.data_dir / "chat_sessions"
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
