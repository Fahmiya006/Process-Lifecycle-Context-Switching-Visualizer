from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_engine import run_simulation

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


@router.post("/run", response_model=SimulationResponse)
def run(request: SimulationRequest) -> SimulationResponse:
    try:
        return run_simulation(request)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
