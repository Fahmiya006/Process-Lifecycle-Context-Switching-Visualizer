import { STATE_STYLES } from "../services/replay.js";

export default function ProcessTable({ processes }) {
  const rows = Object.values(processes).sort((a, b) => a.pid.localeCompare(b.pid));

  return (
    <div className="card p-5">
      <h2 className="card-title mb-3">Process Table</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-3 font-medium">PID</th>
              <th className="py-2 pr-3 font-medium">Arrival</th>
              <th className="py-2 pr-3 font-medium">Burst</th>
              <th className="py-2 pr-3 font-medium">Remaining</th>
              <th className="py-2 pr-3 font-medium">State</th>
              <th className="py-2 pr-3 font-medium">Completion</th>
              <th className="py-2 pr-3 font-medium">Turnaround</th>
              <th className="py-2 pr-3 font-medium">Waiting</th>
              <th className="py-2 pr-3 font-medium">Response</th>
              <th className="py-2 pr-3 font-medium">CS Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const style = STATE_STYLES[p.state];
              return (
                <tr key={p.pid} className="border-b border-slate-100 last:border-0 mono">
                  <td className="py-2 pr-3 font-semibold">{p.pid}</td>
                  <td className="py-2 pr-3">{p.arrivalTime}</td>
                  <td className="py-2 pr-3">{p.burstTime}</td>
                  <td className="py-2 pr-3">{p.remainingTime}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                      {p.state}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{p.completionTime ?? "—"}</td>
                  <td className="py-2 pr-3">{p.turnaroundTime ?? "—"}</td>
                  <td className="py-2 pr-3">{p.waitingTime ?? "—"}</td>
                  <td className="py-2 pr-3">{p.responseTime ?? "—"}</td>
                  <td className="py-2 pr-3">{p.contextSwitchCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
