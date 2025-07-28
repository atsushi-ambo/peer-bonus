from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: str | None = None
    is_active: bool

    class Config:
        from_attributes = True