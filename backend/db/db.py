import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# Load environment variables from .env file into os.environ
load_dotenv()

# Get database URL from environment variable. Default to local db URL if not set.
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://hh_user:hhdevpw@localhost:5432/hh-db-local")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

# Database session dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db  # yield keyword is used to return a generator object
    finally:  # finally block runs after try block even if exception was raised or something was returned
        db.close()
