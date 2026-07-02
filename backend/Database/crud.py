from sqlalchemy.orm import Session
import logging

from Database.db import SessionLocal
from Database.models import User, Verification

logger = logging.getLogger(__name__)

def create_user(data: dict):
    db: Session = SessionLocal()
    try:
        existing = (
            db.query(User)
            .filter(User.clerk_id == data["clerk_id"])
            .first()
        )

        if existing:
            return {"status": "exists", "user_id": existing.id}

        user = User(clerk_id=data["clerk_id"], email=data["email"])
        db.add(user)
        db.commit()
        db.refresh(user)

        return {"status": "created", "user_id": user.id}
    except Exception as e:
        db.rollback()
        logger.error(f"Create user failed: {e}")
        raise
    finally:
        db.close()


def get_user_by_clerk_id(clerk_id: str):
    db: Session = SessionLocal()
    try:
        return (
            db.query(User)
            .filter(User.clerk_id == clerk_id)
            .first()
        )
    except Exception as e:
        logger.error(f"Get user failed: {e}")
        raise
    finally:
        db.close()


def save_verification(data: dict, user_id: int | None = None):
    db: Session = SessionLocal()
    try:
        verification = Verification(
            user_id=user_id,
            claim=data["claim"],
            verdict=data["verdict"],
            confidence=str(data["confidence"]),
            reasoning=data["reasoning"]
        )
        db.add(verification)
        db.commit()
        db.refresh(verification)

        return verification
    except Exception as e:
        db.rollback()
        logger.error(f"Save verification failed: {e}")
        raise
    finally:
        db.close()


def get_verifications():
    db: Session = SessionLocal()
    try:
        return (
            db.query(Verification)
            .order_by(Verification.created_at.desc())
            .all()
        )
    except Exception as e:
        logger.error(f"Get verifications failed: {e}")
        raise
    finally:
        db.close()


def get_user_verifications(user_id: int):
    db: Session = SessionLocal()
    try:
        return (
            db.query(Verification)
            .filter(Verification.user_id == user_id)
            .order_by(Verification.created_at.desc())
            .all()
        )
    except Exception as e:
        logger.error(f"Get user verifications failed: {e}")
        raise
    finally:
        db.close()

