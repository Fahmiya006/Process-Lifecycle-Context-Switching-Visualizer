"""Pydantic models describing a simulated process and its (conceptual) PCB."""

from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel, Field


class ProcessState(str, Enum):
    NEW = "NEW"
    READY = "READY"
    RUNNING = "RUNNING"
    WAITING = "WAITING"
    TERMINATED = "TERMINATED"


class ProcessInput(BaseModel):
    """A process as submitted by the client, before simulation."""

    pid: str = Field(..., min_length=1, description="Unique process identifier, e.g. P1")
    arrival_time: int = Field(..., ge=0)
    burst_time: int = Field(..., gt=0)


class Process(BaseModel):
    """
    Full simulation model of a process, including a conceptual PCB.

    NOTE: program_counter / stack_pointer / registers are a simplified,
    educational representation of a PCB. They do not reflect the real
    PCB of any actual operating system or the host machine.
    """

    pid: str
    arrival_time: int
    burst_time: int
    remaining_time: int
    state: ProcessState = ProcessState.NEW

    completion_time: Optional[int] = None
    turnaround_time: Optional[int] = None
    waiting_time: Optional[int] = None
    response_time: Optional[int] = None

    program_counter: int
    stack_pointer: int
    registers: Dict[str, int]

    context_switch_count: int = 0
