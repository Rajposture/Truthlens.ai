from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    # ========================================================
    # APPLICATION
    # ========================================================
    APP_NAME: str = "TruthLens AI"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    FRONTEND_URL: str = "http://localhost:3000"

    # ========================================================
    # LLM PROVIDER (groq = cloud, ollama = local dev only)
    # ========================================================
    LLM_PROVIDER: str = "groq"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_TIMEOUT_SECONDS: float = 60.0
    GROQ_REASONING_EFFORT: str = "medium"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:0.5b"
    OLLAMA_TIMEOUT_SECONDS: float = 120.0

    # ========================================================
    # WEB SEARCH (Tavily) - optional fallback when local evidence is weak
    # ========================================================
    TAVILY_API_KEY: str = ""
    WEB_SEARCH_MAX_RESULTS: int = 5
    WEB_SEARCH_TIMEOUT_SECONDS: float = 15.0
    WEB_SEARCH_RELEVANCE_THRESHOLD: float = 0.55
    WEB_SEARCH_MIN_KEYWORD_OVERLAP: float = 0.35
    WEB_SEARCH_MIN_STRONG_MATCHES: int = 2

    # ========================================================
    # KNOWLEDGE BASE / RETRIEVAL (BM25)
    # ========================================================
    DATA_DIR: str = "data"
    TOP_K_RESULTS: int = 5
    MIN_RELEVANCE_SCORE: float = 0.12
    CHUNK_SIZE: int = 900
    CHUNK_OVERLAP: int = 150

    # ========================================================
    # UPLOADS
    # ========================================================
    MAX_UPLOAD_MB: int = 20

    # ========================================================
    # ADAPTIVE / AUTO-RETRAINING ML MODEL
    # ========================================================
    ML_MODEL_VERSION: str = "adaptive-1"
    ML_ONLINE_LEARNING_ENABLED: bool = True
    # A verification result must clear this LLM confidence before it's allowed
    # to become a training sample (keeps the auto-labeling honest).
    ML_MIN_TRAIN_CONFIDENCE: int = 75
    ML_MAX_LIVE_SAMPLES: int = 5000
    ML_RETRAIN_MIN_SAMPLES: int = 30
    ML_RETRAIN_EVERY: int = 10
    ML_DATA_DIR: str = "ml_data"
    ML_RUNTIME_MODEL_DIR: str = "ml_runtime_models"

    # ========================================================
    # RATE LIMITING
    # ========================================================
    RATE_LIMIT_CHAT: str = "30/minute"
    RATE_LIMIT_VERIFY: str = "20/minute"
    RATE_LIMIT_UPLOAD: str = "10/minute"

    # ========================================================
    # CORS
    # ========================================================
    FRONTEND_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # ------------------------------------------------------------------
    # Derived paths (auto-created on first access)
    # ------------------------------------------------------------------
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
        path = self.data_dir / "chat_history"
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def ml_data_dir(self) -> Path:
        path = self.data_dir / self.ML_DATA_DIR
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def ml_samples_path(self) -> Path:
        return self.ml_data_dir / "adaptive_samples.jsonl"

    @property
    def ml_runtime_model_dir(self) -> Path:
        path = self.data_dir / self.ML_RUNTIME_MODEL_DIR
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def frontend_origins_list(self) -> list[str]:
        raw = [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]
        if self.FRONTEND_URL and self.FRONTEND_URL not in raw:
            raw.append(self.FRONTEND_URL)
        return raw or ["*"]


settings = Settings()
