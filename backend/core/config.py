from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "TruthLens AI"

    ENVIRONMENT: str = "development"

    LOG_LEVEL: str = "INFO"

    FRONTEND_URL: str = "http://localhost:3000"

    # API Keys
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    # Database
    DATABASE_URL: str = ""

    # ChromaDB
    CHROMA_DB_PATH: str = "data/chroma_db"
    CHROMA_COLLECTION: str = "truthlens"

    # Chat
    CHAT_HISTORY_PATH: str = "data/chat_history"

    # Retrieval
    TOP_K_RESULTS: int = 5

    # Upload
    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()