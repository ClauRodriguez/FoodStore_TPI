from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, StringConstraints
from sqlmodel import SQLModel

Username = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=50),
]
FullName = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=160),
]
Password = Annotated[
    str,
    StringConstraints(min_length=8, max_length=72),
]


class UserCreate(SQLModel):
    username: Username
    full_name: FullName
    email: EmailStr
    password: Password


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    disabled: bool
    created_at: datetime


class AdminUserPublic(UserPublic):
    pass