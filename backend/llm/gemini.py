import logging
import time

from google import genai
from google.genai.types import GenerateContentConfig

from core.config import settings

logger = logging.getLogger(__name__)


class GeminiClient:

    _client = None

    MODEL = "gemini-2.5-flash"

    SYSTEM_PROMPT = """
You are TruthLens AI.

Rules:

- Be factual.
- Never invent information.
- If uncertain, clearly state it.
- Use markdown.
- Keep answers concise unless asked otherwise.
- Use retrieved context when it is relevant.
"""

    @classmethod
    def get_client(cls):

        if cls._client is None:

            if not settings.GEMINI_API_KEY:
                raise RuntimeError(
                    "GEMINI_API_KEY is not configured."
                )

            cls._client = genai.Client(
                api_key=settings.GEMINI_API_KEY
            )

        return cls._client

    @classmethod
    def generate(cls, prompt: str) -> str:

        client = cls.get_client()

        retries = 3

        for attempt in range(retries):

            try:

                start = time.time()

                response = client.models.generate_content(
                    model=cls.MODEL,
                    contents=f"""
{cls.SYSTEM_PROMPT}

{prompt}
""",
                    config=GenerateContentConfig(
                        temperature=0.2,
                        top_p=0.95,
                        max_output_tokens=2048,
                    ),
                )

                logger.info(
                    "Gemini responded in %.2fs",
                    time.time() - start,
                )

                if response and response.text:
                    return response.text.strip()

                return "No response generated."

            except Exception as e:

                logger.warning(
                    "Gemini attempt %d failed: %s",
                    attempt + 1,
                    e,
                )

                if attempt == retries - 1:
                    raise

                time.sleep(2)