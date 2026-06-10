from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict
)


class Settings(BaseSettings):

    APP_NAME: str = "TruthLens AI"

    OLLAMA_MODEL: str = "phi3:mini"

    OLLAMA_URL: str = (
        "http://localhost:11434"
    )

    CHROMA_DB_PATH: str = (
        "data/chroma_db"
    )

    CHROMA_COLLECTION: str = (
        "truthlens"
    )

    TOP_K_RESULTS: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()