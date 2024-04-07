from fastapi import FastAPI, Request, APIRouter, Body, Path, Response, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field, HttpUrl
from typing import Annotated

app = FastAPI(root_path="/python")


@app.get("/")
async def root_of_root():
    return {"message": "Hello"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@app.get("/items/")
async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}
