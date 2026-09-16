import { STATE_STYLES } from "../services/replay.js";

export default function PCBViewer({ process, highlight }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="card-title">Process Control Block</h2>
        {highlight && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 animate-pulse">
            {highlight}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mb-3">
        Conceptual PCB model for teaching purposes — not the host machine's real PCB.
      </p>

      {!process ? (
        <p className="text-sm text-slate-400 py-6 text-center">No process selected.</p>
      ) : (
        <div className="space-y-3 mono">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">PID</span>
            <span className="font-semibold">{process.pid}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">State</span>
            <span className={`font-semibold ${STATE_STYLES[process.state].text}`}>{process.state}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Program Counter</span>
            <span>{process.programCounter ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Stack Pointer</span>
            <span>{process.stackPointer ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Remaining Burst</span>
            <span>{process.remainingTime}</span>
          </div>

          <div>
            <div className="text-slate-500 text-sm mb-1">Registers</div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(process.registers).map(([reg, value]) => (
                <div key={reg} className="rounded-md bg-slate-50 border border-slate-100 py-1.5 text-center">
                  <div className="text-[10px] text-slate-400">{reg}</div>
                  <div className="text-sm font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
