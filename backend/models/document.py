from pydantic import BaseModel


class DocumentResponse(BaseModel):
    filename: str
    path: str


class UploadResponse(BaseModel):
    message: str
    result: dict