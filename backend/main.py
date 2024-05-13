
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import prediction, predictionData

app = FastAPI()

# Permite el acceso de cualquier origen (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargamos las rutas desde el archivo routers/prediction.py
app.include_router(prediction.router, prefix="/predict")
app.include_router(predictionData.router, prefix="/predictData")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
