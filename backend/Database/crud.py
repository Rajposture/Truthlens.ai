from sqlalchemy.orm import Session

from Database.db import (
    SessionLocal
)

from Database.models import (
    Verification,
    User
)


def create_user(data):

    db: Session = SessionLocal()

    try:

        existing = (
            db.query(User)
            .filter(
                User.clerk_id ==
                data["clerk_id"]
            )
            .first()
        )

        if existing:

            return {
                "status": "exists",
                "user_id": existing.id
            }

        user = User(
            clerk_id=data["clerk_id"],
            email=data["email"]
        )

        db.add(user)

        db.commit()

        db.refresh(user)

        return {
            "status": "created",
            "user_id": user.id
        }

    finally:

        db.close()


def get_user_by_clerk_id(
    clerk_id: str
):

    db: Session = SessionLocal()

    try:

        return (
            db.query(User)
            .filter(
                User.clerk_id ==
                clerk_id
            )
            .first()
        )

    finally:

        db.close()


def save_verification(
    data,
    user_id=None
):

    db: Session = SessionLocal()

    try:

        verification = Verification(
            user_id=user_id,
            claim=data["claim"],
            verdict=data["verdict"],
            confidence=str(
                data["confidence"]
            ),
            reasoning=data["reasoning"]
        )

        db.add(
            verification
        )

        db.commit()

        db.refresh(
            verification
        )

        return verification

    finally:

        db.close()


def get_verifications():

    db: Session = SessionLocal()

    try:

        return (
            db.query(
                Verification
            )
            .order_by(
                Verification.created_at.desc()
            )
            .all()
        )

    finally:

        db.close()


def get_user_verifications(
    user_id: int
):

    db: Session = SessionLocal()

    try:

        return (
            db.query(
                Verification
            )
            .filter(
                Verification.user_id ==
                user_id
            )
            .order_by(
                Verification.created_at.desc()
            )
            .all()
        )

    finally:

        db.close()