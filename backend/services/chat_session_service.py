from pathlib import Path
import json


class ChatSessionService:

    CHAT_DIR = Path(
        "data/chat_history"
    )

    CHAT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    @classmethod
    def get_session_file(
        cls,
        session_id: str
    ):

        return (
            cls.CHAT_DIR /
            f"{session_id}.json"
        )

    @classmethod
    def load_session(
        cls,
        session_id: str
    ):

        file = cls.get_session_file(
            session_id
        )

        if not file.exists():
            return []

        try:

            with open(
                file,
                "r",
                encoding="utf-8"
            ) as f:

                return json.load(f)

        except Exception:

            return []

    @classmethod
    def save_session(
        cls,
        session_id: str,
        messages: list
    ):

        file = cls.get_session_file(
            session_id
        )

        with open(
            file,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                messages,
                f,
                ensure_ascii=False,
                indent=2
            )

    @classmethod
    def list_sessions(
        cls
    ):

        sessions = []

        for file in cls.CHAT_DIR.glob(
            "*.json"
        ):

            try:

                messages = json.loads(
                    file.read_text(
                        encoding="utf-8"
                    )
                )

                title = (
                    messages[0]["content"][:50]
                    if messages
                    else "New Chat"
                )

                sessions.append(
                    {
                        "session_id":
                        file.stem,
                        "title":
                        title
                    }
                )

            except Exception:
                pass

        return sessions

    @classmethod
    def delete_session(
        cls,
        session_id: str
    ):

        file = cls.get_session_file(
            session_id
        )

        if file.exists():
            file.unlink()

        return {
            "status": "success"
        }