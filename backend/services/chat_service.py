import json
import time

from pathlib import Path

from services.retrieval_service import (
    RetrievalService
)

from llm.gemini import (
    GeminiClient
)


class ChatService:

    CHAT_DIR = Path(
        "data/chat_history"
    )

    CHAT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    SIMPLE_MESSAGES = {
        "hi",
        "hello",
        "hey",
        "thanks",
        "thank you",
        "good morning",
        "good evening",
        "ok",
        "okay",
    }

    MAX_MEMORY = 12

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

        except Exception as e:

            print(
                f"[LOAD SESSION ERROR] {e}"
            )

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

        try:

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

        except Exception as e:

            print(
                f"[SAVE SESSION ERROR] {e}"
            )

    @classmethod
    def build_memory_context(
        cls,
        session_id: str
    ):

        messages = (
            cls.load_session(
                session_id
            )
        )

        messages = messages[
            -cls.MAX_MEMORY:
        ]

        return "\n".join(
            [
                f"{m['role']}: {m['content']}"
                for m in messages
            ]
        )

    @classmethod
    def save_message(
        cls,
        session_id: str,
        role: str,
        content: str
    ):

        messages = (
            cls.load_session(
                session_id
            )
        )

        messages.append(
            {
                "role": role,
                "content": content
            }
        )

        cls.save_session(
            session_id,
            messages
        )

    @classmethod
    def should_use_rag(
        cls,
        message: str
    ):

        message = (
            message.lower()
            .strip()
        )

        if (
            message
            in cls.SIMPLE_MESSAGES
        ):
            return False

        if len(message) < 15:
            return False

        return True

    @classmethod
    def generate_response(
        cls,
        prompt: str
    ):

        try:

            return GeminiClient.generate(
                prompt
            )

        except Exception as e:

            print(
                f"[CHAT ERROR] {e}"
            )

            return (
                "TruthLens AI is temporarily unavailable. Please try again in a few moments."
            )

    @classmethod
    def chat(
        cls,
        message: str,
        session_id: str
    ):

        evidence = []

        context = ""

        memory_context = (
            cls.build_memory_context(
                session_id
            )
        )

        try:

            if cls.should_use_rag(
                message
            ):

                retrieval_start = (
                    time.time()
                )

                evidence = (
    RetrievalService
    .get_evidence(
        query=message,
        top_k=3,
        use_reranker=False
    )
)

                print(
                    f"[TIME] Retrieval: "
                    f"{time.time() - retrieval_start:.2f}s"
                )

                if evidence:

                    context = "\n\n".join(
                        [
                            item["content"][:800]
                            for item in evidence
                        ]
                    )

            prompt = f"""

You are TruthLens AI.

Conversation History:

{memory_context}

Retrieved Context:

{context}

User Question:

{message}

Instructions:

* Answer naturally.
* Use markdown formatting.
* Use retrieved context only if relevant.
* Ignore unrelated context.
* Never invent facts.
* If evidence is insufficient, say so.
* Keep responses concise unless asked otherwise.
* If the question is general knowledge, answer normally.

"""

            llm_start = time.time()

            response = (
                cls.generate_response(
                    prompt
                )
            )

            print(
                f"[TIME] LLM: "
                f"{time.time() - llm_start:.2f}s"
            )

            cls.save_message(
                session_id,
                "user",
                message
            )

            cls.save_message(
                session_id,
                "assistant",
                response
            )

            sources = []

            for item in evidence:

                source = (
                    item.get(
                        "metadata",
                        {}
                    ).get(
                        "source",
                        "Unknown"
                    )
                )

                if source not in sources:

                    sources.append(
                        source
                    )

            return {
                "response": response,
                "sources": sources,
                "session_id": session_id
            }

        except Exception as e:

            print(
                f"[CHAT ERROR] {e}"
            )

            return {
                "response":
                "Unable to generate a response.",
                "sources": [],
                "session_id": session_id
            }

    @classmethod
    def clear_memory(
        cls,
        session_id: str
    ):

        file = cls.get_session_file(
            session_id
        )

        if file.exists():

            file.unlink()

        return {
            "status": "success",
            "message": "Conversation cleared"
        }
