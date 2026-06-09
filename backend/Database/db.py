# backend/Database/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    sessionmaker,
    declarative_base
)

DATABASE_URL = (
    "postgresql://neondb_owner:npg_3eMDioR2YydL@ep-jolly-smoke-aobeue7g-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()