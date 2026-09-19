import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Ops Crew API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL_NAME: str = os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini")
    TEMPERATURE: float = 0.2

    # Search Tool
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    # Checkpoint Database
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "ops_crew_checkpoints.db")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
