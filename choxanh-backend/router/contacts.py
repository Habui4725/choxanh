from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from db import contacts_collection
from bson import ObjectId

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])

class ContactMessage(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    message: str

@router.get("/")
def list_contacts():
    contacts = list(contacts_collection.find({}).sort("created_at", -1))
    for c in contacts:
        c["id"] = str(c.get("_id"))
        c.pop("_id", None)
    return contacts

@router.post("/")
def create_contact(msg: ContactMessage):
    data = msg.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    result = contacts_collection.insert_one(data)
    return {**data, "id": str(result.inserted_id)}

@router.get("/{contact_id}")
def get_contact(contact_id: str):
    try:
        obj_id = ObjectId(contact_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    contact = contacts_collection.find_one({"_id": obj_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Liên hệ không tồn tại")

    contact["id"] = str(contact.get("_id"))
    contact.pop("_id", None)
    return contact
