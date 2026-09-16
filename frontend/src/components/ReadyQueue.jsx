export default function ReadyQueue({ readyQueue, justEnqueuedPid }) {
  return (
    <div className="card p-5">
      <h2 className="card-title mb-3">Ready Queue (FIFO)</h2>

      {readyQueue.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Queue is empty.</p>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          <span className="text-xs text-slate-400 mono mr-1">front</span>
          {readyQueue.map((pid, index) => (
            <div key={`${pid}-${index}`} className="flex items-center gap-2">
              <div
                className={`min-w-[3.5rem] px-3 py-2 rounded-lg border-2 text-center text-sm font-semibold mono transition-all duration-300 ${
                  pid === justEnqueuedPid
                    ? "border-sky-400 bg-sky-50 text-sky-700 scale-105 shadow-md"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {pid}
              </div>
              {index < readyQueue.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
          <span className="text-xs text-slate-400 mono ml-1">back</span>
        </div>
      )}
    </div>
  );
}
