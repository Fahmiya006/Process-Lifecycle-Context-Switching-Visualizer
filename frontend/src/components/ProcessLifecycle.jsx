import { STATE_STYLES } from "../services/replay.js";

const STATES = ["NEW", "READY", "RUNNING", "TERMINATED"];

function Node({ label, active }) {
  const style = STATE_STYLES[label];
  return (
    <div
      className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-300 ${
        active ? `${style.bg} ${style.text} border-current scale-105 shadow-md` : "bg-white text-slate-400 border-slate-200"
      }`}
    >
      {label}
    </div>
  );
}

function Arrow({ label, active, vertical }) {
  return (
    <div className={`flex items-center ${vertical ? "flex-col" : "flex-row"} gap-1`}>
      <div
        className={`${vertical ? "h-6 w-0.5" : "w-8 h-0.5"} transition-colors duration-300 ${
          active ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      <span className={`text-[10px] uppercase tracking-wide ${active ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}

export default function ProcessLifecycle({ selectedPid, processes, lastTransition }) {
  const process = selectedPid ? processes[selectedPid] : null;
  const currentState = process?.state ?? null;

  const isTransition = (from, to) =>
    lastTransition && lastTransition.pid === selectedPid && lastTransition.from === from && lastTransition.to === to;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title">Process Lifecycle</h2>
        {process && <span className="text-xs mono text-slate-500">Tracking {process.pid}</span>}
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Node label="NEW" active={currentState === "NEW"} />
        <Arrow label="admit" active={isTransition("NEW", "READY") || currentState === "READY" || currentState === "RUNNING" || currentState === "TERMINATED"} />
        <Node label="READY" active={currentState === "READY"} />
        <Arrow label="dispatch" active={isTransition("READY", "RUNNING")} />
        <Node label="RUNNING" active={currentState === "RUNNING"} />
        <Arrow label="finish" active={isTransition("RUNNING", "TERMINATED")} />
        <Node label="TERMINATED" active={currentState === "TERMINATED"} />
      </div>

      <div className="flex justify-center mt-2">
        <div className="flex flex-col items-center">
          <span
            className={`text-xs font-semibold ${
              isTransition("RUNNING", "READY") ? "text-amber-600" : "text-slate-300"
            }`}
          >
            ↩ quantum expired (RUNNING → READY)
          </span>
        </div>
      </div>

      {!process && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Select a process below to trace its lifecycle transitions.
        </p>
      )}
    </div>
  );
}
