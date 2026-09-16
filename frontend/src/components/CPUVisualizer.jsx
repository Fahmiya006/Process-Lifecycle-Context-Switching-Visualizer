import { STATE_STYLES } from "../services/replay.js";

export default function CPUVisualizer({ cpu, process, currentTime, timeQuantum }) {
  const isBusy = cpu.pid !== null;
  const style = isBusy ? STATE_STYLES.RUNNING : STATE_STYLES.NEW;

  let quantumRemaining = null;
  if (process && isBusy) {
    quantumRemaining = Math.min(timeQuantum, process.remainingTime);
  }

  return (
    <div className="card p-6 flex flex-col items-center">
      <h2 className="card-title mb-4 self-start">CPU</h2>

      <div
        className={`w-40 h-40 rounded-2xl border-4 flex flex-col items-center justify-center transition-all duration-300 ${
          isBusy ? `${style.ring} ${style.bg} border-emerald-400 shadow-lg` : "border-dashed border-slate-300 bg-slate-50"
        }`}
      >
        <span className="text-[10px] uppercase tracking-wide text-slate-400">Current Process</span>
        <span className={`text-3xl font-bold mono ${isBusy ? "text-emerald-700" : "text-slate-300"}`}>
          {cpu.pid ?? "—"}
        </span>
        <span
          className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isBusy ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
          }`}
        >
          {cpu.state}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 w-full text-center">
        <div className="rounded-lg bg-slate-50 border border-slate-100 py-2">
          <div className="text-[10px] uppercase text-slate-400">Remaining Burst</div>
          <div className="text-lg font-semibold mono">{process ? process.remainingTime : "—"}</div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 py-2">
          <div className="text-[10px] uppercase text-slate-400">Quantum Slice</div>
          <div className="text-lg font-semibold mono">{quantumRemaining ?? "—"}</div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 py-2 col-span-2">
          <div className="text-[10px] uppercase text-slate-400">Current Time</div>
          <div className="text-lg font-semibold mono">{currentTime}</div>
        </div>
      </div>
    </div>
  );
}
