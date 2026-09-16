"""Creates and holds the in-memory Process objects for one simulation run."""

from typing import List

from app.schemas.process import Process, ProcessInput, ProcessState
from app.services import pcb_manager


def build_processes(process_inputs: List[ProcessInput]) -> List[Process]:
    """Turn raw process input into full simulation Process objects, all starting in NEW."""
    processes = []
    for index, process_input in enumerate(process_inputs):
        pcb = pcb_manager.initial_pcb(index)
        processes.append(
            Process(
                pid=process_input.pid,
                arrival_time=process_input.arrival_time,
                burst_time=process_input.burst_time,
                remaining_time=process_input.burst_time,
                state=ProcessState.NEW,
                program_counter=pcb["program_counter"],
                stack_pointer=pcb["stack_pointer"],
                registers=pcb["registers"],
            )
        )
    return processes
