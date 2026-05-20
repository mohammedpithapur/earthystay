from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class PropertyGroupCreate(BaseModel):
    name: str


class PropertySummary(BaseModel):
    id: UUID
    name: str
    city: str
    state: str
    is_published: bool

    model_config = {"from_attributes": True}


class PropertyGroupMemberCreate(BaseModel):
    property_id: UUID
    is_whole_property: bool = False


class PropertyGroupMemberUpdate(BaseModel):
    is_whole_property: bool | None = None


class PropertyGroupMemberOut(BaseModel):
    id: UUID
    property_id: UUID
    is_whole_property: bool
    property: PropertySummary

    model_config = {"from_attributes": True}


class PropertyGroupOut(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    members: list[PropertyGroupMemberOut]

    model_config = {"from_attributes": True}
