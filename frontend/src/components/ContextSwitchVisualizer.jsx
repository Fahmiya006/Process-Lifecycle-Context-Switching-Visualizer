const STAGES = ["SAVING", "SWITCHING", "LOADING"];

const STAGE_LABELS = {
  SAVING: "1. Save Context",
  SWITCHING: "2. Switch CPU State",
  LOADING: "3. Load Context",
};

function PcbMini({ title, snapshot, tone }) {
  return (
    <div className={`rounded-lg border-2 p-3 mono text-xs w-40 ${tone}`}>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">{title}</div>
      {snapshot ? (
        <>
          <div className="font-bold text-sm mb-1">{snapshot.pid}</div>
          <div>PC: {snapshot.program_counter}</div>
          <div>SP: {snapshot.stack_pointer}</div>
          <div>
            R1-R4: {snapshot.registers.R1}, {snapshot.registers.R2}, {snapshot.registers.R3}, {snapshot.registers.R4}
          </div>
        </>
      ) : (
        <div className="text-slate-300">—</div>
      )}
    </div>
  );
}

export default function ContextSwitchVisualizer({ contextSwitch }) {
  const active = contextSwitch?.stage;

  return (
    <div className="card p-5">
      <h2 className="card-title mb-1">Context Switch</h2>
      <p className="text-[11px] text-slate-400 mb-4">
        Context switching saves the state of the currently running process and restores the saved state of
        another process so the CPU can resume it later.
      </p>

      {!contextSwitch ? (
        <p className="text-sm text-slate-400 py-6 text-center">No context switch in progress.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                    active === stage
                      ? "bg-amber-500 text-white shadow-md scale-105"
                      : STAGES.indexOf(active) > i
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {STAGE_LABELS[stage]}
                </div>
                {i < STAGES.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <PcbMini
              title={`Saving: ${contextSwitch.from ?? "—"}`}
              snapshot={contextSwitch.savedSnapshot}
              tone={active === "SAVING" ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}
            />
            <span className="text-2xl text-slate-300">⇄</span>
            <PcbMini
              title={`Loading: ${contextSwitch.to ?? "—"}`}
              snapshot={contextSwitch.loadedSnapshot}
              tone={active === "LOADING" ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}
            />
          </div>

          <p className="text-center text-xs text-slate-500">
            {active === "SAVING" &&
              `Saving ${contextSwitch.from}'s program counter, stack pointer and registers into its PCB.`}
            {active === "SWITCHING" && `CPU is being handed off from ${contextSwitch.from} to ${contextSwitch.to}.`}
            {active === "LOADING" &&
              `Restoring ${contextSwitch.to}'s saved program counter, stack pointer and registers from its PCB.`}
          </p>
        </div>
      )}
    </div>
  );
}
