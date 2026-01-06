from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/ai", tags=["AI"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_ai(req: ChatRequest):
    # TẠM THỜI MOCK – CHƯA DÙNG RAG
    return {
        "answer": f"AI Chợ Xanh trả lời: {req.message}"
    }
