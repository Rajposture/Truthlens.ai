import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.services.ingestion_service import IngestionService

result = IngestionService.ingest_txt(
    "data/raw/news.txt"
)

print(result)