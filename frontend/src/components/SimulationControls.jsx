const SPEED_OPTIONS = [
  { key: "slow", label: "Slow" },
  { key: "normal", label: "Normal" },
  { key: "fast", label: "Fast" },
];

function Button({ children, onClick, disabled, variant = "default" }) {
  const variants = {
    default: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    warn: "bg-amber-500 text-white hover:bg-amber-600",
    danger: "border border-red-300 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${variants[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function SimulationControls({
  hasResult,
  isPlaying,
  isFinished,
  stepIndex,
  totalSteps,
  speed,
  onStart,
  onPause,
  onResume,
  onStep,
  onReset,
  onLoadExample,
  onSpeedChange,
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="card-title">Simulation Controls</h2>
        {hasResult && (
          <span className="text-xs mono text-slate-500">
            Event {Math.max(stepIndex + 1, 0)} of {totalSteps}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={!hasResult || isPlaying || isFinished} onClick={onStart}>
          Start
        </Button>
        <Button disabled={!isPlaying} onClick={onPause}>
          Pause
        </Button>
        <Button disabled={isPlaying || !hasResult || stepIndex < 0 || isFinished} onClick={onResume}>
          Resume
        </Button>
        <Button disabled={!hasResult || isPlaying || isFinished} onClick={onStep}>
          Step
        </Button>
        <Button variant="danger" disabled={!hasResult} onClick={onReset}>
          Reset
        </Button>
        <Button onClick={onLoadExample}>Load Example</Button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className="text-xs text-slate-500">Simulation Speed:</span>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSpeedChange(opt.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                speed === opt.key ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasResult && (
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${totalSteps ? ((stepIndex + 1) / totalSteps) * 100 : 0}%` }}
          />
        </div>
      )}
    </div>
  );
}
