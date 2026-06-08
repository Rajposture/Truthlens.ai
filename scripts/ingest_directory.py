import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.services.document_service import (
    DocumentService
)

result = DocumentService.ingest_directory(
    "data/raw"
)

print(result)