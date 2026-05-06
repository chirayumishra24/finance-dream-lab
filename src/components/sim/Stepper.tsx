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
    <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1">
      {STEPS.map((s, i) => {
        const active = s.n === step;
        const done = s.n < step;
        return (
          <div key={s.n} className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setStep(s.n as 0 | 1 | 2 | 3 | 4)}
              className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all
                ${active ? "bg-gradient-primary text-primary-foreground shadow-glow" :
                  done ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold
                ${active ? "bg-white/20" : done ? "bg-success text-success-foreground" : "bg-background"}`}>
                {done ? <Check className="h-3 w-3" /> : s.n + 1}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 ${done ? "bg-success/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
