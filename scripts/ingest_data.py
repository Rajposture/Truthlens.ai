import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from rag.embedder import generate_embedding
from rag.vector_store import collection

ROOT_DIR = Path(__file__).resolve().parent.parent

file_path = ROOT_DIR / "data" / "raw" / "news.txt"

documents = file_path.read_text().split("\n")

for idx, doc in enumerate(documents):

    if not doc.strip():
        continue

    collection.add(
        ids=[str(idx)],
        documents=[doc],
        embeddings=[generate_embedding(doc)]
    )

print("Data Ingested Successfully")