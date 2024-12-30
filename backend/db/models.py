import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Session

from .db import Base


class User(Base):
    __tablename__ = "users"

    guid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    last_login = Column(DateTime, default=datetime.now(timezone.utc))


def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    return db.query(User).filter(User.google_id == google_id).first()


def create_user(db: Session, google_id: str, email: str, name: str) -> User:
    user = User(google_id=google_id, email=email, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_last_login(db: Session, user: User) -> User:
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user
