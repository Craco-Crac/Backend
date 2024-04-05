from fastapi import FastAPI
from fastapi.exceptions import HTTPException
from fastapi import status
from .database import create_tables, drop_tables

app = FastAPI(root_path="/lobby")


@app.get("/")
async def root_of_root():
    return {"message": "Hello"}


@app.get("/setup")
async def create_table():
    try:
        drop_tables()
        create_tables()
        return {"message": "Tables dropped and created!"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error {e}"
        )
