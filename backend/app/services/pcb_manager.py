"""
Simulates the conceptual Process Control Block (PCB) fields for each process.

This is an EDUCATIONAL MODEL. The program counter, stack pointer and
registers below are synthetic values generated to make context switching
visible on screen -- they do not come from (and are not related to) the
real CPU/OS running this simulation.
"""

from app.schemas.process import Process

_BASE_PROGRAM_COUNTER = 1000
_BASE_STACK_POINTER = 8000
_STACK_POINTER_STRIDE = 100
_INSTRUCTIONS_PER_TIME_UNIT = 4


def initial_pcb(index: int) -> dict:
    """Starting PCB values for the process at position `index` in the input list."""
    return {
        "program_counter": _BASE_PROGRAM_COUNTER,
        "stack_pointer": _BASE_STACK_POINTER - index * _STACK_POINTER_STRIDE,
        "registers": {"R1": 0, "R2": 0, "R3": 0, "R4": 0},
    }


def advance_execution(process: Process, executed_units: int) -> None:
    """
    Mutate a process's PCB fields to reflect `executed_units` of CPU time
    having just run, as if instructions were executed and registers updated.
    """
    process.program_counter += executed_units * _INSTRUCTIONS_PER_TIME_UNIT
    executed_so_far = process.burst_time - process.remaining_time
    process.registers["R1"] = executed_so_far
    process.registers["R2"] = process.remaining_time
    process.registers["R3"] = process.program_counter
    process.registers["R4"] = process.context_switch_count


def snapshot(process: Process) -> dict:
    """A point-in-time copy of a process's PCB, used in event payloads."""
    return {
        "pid": process.pid,
        "state": process.state.value,
        "program_counter": process.program_counter,
        "stack_pointer": process.stack_pointer,
        "registers": dict(process.registers),
        "remaining_time": process.remaining_time,
        "context_switch_count": process.context_switch_count,
    }
