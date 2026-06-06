import ollama

from backend.core.config import settings


class OllamaClient:

    @staticmethod
    def generate(prompt: str) -> str:

        response = ollama.chat(
            model=settings.OLLAMA_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]