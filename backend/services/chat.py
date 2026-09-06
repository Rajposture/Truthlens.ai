"""Conversational assistant: session memory + optional knowledge-base grounding."""
from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from pathlib import Path

from config import settings
from knowledge_base import knowledge_base
from llm import GroqError, chat as llm_chat, chat_stream
from storage import JSONStore
from utils import now_iso, safe_id

SYSTEM_PROMPT = """You are the TruthLens AI Assistant - a fast, honest research and Q&A companion.
Answer clearly using markdown formatting. When the message includes retrieved context from the
knowledge base, ground your answer in it and say so naturally; ignore it if it isn't relevant.
Never invent facts or sources. If you're not sure, say so plainly. Keep answers concise unless the
person asks for more detail."""

_GREETINGS = {
    "hi", "hello", "hey", "hi there", "thanks", "thank you", "good morning",
    "good evening", "good afternoon", "ok", "okay", "yo", "sup", "hello!", "hi!",
}
_MAX_TURNS_REMEMBERED = 10  # user+assistant pairs


class ChatService:
    def _session_path(self, session_id: str) -> Path:
        return settings.chat_sessions_dir / f"{safe_id(session_id)}.json"

    def _load(self, session_id: str) -> list[dict]:
        return JSONStore(self._session_path(session_id), default=[]).read()

    def _append(self, session_id: str, role: str, content: str, sources: list[str] | None = None) -> None:
        path = self._session_path(session_id)
        store = JSONStore(path, default=[])
        messages = store.read()
        messages.append(
            {"role": role, "content": content, "sources": sources or [], "created_at": now_iso()}
        )
        store.write(messages)

    @staticmethod
    def _should_use_kb(message: str) -> bool:
        cleaned = message.strip().lower()
        if cleaned in _GREETINGS:
            return False
        return len(cleaned) >= 12

    def _build_messages(self, session_id: str, message: str) -> tuple[list[dict], list[str]]:
        history = self._load(session_id)[-_MAX_TURNS_REMEMBERED * 2 :]
        sources: list[str] = []

        prompt_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if self._should_use_kb(message):
            evidence = knowledge_base.search(message, top_k=3)
            if evidence:
                sources = list(dict.fromkeys(item["source"] for item in evidence))
                context = "\n\n".join(f"Source: {item['source']}\n{item['snippet']}" for item in evidence)
                prompt_messages.append(
                    {
                        "role": "system",
                        "content": f"Relevant context from the knowledge base:\n\n{context}",
                    }
                )

        for turn in history:
            prompt_messages.append({"role": turn["role"], "content": turn["content"]})
        prompt_messages.append({"role": "user", "content": message})

        return prompt_messages, sources

    async def respond(self, message: str, session_id: str) -> dict:
        messages, sources = self._build_messages(session_id, message)
        try:
            text = await llm_chat(messages, max_tokens=900, temperature=0.5)
        except GroqError as exc:
            text = str(exc)
            sources = []

        self._append(session_id, "user", message)
        self._append(session_id, "assistant", text, sources)
        return {"response": text, "sources": sources, "session_id": session_id}

    async def respond_stream(self, message: str, session_id: str) -> AsyncGenerator[str, None]:
        messages, sources = self._build_messages(session_id, message)
        self._append(session_id, "user", message)

        collected: list[str] = []
        try:
            async for piece in chat_stream(messages, max_tokens=900, temperature=0.5):
                collected.append(piece)
                yield piece
        except GroqError as exc:
            collected.append(str(exc))
            yield str(exc)
        finally:
            full_text = "".join(collected).strip()
            if full_text:
                self._append(session_id, "assistant", full_text, sources)

    def list_sessions(self) -> list[dict]:
        sessions = []
        for path in settings.chat_sessions_dir.glob("*.json"):
            try:
                messages = json.loads(path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                continue
            if not messages:
                continue
            first_user = next((m["content"] for m in messages if m["role"] == "user"), "New conversation")
            sessions.append(
                {
                    "session_id": path.stem,
                    "title": first_user[:60],
                    "updated_at": messages[-1].get("created_at", ""),
                    "message_count": len(messages),
                }
            )
        sessions.sort(key=lambda s: s["updated_at"], reverse=True)
        return sessions

    def get_session(self, session_id: str) -> list[dict]:
        return self._load(session_id)

    def delete_session(self, session_id: str) -> None:
        path = self._session_path(session_id)
        if path.exists():
            path.unlink()


chat_service = ChatService()
