import ollama

from core.config import settings


class OllamaClient:

    @staticmethod
    def generate(
        prompt: str
    ) -> str:

        response = ollama.chat(
            model=settings.OLLAMA_MODEL,
            messages=[
                {
                    "role": "system",
                    "content":
                    "You are a professional AI assistant. "
                    "Always format code using markdown code blocks."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return (
            response["message"]["content"]
        )