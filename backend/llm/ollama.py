from ollama import Client

from core.config import settings


class OllamaClient:

    _client = Client(
        host=settings.OLLAMA_URL
    )

    SYSTEM_PROMPT = """
You are TruthLens AI.

Provide accurate, concise and helpful responses.

Rules:

- Use markdown formatting.
- Use code blocks when returning code.
- Be direct and practical.
- Do not mention your capabilities unless asked.
- Do not introduce yourself repeatedly.
- If evidence is insufficient, say so.
- Never invent facts.
"""

    @classmethod
    def generate(
        cls,
        prompt: str
    ) -> str:

        try:

            response = cls._client.chat(
                model=settings.OLLAMA_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": cls.SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
               options={
    "temperature": 0.2,
    "num_predict": 256
}
            )

            return (
                response["message"]["content"]
            )

        except Exception as e:

            print(
                f"[OLLAMA ERROR] {e}"
            )

            return (
                "Unable to generate a response."
            )