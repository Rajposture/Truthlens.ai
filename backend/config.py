from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# backend/
BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    APP_NAME: str = "TruthLens AI"

    ENVIRONMENT: str = "development"

    LOG_LEVEL: str = "INFO"

    FRONTEND_URL: str = "http://localhost:3000"

    # ============================================================
    # API KEYS
    # ============================================================

    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str = ""

    # ============================================================
    # CHROMADB
    # ============================================================

    CHROMA_DB_PATH: str = "data/chroma_db"
    CHROMA_COLLECTION: str = "truthlens"

    # ============================================================
    # CHAT
    # ============================================================

    CHAT_HISTORY_PATH: str = "data/chat_history"

    # ============================================================
    # KNOWLEDGE BASE
    # ============================================================

    DATA_DIR: str = "data"

    # ============================================================
    # MACHINE LEARNING
    # ============================================================

    ML_DATA_DIR: str = "ml_data"

    # ============================================================
    # RETRIEVAL
    # ============================================================

    TOP_K_RESULTS: int = 5

    # ============================================================
    # UPLOAD
    # ============================================================

    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024

    # ============================================================
    # RATE LIMITING
    # ============================================================

    RATE_LIMIT_CHAT: str = "30/minute"
    RATE_LIMIT_VERIFY: str = "20/minute"
    RATE_LIMIT_UPLOAD: str = "10/minute"

    # ============================================================
    # PYDANTIC SETTINGS
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # ============================================================
    # DATA DIRECTORY
    # ============================================================

    @property
    def data_dir(self) -> Path:
        """
        Root data directory used by the knowledge base.
        """
        path = BASE_DIR / self.DATA_DIR
        path.mkdir(parents=True, exist_ok=True)
        return path

    # ============================================================
    # ADAPTIVE ML DATA DIRECTORY
    # ============================================================

    @property
    def ml_data_dir(self) -> Path:
        """
        Directory used for adaptive ML training data.
        """
        path = self.data_dir / self.ML_DATA_DIR
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()