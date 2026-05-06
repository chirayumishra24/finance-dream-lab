import { useSim } from "@/lib/simStore";
import { Check } from "lucide-react";

const STEPS = [
  { n: 0, label: "Setup" },
  { n: 1, label: "Budget" },
  { n: 2, label: "Simulate" },
  { n: 3, label: "Analytics" },
  { n: 4, label: "Pitch" },
];

export function Stepper() {
  const { step, setStep } = useSim();
  return (
    <nav className="surface-panel rounded-[1.6rem] border border-white/75 p-3 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Simulation Flow</div>
          <div className="mt-1 text-sm font-semibold text-foreground">Progress updates as your team moves from concept to pitch.</div>
        </div>
        <div className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">Step {step + 1} of {STEPS.length}</div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto py-1 sm:gap-3">
      {STEPS.map((s, i) => {
        const active = s.n === step;
        const done = s.n < step;
        return (
          <div key={s.n} className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setStep(s.n as 0 | 1 | 2 | 3 | 4)}
              className={`group flex min-w-[132px] items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all
                ${active ? "border-primary/20 bg-primary/8 text-foreground shadow-sm" :
                  done ? "border-success/15 bg-success-soft text-success" : "border-white/80 bg-white/78 text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-[12px] font-semibold
                ${active ? "bg-primary text-primary-foreground" : done ? "bg-success text-success-foreground" : "bg-secondary"}`}>
                {done ? <Check className="h-3 w-3" /> : s.n + 1}
              </span>
              <span>
                <span className="block">{s.label}</span>
                <span className={`mt-0.5 block text-[11px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {done ? "Completed" : active ? "In progress" : "Upcoming"}
                </span>
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 ${done ? "bg-success/50" : "bg-border/70"}`} />
            )}
          </div>
        );
      })}
      </div>
    </nav>
  );
}
