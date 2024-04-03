from fastapi import FastAPI, Request, APIRouter

app = FastAPI(root_path="/python", docs_url="/docs", redoc_url=None)
router = APIRouter(prefix='/python')
app.include_router(router)


@app.get("/")
async def tst():
    return {"message": "Hello"}


@app.get("/test")
async def root():
    return {"message": "Hello World"}
