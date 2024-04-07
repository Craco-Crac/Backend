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


"""
    get lobbies get"lobby"
    get lobby by id get"lobby/id"
    create lobby post"lobby"
    delete lobby delete"lobby/id"
    join lobby  post"lobby/id/join"
    leave lobby post"lobby/id/leave"
"""


@app.get("/", summary="Get lobby list")
async def get_lobbies():
    return {"lobbies": "lobby list"}


@app.get("/{lobby_id}", summary="Get a single lobby by ID")
async def get_lobby(lobby_id: int):
    pass


@app.post("/", summary="Create a new lobby")
async def create_lobby():
    pass


@app.delete("/{lobby_id}", summary="Delete a lobby by ID")
async def delete_lobby(lobby_id: int):
    pass


@app.post("/{lobby_id}/join", summary="Join a lobby by ID")
async def join_lobby(lobby_id: int):
    pass


@app.post("/{lobby_id}/leave", summary="Leave a lobby by ID")
async def leave_lobby(lobby_id: int):
    pass
