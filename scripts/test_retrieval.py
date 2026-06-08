import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.rag.retriever import retrieve

results = retrieve(
    "Did NASA confirm alien landings?"
)

print("\nRetrieved Documents:\n")

for result in results:
    print(result)