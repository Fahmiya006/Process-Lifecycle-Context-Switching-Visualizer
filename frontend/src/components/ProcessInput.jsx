const EXAMPLE_PROCESSES = [
  { pid: "P1", arrivalTime: 0, burstTime: 5 },
  { pid: "P2", arrivalTime: 1, burstTime: 3 },
  { pid: "P3", arrivalTime: 2, burstTime: 4 },
  { pid: "P4", arrivalTime: 4, burstTime: 2 },
];
const EXAMPLE_QUANTUM = 2;

export function loadExampleData() {
  return { processes: EXAMPLE_PROCESSES.map((p) => ({ ...p })), timeQuantum: EXAMPLE_QUANTUM };
}

export function validateProcesses(processes, timeQuantum) {
  const errors = [];

  if (!Number.isInteger(timeQuantum) || timeQuantum <= 0) {
    errors.push("Time quantum must be a positive integer.");
  }

  if (processes.length === 0) {
    errors.push("Add at least one process.");
  }

  const seenPids = new Set();
  processes.forEach((process, index) => {
    const label = process.pid || `Row ${index + 1}`;
    if (!process.pid || !process.pid.trim()) {
      errors.push(`${label}: PID cannot be empty.`);
    } else if (seenPids.has(process.pid)) {
      errors.push(`Duplicate PID: ${process.pid}`);
    } else {
      seenPids.add(process.pid);
    }
    if (!Number.isInteger(process.arrivalTime) || process.arrivalTime < 0) {
      errors.push(`${label}: arrival time must be >= 0.`);
    }
    if (!Number.isInteger(process.burstTime) || process.burstTime <= 0) {
      errors.push(`${label}: burst time must be > 0.`);
    }
  });

  return errors;
}

let nextRowId = EXAMPLE_PROCESSES.length + 1;

export default function ProcessInput({
  processes,
  timeQuantum,
  onChangeProcesses,
  onChangeQuantum,
  onLoadExample,
  onRunSimulation,
  disabled,
}) {
  const updateProcess = (index, field, value) => {
    const next = processes.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChangeProcesses(next);
  };

  const addProcess = () => {
    const pid = `P${nextRowId++}`;
    onChangeProcesses([...processes, { pid, arrivalTime: 0, burstTime: 1 }]);
  };

  const removeProcess = (index) => {
    onChangeProcesses(processes.filter((_, i) => i !== index));
  };

  const errors = validateProcesses(processes, timeQuantum);

  return (
    <div className="card p-5">
      <h2 className="card-title mb-3">Process Input</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-3 font-medium">Process</th>
              <th className="py-2 pr-3 font-medium">Arrival Time</th>
              <th className="py-2 pr-3 font-medium">Burst Time</th>
              <th className="py-2 pr-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3">
                  <input
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 mono"
                    value={process.pid}
                    disabled={disabled}
                    onChange={(e) => updateProcess(index, "pid", e.target.value.trim())}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    className="w-24 rounded-md border border-slate-300 px-2 py-1 mono"
                    value={process.arrivalTime}
                    disabled={disabled}
                    onChange={(e) => updateProcess(index, "arrivalTime", Number(e.target.value))}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={1}
                    className="w-24 rounded-md border border-slate-300 px-2 py-1 mono"
                    value={process.burstTime}
                    disabled={disabled}
                    onChange={(e) => updateProcess(index, "burstTime", Number(e.target.value))}
                  />
                </td>
                <td className="py-2 pr-3">
                  <button
                    className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40"
                    disabled={disabled}
                    onClick={() => removeProcess(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          className="px-3 py-1.5 rounded-md border border-slate-300 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
          disabled={disabled}
          onClick={addProcess}
        >
          + Add Process
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-600 ml-auto">
          Time Quantum
          <input
            type="number"
            min={1}
            className="w-16 rounded-md border border-slate-300 px-2 py-1 mono"
            value={timeQuantum}
            disabled={disabled}
            onChange={(e) => onChangeQuantum(Number(e.target.value))}
          />
        </label>
      </div>

      {errors.length > 0 && (
        <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 space-y-1">
          {errors.map((err) => (
            <div key={err}>{err}</div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          className="px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 disabled:opacity-40"
          disabled={disabled}
          onClick={onLoadExample}
        >
          Load Example
        </button>
        <button
          className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40"
          disabled={disabled || errors.length > 0}
          onClick={onRunSimulation}
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
}
