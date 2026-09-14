import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Request, HTTPException, status
from lcx.config import CONFIG

# In production, this should be an environment variable
SECRET_KEY = CONFIG["lcx_jwt_secret"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

# Using argon2 for state-of-the-art password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Mock database of users for this phase
MOCK_USERS = {
    "user1": {"password": pwd_context.hash("password"), "role": "USER"},
    "tech1": {"password": pwd_context.hash("password"), "role": "TECH"},
    "admin1": {"password": pwd_context.hash("password"), "role": "ADMIN"},
    "gov1": {"password": pwd_context.hash("password"), "role": "GOVERNMENT"},
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str):
    user = MOCK_USERS.get(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return {"username": username, "role": user["role"]}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_str = request.cookies.get("access_token")
    if not token_str or not token_str.startswith("Bearer "):
        raise credentials_exception
    
    token = token_str.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
        token_data = {"sub": username, "role": role}
    except JWTError:
        raise credentials_exception
    return token_data
