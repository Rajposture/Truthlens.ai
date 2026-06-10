from sentence_transformers import (
    SentenceTransformer
)

import threading


_model = None
_lock = threading.Lock()


def get_model():

    global _model

    if _model is None:

        with _lock:

            if _model is None:

                print(
                    "[EMBEDDER] Loading model..."
                )

                _model = (
                    SentenceTransformer(
                        "all-MiniLM-L6-v2"
                    )
                )

                print(
                    "[EMBEDDER] Model loaded"
                )

    return _model


def generate_embedding(
    text: str
):

    model = get_model()

    embedding = model.encode(
        text,
        normalize_embeddings=True,
        show_progress_bar=False
    )

    return embedding.tolist()