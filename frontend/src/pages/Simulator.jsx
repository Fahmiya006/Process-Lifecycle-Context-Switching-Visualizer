import { useEffect, useMemo, useRef, useState } from "react";

import ProcessInput, { loadExampleData, validateProcesses } from "../components/ProcessInput.jsx";
import ProcessTable from "../components/ProcessTable.jsx";
import ProcessLifecycle from "../components/ProcessLifecycle.jsx";
import ReadyQueue from "../components/ReadyQueue.jsx";
import CPUVisualizer from "../components/CPUVisualizer.jsx";
import PCBViewer from "../components/PCBViewer.jsx";
import ContextSwitchVisualizer from "../components/ContextSwitchVisualizer.jsx";
import GanttChart from "../components/GanttChart.jsx";
import Statistics from "../components/Statistics.jsx";
import SimulationControls from "../components/SimulationControls.jsx";
import { runSimulation } from "../services/api.js";
import { computeStateAtStep, describeEvent, eventTitle } from "../services/replay.js";

const SPEED_MS = { slow: 1600, normal: 900, fast: 400 };

function deriveTransition(event) {
  if (!event) return null;
  switch (event.event) {
    case "PROCESS_ARRIVAL":
      return { pid: event.pid, from: "NEW", to: "READY" };
    case "DISPATCH":
    case "PROCESS_RUNNING":
      return { pid: event.pid, from: "READY", to: "RUNNING" };
    case "TIME_QUANTUM_EXPIRED":
      return { pid: event.pid, from: "RUNNING", to: "READY" };
    case "PROCESS_TERMINATED":
      return { pid: event.pid, from: "RUNNING", to: "TERMINATED" };
    default:
      return null;
  }
}

export default function Simulator() {
  const initial = loadExampleData();
  const [processes, setProcesses] = useState(initial.processes);
  const [timeQuantum, setTimeQuantum] = useState(initial.timeQuantum);

  const [result, setResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pinnedPid, setPinnedPid] = useState(null);

  const intervalRef = useRef(null);

  const events = result?.events ?? [];
  const hasResult = Boolean(result);
  const isFinished = hasResult && stepIndex >= events.length - 1;

  const simState = useMemo(() => {
    if (!result) return null;
    return computeStateAtStep(result.events, result.gantt_chart, processes, stepIndex);
  }, [result, stepIndex, processes]);

  const lastTransition = useMemo(() => {
    if (!result) return null;
    for (let i = stepIndex; i >= 0; i -= 1) {
      const t = deriveTransition(result.events[i]);
      if (t) return t;
    }
    return null;
  }, [result, stepIndex]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (!result || prev >= result.events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, SPEED_MS[speed]);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, result]);

  const handleLoadExample = () => {
    const example = loadExampleData();
    setProcesses(example.processes);
    setTimeQuantum(example.timeQuantum);
    setResult(null);
    setStepIndex(-1);
    setIsPlaying(false);
    setError(null);
    setPinnedPid(null);
  };

  const handleRunSimulation = async () => {
    const errors = validateProcesses(processes, timeQuantum);
    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await runSimulation({ timeQuantum, processes });
      setResult(data);
      setStepIndex(-1);
      setIsPlaying(false);
      setPinnedPid(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleResume = () => setIsPlaying(true);
  const handleStep = () => {
    setIsPlaying(false);
    setStepIndex((prev) => Math.min(prev + 1, events.length - 1));
  };
  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(-1);
  };

  const activePid = pinnedPid ?? simState?.cpu.pid ?? null;
  const currentEvent = hasResult && stepIndex >= 0 ? events[stepIndex] : null;
  const allPids = processes.map((p) => p.pid);

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold">Process Lifecycle & Context Switching Visualizer</h1>
          <p className="text-sm text-slate-300 mt-1">
            Visualizing OS process states and CPU context switching using Round Robin scheduling.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProcessInput
            processes={processes}
            timeQuantum={timeQuantum}
            onChangeProcesses={setProcesses}
            onChangeQuantum={setTimeQuantum}
            onLoadExample={handleLoadExample}
            onRunSimulation={handleRunSimulation}
            disabled={loading}
          />
          <SimulationControls
            hasResult={hasResult}
            isPlaying={isPlaying}
            isFinished={isFinished}
            stepIndex={stepIndex}
            totalSteps={events.length}
            speed={speed}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStep={handleStep}
            onReset={handleReset}
            onLoadExample={handleLoadExample}
            onSpeedChange={setSpeed}
          />

          <div className="card p-5">
            <h2 className="card-title mb-2">Current Event</h2>
            {!currentEvent ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                {hasResult ? "Press Start or Step to begin." : "Run a simulation to see events here."}
              </p>
            ) : (
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-slate-800">{eventTitle(currentEvent)}</span>
                  <span className="text-xs mono text-slate-400">t = {currentEvent.time}</span>
                </div>
                {(currentEvent.from_process || currentEvent.to_process) && (
                  <div className="text-xs mono text-slate-500 mt-1">
                    From {currentEvent.from_process ?? "—"} → To {currentEvent.to_process ?? "—"}
                  </div>
                )}
                <p className="text-sm text-slate-600 mt-2">{describeEvent(currentEvent)}</p>
              </div>
            )}
          </div>
        </div>

        {simState && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CPUVisualizer
                cpu={simState.cpu}
                process={simState.cpu.pid ? simState.processes[simState.cpu.pid] : null}
                currentTime={simState.currentTime}
                timeQuantum={timeQuantum}
              />
              <div className="lg:col-span-2">
                <ProcessLifecycle
                  selectedPid={activePid}
                  processes={simState.processes}
                  lastTransition={lastTransition}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">Focus process:</span>
              {allPids.map((pid) => (
                <button
                  key={pid}
                  onClick={() => setPinnedPid(pid)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold mono transition-colors ${
                    activePid === pid ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {pid}
                </button>
              ))}
              <button
                onClick={() => setPinnedPid(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  pinnedPid === null ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                Auto (follow CPU)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ReadyQueue readyQueue={simState.readyQueue} justEnqueuedPid={currentEvent?.pid} />
              <PCBViewer
                process={activePid ? simState.processes[activePid] : null}
                highlight={simState.contextSwitch?.stage === "SAVING" && simState.contextSwitch.from === activePid
                  ? "Saving Context"
                  : simState.contextSwitch?.stage === "LOADING" && simState.contextSwitch.to === activePid
                  ? "Restoring Context"
                  : null}
              />
              <ContextSwitchVisualizer contextSwitch={simState.contextSwitch} />
            </div>

            <ProcessTable processes={simState.processes} />

            <GanttChart
              segments={simState.ganttSegments}
              totalExecutionTime={result.total_execution_time}
              allPids={allPids}
            />

            <Statistics statistics={result.statistics} isComplete={isFinished} />

            <div className="card p-5">
              <h2 className="card-title mb-3">Event Log</h2>
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {events.slice(0, stepIndex + 1).map((event, index) => (
                  <div
                    key={index}
                    className={`text-xs px-3 py-2 rounded-md mono ${
                      index === stepIndex ? "bg-amber-50 border border-amber-200 text-amber-800" : "text-slate-500"
                    }`}
                  >
                    <span className="font-semibold">t={event.time}</span> — {describeEvent(event)}
                  </div>
                ))}
                {stepIndex < 0 && <p className="text-sm text-slate-400 py-4 text-center">No events yet.</p>}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
