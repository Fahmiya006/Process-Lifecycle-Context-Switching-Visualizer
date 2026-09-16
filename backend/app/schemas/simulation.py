"""Request/response schemas for the /api/simulation endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.process import Process, ProcessInput


class SimulationRequest(BaseModel):
    algorithm: str = Field(default="round_robin")
    time_quantum: int = Field(..., gt=0)
    processes: List[ProcessInput]

    @field_validator("processes")
    @classmethod
    def validate_processes(cls, processes: List[ProcessInput]) -> List[ProcessInput]:
        if not processes:
            raise ValueError("At least one process is required")

        seen_pids = set()
        for process in processes:
            if process.pid in seen_pids:
                raise ValueError(f"Duplicate process ID: {process.pid}")
            seen_pids.add(process.pid)

        return processes

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, algorithm: str) -> str:
        if algorithm != "round_robin":
            raise ValueError("Only 'round_robin' is supported")
        return algorithm


class SimulationEvent(BaseModel):
    """A single chronological event produced by the simulation engine."""

    time: int
    event: str
    pid: Optional[str] = None
    from_process: Optional[str] = None
    to_process: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class GanttEntry(BaseModel):
    pid: str
    start: int
    end: int


class ContextSwitchEntry(BaseModel):
    time: int
    from_: Optional[str] = Field(default=None, alias="from")
    to: str

    class Config:
        populate_by_name = True


class Statistics(BaseModel):
    average_waiting_time: float
    average_turnaround_time: float
    average_response_time: float
    context_switch_count: int
    cpu_utilization: float
    total_execution_time: int


class SimulationResponse(BaseModel):
    algorithm: str
    time_quantum: int
    processes: List[Process]
    events: List[SimulationEvent]
    gantt_chart: List[GanttEntry]
    context_switches: List[ContextSwitchEntry]
    statistics: Statistics
    total_execution_time: int
