"""Top-level orchestrator: turns a SimulationRequest into a SimulationResponse."""

from app.schemas.simulation import SimulationRequest, SimulationResponse, Statistics
from app.services import process_manager, round_robin


def run_simulation(request: SimulationRequest) -> SimulationResponse:
    processes = process_manager.build_processes(request.processes)

    events, gantt_chart, context_switches = round_robin.run(processes, request.time_quantum)

    total_execution_time = max((entry.end for entry in gantt_chart), default=0)
    total_busy_time = sum(entry.end - entry.start for entry in gantt_chart)

    n = len(processes)
    average_waiting_time = sum(p.waiting_time for p in processes) / n
    average_turnaround_time = sum(p.turnaround_time for p in processes) / n
    average_response_time = sum(p.response_time for p in processes) / n
    cpu_utilization = (total_busy_time / total_execution_time * 100) if total_execution_time else 0.0

    statistics = Statistics(
        average_waiting_time=round(average_waiting_time, 2),
        average_turnaround_time=round(average_turnaround_time, 2),
        average_response_time=round(average_response_time, 2),
        context_switch_count=len(context_switches),
        cpu_utilization=round(cpu_utilization, 2),
        total_execution_time=total_execution_time,
    )

    return SimulationResponse(
        algorithm=request.algorithm,
        time_quantum=request.time_quantum,
        processes=processes,
        events=events,
        gantt_chart=gantt_chart,
        context_switches=context_switches,
        statistics=statistics,
        total_execution_time=total_execution_time,
    )
