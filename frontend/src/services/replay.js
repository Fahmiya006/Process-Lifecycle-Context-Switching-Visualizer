/**
 * Reconstructs the full simulator state (process states, ready queue, CPU,
 * context-switch panel, Gantt segments) at any point in the simulation by
 * replaying the backend's chronological event list from scratch.
 *
 * This keeps every visual panel synchronized to a single source of truth
 * (the events array returned by POST /api/simulation/run) instead of each
 * component tracking its own animation state independently.
 */

export function buildInitialState(processInputs) {
  const processes = {};
  processInputs.forEach((input) => {
    processes[input.pid] = {
      pid: input.pid,
      arrivalTime: input.arrivalTime,
      burstTime: input.burstTime,
      remainingTime: input.burstTime,
      state: "NEW",
      programCounter: null,
      stackPointer: null,
      registers: { R1: 0, R2: 0, R3: 0, R4: 0 },
      completionTime: null,
      turnaroundTime: null,
      waitingTime: null,
      responseTime: null,
      contextSwitchCount: 0,
    };
  });

  return {
    processes,
    readyQueue: [],
    cpu: { pid: null, state: "IDLE" },
    contextSwitch: null,
    ganttSegments: [],
    currentTime: 0,
  };
}

function applyPcbDetails(process, details) {
  if (!details) return;
  process.remainingTime = details.remaining_time;
  process.programCounter = details.program_counter;
  process.stackPointer = details.stack_pointer;
  process.registers = details.registers;
  if (details.context_switch_count !== undefined) {
    process.contextSwitchCount = details.context_switch_count;
  }
}

function applyEvent(state, event, ganttChart, ganttPointer) {
  const process = event.pid ? state.processes[event.pid] : null;

  switch (event.event) {
    case "PROCESS_ARRIVAL":
      process.state = "READY";
      applyPcbDetails(process, event.details);
      state.readyQueue.push(event.pid);
      break;

    case "DISPATCH":
      state.readyQueue = state.readyQueue.filter((pid) => pid !== event.pid);
      process.state = "RUNNING";
      applyPcbDetails(process, event.details);
      state.cpu = { pid: event.pid, state: "RUNNING" };
      state.contextSwitch = null;
      break;

    case "CONTEXT_SWITCH":
      state.contextSwitch = {
        stage: "SWITCHING",
        from: event.from_process,
        to: event.to_process,
        savedSnapshot: state.contextSwitch?.savedSnapshot ?? null,
        loadedSnapshot: null,
      };
      state.cpu = { pid: event.from_process, state: "SWITCHING" };
      break;

    case "SAVE_CONTEXT":
      applyPcbDetails(process, event.details);
      state.contextSwitch = {
        stage: "SAVING",
        from: event.pid,
        to: state.contextSwitch?.to ?? null,
        savedSnapshot: event.details,
        loadedSnapshot: null,
      };
      state.cpu = { pid: event.pid, state: "SAVING" };
      break;

    case "LOAD_CONTEXT":
      state.readyQueue = state.readyQueue.filter((pid) => pid !== event.pid);
      applyPcbDetails(process, event.details);
      state.contextSwitch = {
        stage: "LOADING",
        from: state.contextSwitch?.from ?? null,
        to: event.pid,
        savedSnapshot: state.contextSwitch?.savedSnapshot ?? null,
        loadedSnapshot: event.details,
      };
      state.cpu = { pid: event.pid, state: "LOADING" };
      break;

    case "PROCESS_RUNNING":
      state.readyQueue = state.readyQueue.filter((pid) => pid !== event.pid);
      process.state = "RUNNING";
      applyPcbDetails(process, event.details);
      state.cpu = { pid: event.pid, state: "RUNNING" };
      break;

    case "TIME_QUANTUM_EXPIRED":
      process.state = "READY";
      applyPcbDetails(process, event.details);
      state.readyQueue.push(event.pid);
      state.cpu = { pid: event.pid, state: "READY" };
      state.ganttSegments = [...state.ganttSegments, ganttChart[ganttPointer.current]];
      ganttPointer.current += 1;
      break;

    case "PROCESS_TERMINATED":
      process.state = "TERMINATED";
      applyPcbDetails(process, event.details);
      process.completionTime = event.details.completion_time;
      process.turnaroundTime = event.details.turnaround_time;
      process.waitingTime = event.details.waiting_time;
      process.responseTime = event.details.response_time;
      state.cpu = { pid: null, state: "IDLE" };
      state.contextSwitch = null;
      state.ganttSegments = [...state.ganttSegments, ganttChart[ganttPointer.current]];
      ganttPointer.current += 1;
      break;

    case "CPU_IDLE":
      state.cpu = { pid: null, state: "IDLE" };
      state.contextSwitch = null;
      break;

    default:
      break;
  }

  state.currentTime = event.time;
  return state;
}

export function computeStateAtStep(events, ganttChart, processInputs, stepIndex) {
  const state = buildInitialState(processInputs);
  const ganttPointer = { current: 0 };

  for (let i = 0; i <= stepIndex && i < events.length; i += 1) {
    applyEvent(state, events[i], ganttChart, ganttPointer);
  }

  return state;
}

export const STATE_STYLES = {
  NEW: { text: "text-slate-500", bg: "bg-slate-100", ring: "ring-slate-300", dot: "bg-slate-400" },
  READY: { text: "text-sky-600", bg: "bg-sky-50", ring: "ring-sky-300", dot: "bg-sky-500" },
  RUNNING: { text: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-300", dot: "bg-emerald-500" },
  WAITING: { text: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-300", dot: "bg-amber-500" },
  TERMINATED: { text: "text-slate-400", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
};

const EVENT_TITLES = {
  PROCESS_ARRIVAL: "Process Arrival",
  DISPATCH: "Dispatch",
  TIME_QUANTUM_EXPIRED: "Time Quantum Expired",
  SAVE_CONTEXT: "Save Context",
  CONTEXT_SWITCH: "Context Switch",
  LOAD_CONTEXT: "Load Context",
  PROCESS_RUNNING: "Process Running",
  PROCESS_TERMINATED: "Process Terminated",
  CPU_IDLE: "CPU Idle",
};

export function eventTitle(event) {
  return EVENT_TITLES[event.event] ?? event.event;
}

export function describeEvent(event) {
  switch (event.event) {
    case "PROCESS_ARRIVAL":
      return `${event.pid} arrived in the system and entered the READY queue.`;
    case "DISPATCH":
      return `${event.pid} was dispatched to an idle CPU (READY → RUNNING).`;
    case "TIME_QUANTUM_EXPIRED":
      return `${event.pid}'s time quantum expired; it is preempted (RUNNING → READY).`;
    case "SAVE_CONTEXT":
      return `Saving ${event.pid}'s CPU context (PC, SP, registers) into its PCB.`;
    case "CONTEXT_SWITCH":
      return `Context switch: the CPU is handed off from ${event.from_process} to ${event.to_process}.`;
    case "LOAD_CONTEXT":
      return `Restoring ${event.pid}'s saved context from its PCB into the CPU.`;
    case "PROCESS_RUNNING":
      return `${event.pid} is now RUNNING on the CPU.`;
    case "PROCESS_TERMINATED":
      return `${event.pid} finished execution and moved to TERMINATED.`;
    case "CPU_IDLE":
      return `No process is ready; CPU is idle until t=${event.details?.until}.`;
    default:
      return event.event;
  }
}
