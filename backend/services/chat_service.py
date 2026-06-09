from services.retrieval_service import (
    RetrievalService
)

from llm.ollama import (
    OllamaClient
)


class ChatService:

    @staticmethod
    def chat(
        message: str
    ):

        evidence = (
            RetrievalService
            .get_evidence(
                message
            )
        )

        context = "\n\n".join(
            item["content"]
            for item in evidence
        )

        prompt = f"""
You are TruthLens Assistant.

You are an expert:

- Software Engineer
- Python Developer
- Java Developer
- React Developer
- Next.js Developer
- FastAPI Developer
- AI Engineer
- Debugging Expert
- Document Analyst
- Research Assistant

IMPORTANT RULES:

1. Always use markdown formatting.
2. Always wrap code inside code blocks.
3. Never return code as plain text.
4. Use headings and bullet points.
5. If debugging:
   - Explain the issue
   - Explain the root cause
   - Provide the fix
   - Provide improved code
6. If answering document questions:
   - Use the provided context
   - Cite document information
7. If information is not found in context:
   - Answer using general knowledge
8. Be concise but professional.

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{message}

ASSISTANT RESPONSE:
"""

        response = (
            OllamaClient.generate(
                prompt
            )
        )

        return {
            "response": response,
            "sources": evidence
        }