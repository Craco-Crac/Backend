from datetime import timedelta, datetime
from typing import Optional
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()

SECRET_KEY = "a very very very secret key"
TOKEN_TYPE = "token_type"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None):
    to_encode = {"exp": datetime.utcnow() + expires_delta} if expires_delta else {}
    to_encode["sub"] = subject
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.get("/")
async def read_root(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"message": "Hello, World!"}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
