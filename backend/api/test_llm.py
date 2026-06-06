from fastapi import APIRouter

from backend.llm.ollama import OllamaClient

router = APIRouter()


@router.get("/test-llm")
def test_llm():

    response = OllamaClient.generate(
        "Introduce yourself in one sentence."
    )

    return {
        "response": response
    }