from fastapi import FastAPI, Request, APIRouter

app = FastAPI(root_path="/python")
router = APIRouter(prefix='/python')
app.include_router(router)


@app.get("/")
async def root_of_root():
    return {"message": "Hello"}


@app.get("/test")
async def root():
    return {"message": "Hello World"}
