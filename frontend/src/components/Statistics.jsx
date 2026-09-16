function StatTile({ label, value, suffix }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-xl font-bold mono text-slate-800">
        {value}
        {suffix && <span className="text-sm font-medium text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

export default function Statistics({ statistics, isComplete }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="card-title">Statistics</h2>
        {!isComplete && <span className="text-[10px] text-amber-500 font-semibold uppercase">In Progress</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile label="Avg Waiting Time" value={statistics.average_waiting_time} />
        <StatTile label="Avg Turnaround Time" value={statistics.average_turnaround_time} />
        <StatTile label="Avg Response Time" value={statistics.average_response_time} />
        <StatTile label="Context Switches" value={statistics.context_switch_count} />
        <StatTile label="CPU Utilization" value={statistics.cpu_utilization} suffix="%" />
        <StatTile label="Total Execution Time" value={statistics.total_execution_time} />
      </div>
    </div>
  );
}
