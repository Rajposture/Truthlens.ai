from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from Database.db import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    clerk_id = Column(
        String(255),
        unique=True,
        nullable=False
    )

    email = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    verifications = relationship(
        "Verification",
        back_populates="user"
    )


class Verification(Base):

    __tablename__ = "verifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    claim = Column(
        Text,
        nullable=False
    )

    verdict = Column(
        String(50)
    )

    confidence = Column(
        String(50)
    )

    reasoning = Column(
        Text
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="verifications"
    )