from pydantic import BaseModel


class DocumentStatsResponse(BaseModel):
    documents: int


class KnowledgeBaseStatus(BaseModel):
    total_documents: int
    collection_name: str