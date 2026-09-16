const PALETTE = [
  "bg-sky-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-rose-400",
  "bg-teal-400",
  "bg-fuchsia-400",
];

export default function GanttChart({ segments, totalExecutionTime, allPids }) {
  const colorFor = (pid) => PALETTE[allPids.indexOf(pid) % PALETTE.length];
  const totalTime = totalExecutionTime || 1;

  return (
    <div className="card p-5">
      <h2 className="card-title mb-3">Gantt Chart</h2>

      {segments.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No execution yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex h-12 rounded-md overflow-hidden border border-slate-200 min-w-[480px]">
            {segments.map((segment, index) => {
              const widthPct = ((segment.end - segment.start) / totalTime) * 100;
              return (
                <div
                  key={`${segment.pid}-${index}`}
                  className={`${colorFor(segment.pid)} flex items-center justify-center text-white text-xs font-bold mono border-r border-white/30 last:border-r-0`}
                  style={{ width: `${widthPct}%` }}
                  title={`${segment.pid}: ${segment.start} → ${segment.end}`}
                >
                  {segment.pid}
                </div>
              );
            })}
          </div>
          <div className="relative h-4 min-w-[480px] mt-1">
            {[...new Set(segments.flatMap((s) => [s.start, s.end]))]
              .sort((a, b) => a - b)
              .map((t) => (
                <span
                  key={t}
                  className="absolute text-[10px] text-slate-400 mono -translate-x-1/2"
                  style={{ left: `${(t / totalTime) * 100}%` }}
                >
                  {t}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
