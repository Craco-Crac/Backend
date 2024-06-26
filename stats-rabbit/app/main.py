from fastapi import FastAPI, routing, APIRouter
from pymongo import MongoClient
import asyncio
from .pika_client import PikaClient


class App(FastAPI):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pika_client = None
        self.mongodb_client = None
        self.db = None
        self.collection = None

    @classmethod
    def log_incoming_message(cls, message: dict):
        """Method to do something meaningful with the incoming message"""
        print('Here we got incoming message %s', message)

    async def connect(self):
        loop = asyncio.get_running_loop()
        self.pika_client = PikaClient(self.log_incoming_message, loop)
        await self.pika_client.connect()
        task = loop.create_task(app.pika_client.consume())
        await task


app = App(root_path='/stats-rabbit')


@app.on_event("startup")
async def startup_client():
    db_user = 'root'
    db_password = 'root'
    db_host = 'stats-rabbit-mongodb'
    app.mongodb_client = MongoClient(f"mongodb://{db_user}:{db_password}@{db_host}:27017")
    app.db = app.mongodb_client["stats_database"]
    app.collection = app.db["stats_collection"]
    print("Connected to the database")
    await app.connect()


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
