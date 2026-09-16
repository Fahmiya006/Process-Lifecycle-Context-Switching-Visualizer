"""
Core Round Robin CPU scheduling algorithm.

Produces a chronological list of SimulationEvent objects describing every
process-lifecycle transition and context switch, plus a Gantt chart and a
list of context switches, so the frontend can replay the simulation step
by step instead of only seeing the final result.
"""

from collections import deque
from typing import List, Tuple

from app.schemas.process import Process, ProcessState
from app.schemas.simulation import ContextSwitchEntry, GanttEntry, SimulationEvent
from app.services import pcb_manager


def run(processes: List[Process], time_quantum: int) -> Tuple[
    List[SimulationEvent], List[GanttEntry], List[ContextSwitchEntry]
]:
    events: List[SimulationEvent] = []
    gantt_chart: List[GanttEntry] = []
    context_switches: List[ContextSwitchEntry] = []

    by_pid = {process.pid: process for process in processes}
    arrival_order = sorted(processes, key=lambda p: p.arrival_time)
    queue: deque = deque()
    arrival_index = 0
    total = len(processes)
    completed = 0
    time = 0
    active_pid = None  # pid the CPU currently "holds" the context of

    def admit_arrivals(up_to_time: int) -> None:
        nonlocal arrival_index
        while arrival_index < total and arrival_order[arrival_index].arrival_time <= up_to_time:
            process = arrival_order[arrival_index]
            process.state = ProcessState.READY
            events.append(
                SimulationEvent(
                    time=process.arrival_time,
                    event="PROCESS_ARRIVAL",
                    pid=process.pid,
                    details=pcb_manager.snapshot(process),
                )
            )
            queue.append(process)
            arrival_index += 1

    admit_arrivals(0)

    while completed < total:
        if not queue:
            next_arrival_time = arrival_order[arrival_index].arrival_time
            events.append(
                SimulationEvent(time=time, event="CPU_IDLE", details={"until": next_arrival_time})
            )
            time = next_arrival_time
            admit_arrivals(time)
            active_pid = None
            continue

        process = queue.popleft()

        active_pid_before = active_pid
        active_pid = process.pid
        process.state = ProcessState.RUNNING
        if process.response_time is None:
            process.response_time = time - process.arrival_time

        if active_pid_before is None:
            events.append(
                SimulationEvent(
                    time=time, event="DISPATCH", pid=process.pid, details=pcb_manager.snapshot(process)
                )
            )
        elif active_pid_before != process.pid:
            events.append(
                SimulationEvent(
                    time=time,
                    event="CONTEXT_SWITCH",
                    from_process=active_pid_before,
                    to_process=process.pid,
                )
            )
            context_switches.append(ContextSwitchEntry(time=time, from_=active_pid_before, to=process.pid))
            outgoing_process = by_pid[active_pid_before]
            if outgoing_process.state != ProcessState.TERMINATED:
                # A terminated process has no context left to save/resume, so it
                # is not "switched away from" again -- only preempted processes are.
                outgoing_process.context_switch_count += 1
            process.context_switch_count += 1
            events.append(
                SimulationEvent(
                    time=time, event="LOAD_CONTEXT", pid=process.pid, details=pcb_manager.snapshot(process)
                )
            )
            events.append(
                SimulationEvent(
                    time=time,
                    event="PROCESS_RUNNING",
                    pid=process.pid,
                    details=pcb_manager.snapshot(process),
                )
            )
        else:
            events.append(
                SimulationEvent(
                    time=time,
                    event="PROCESS_RUNNING",
                    pid=process.pid,
                    details=pcb_manager.snapshot(process),
                )
            )

        run_time = min(time_quantum, process.remaining_time)
        exec_start = time
        exec_end = time + run_time

        gantt_chart.append(GanttEntry(pid=process.pid, start=exec_start, end=exec_end))

        time = exec_end
        process.remaining_time -= run_time
        pcb_manager.advance_execution(process, run_time)

        admit_arrivals(time)

        if process.remaining_time == 0:
            process.state = ProcessState.TERMINATED
            process.completion_time = time
            process.turnaround_time = process.completion_time - process.arrival_time
            process.waiting_time = process.turnaround_time - process.burst_time
            termination_details = pcb_manager.snapshot(process)
            termination_details.update(
                completion_time=process.completion_time,
                turnaround_time=process.turnaround_time,
                waiting_time=process.waiting_time,
                response_time=process.response_time,
            )
            events.append(
                SimulationEvent(
                    time=time, event="PROCESS_TERMINATED", pid=process.pid, details=termination_details
                )
            )
            completed += 1
        else:
            process.state = ProcessState.READY
            events.append(
                SimulationEvent(
                    time=time, event="TIME_QUANTUM_EXPIRED", pid=process.pid, details=pcb_manager.snapshot(process)
                )
            )
            events.append(
                SimulationEvent(
                    time=time, event="SAVE_CONTEXT", pid=process.pid, details=pcb_manager.snapshot(process)
                )
            )
            queue.append(process)

    return events, gantt_chart, context_switches
