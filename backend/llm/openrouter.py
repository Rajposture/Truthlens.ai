from openai import OpenAI

from core.config import settings


class OpenRouterClient:

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY
    )

    SYSTEM_PROMPT = """
You are TruthLens AI.

Provide accurate, concise,
and helpful responses.

Use markdown formatting.

Never invent facts.

If information is uncertain,
say so.
"""

    @classmethod
    def generate(
        cls,
        prompt: str
    ) -> str:

        try:

            completion = (
                cls.client.chat.completions.create(
                    model=settings.OPENROUTER_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": cls.SYSTEM_PROMPT,
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=0.2,
                    max_tokens=2048,
                )
            )

            return (
                completion
                .choices[0]
                .message.content
            )

        except Exception as e:

            print(
                f"[OPENROUTER ERROR] {e}"
            )

            return (
                "Unable to generate a response."
            )