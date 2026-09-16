from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.simulation import router as simulation_router

app = FastAPI(
    title="Process Lifecycle & Context Switching Visualizer API",
    description=(
        "Stateless simulation engine for visualizing OS process lifecycle "
        "and context switching using Round Robin CPU scheduling."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation_router)


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}
