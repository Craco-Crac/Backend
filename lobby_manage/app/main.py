from fastapi import FastAPI
from fastapi.exceptions import HTTPException
from fastapi import status
from .database import create_tables, drop_tables
from loguru import logger

app = FastAPI(root_path="/lobby")

logger.start("../logs/main.log", rotation="1 day")


@app.on_event("startup")
async def startup_config():
    try:
        create_tables()
    except Exception as ex:
        logger.error(f'{ex}')


@app.get("/")
async def root_of_root():
    return {"message": "Hello"}


@app.delete("/table")
async def delete_table():
    try:
        drop_tables()
        return {"message": "Tables dropped"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error {e}"
        )


@app.post("/table")
async def create_table():
    try:
        create_tables()
        return {"message": "Tables created"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error {e}"
        )
