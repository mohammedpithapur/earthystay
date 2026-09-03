from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from app.services.email import send_contact_enquiry_email
import asyncio

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str
    message: str


@router.post("", status_code=201)
async def submit_contact(data: ContactIn):
    asyncio.create_task(send_contact_enquiry_email(
        name=data.name,
        email=str(data.email),
        phone=data.phone,
        subject=data.subject,
        message=data.message,
    ))
    return {"status": "received"}
