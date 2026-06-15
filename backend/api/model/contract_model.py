from pydantic import BaseModel
from typing import Literal

class Document(BaseModel):
    id: str
    name: str
    fileType: Literal[
        "pdf",
        "docx",
        "xlsx",
        "txt",
        "jpg",
        "png"
    ]
    url: str
