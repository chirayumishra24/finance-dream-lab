import type { ReactNode } from "react";
import { useSim } from "@/lib/simStore";
import { Stepper } from "@/components/sim/Stepper";
import { StepSetup } from "@/components/sim/StepSetup";
import { StepBudget } from "@/components/sim/StepBudget";
import { StepSimulate } from "@/components/sim/StepSimulate";
import { StepAnalytics } from "@/components/sim/StepAnalytics";
import { StepSummary } from "@/components/sim/StepSummary";
import { Button } from "@/components/ui/button";
import { Store, RotateCcw, Wallet, TrendingUp, LayoutDashboard } from "lucide-react";

const STEP_META = [
  {
    eyebrow: "Launch The Venture",
    title: "Shape the shop before the numbers start moving.",
    detail: "Pick a concept, place the bets, then guide the business through six pressure-filled months.",
  },
  {
    eyebrow: "Build The Plan",
    title: "Allocate capital like a founder, not a passenger.",
    detail: "Balance mandatory spend with growth bets so you can survive shocks and still create upside.",
  },
  {
    eyebrow: "Operate Month By Month",
    title: "Every decision changes the next chapter of the story.",
    detail: "Adjust revenue expectations, absorb events, and watch whether your margins stay alive.",
  },
  {
    eyebrow: "Read The Signals",
    title: "Turn the simulation into a convincing business narrative.",
    detail: "Spot the peaks, the misses, and the patterns that make the final presentation stronger.",
  },
  {
    eyebrow: "Present The Outcome",
    title: "Package the numbers into a sharp final report.",
    detail: "Use your performance, reflections, and AI feedback to deliver a stronger pitch.",
  },
] as const;

const Index = () => {
  const { step, resetSim, teamName, shopType, customShop } = useSim();
  const shopLabel = shopType === "Custom" ? customShop : shopType;
  const currentMeta = STEP_META[step];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-surface">
      <div className="dashboard-radial absolute inset-0" />
      <div className="dashboard-grid absolute inset-0 opacity-70" />
      <div className="dashboard-vignette absolute inset-0" />
      <div className="ambient-orb left-[-8rem] top-12 h-60 w-60 bg-primary/30" />
      <div className="ambient-orb right-[-4rem] top-28 h-72 w-72 bg-warning/30" />
      <div className="ambient-orb left-[24%] top-[34%] h-72 w-72 bg-primary/10" />

      <header className="sticky top-0 z-30 border-b border-white/60 bg-background/78 backdrop-blur-xl no-print">
        <div className="container flex min-h-20 items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero shadow-soft">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                <LayoutDashboard className="h-3 w-3" />
                Dream Shop Dashboard
              </div>
              <h1 className="mt-2 text-lg font-bold leading-none">Design Your Dream Shop</h1>
              <p className="mt-1 text-xs text-muted-foreground">Minimal simulator workspace for classroom business strategy</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <HeaderPill icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value="₹20,00,000" />
            <HeaderPill icon={<TrendingUp className="h-3.5 w-3.5" />} label="Sprint" value={`Step ${step + 1} / 5`} />
            {teamName && (
              <div className="surface-panel rounded-2xl border border-white/80 px-4 py-3 text-sm shadow-soft">
                <div className="font-semibold leading-none">{teamName}</div>
                <div className="mt-1 text-xs text-muted-foreground">{shopLabel}</div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={resetSim} title="Reset simulation" className="rounded-xl">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="container pb-4">
          <Stepper />
        </div>
      </header>

      <main className="container max-w-7xl py-8 md:py-10">
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="surface-panel rounded-[1.9rem] border border-white/75 p-7 shadow-elev md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {currentMeta.eyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">{currentMeta.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {currentMeta.detail}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <QuickMetric label="Phase" value={`0${step + 1}`} />
              <QuickMetric label="Team" value={teamName || "Pending"} />
              <QuickMetric label="Focus" value={["Concept", "Capital", "Operations", "Insights", "Pitch"][step]} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <HeroStat label="Current Phase" value={`Step ${step + 1}`} helper={step === 4 ? "Final pitch mode" : "Active workflow"} />
            <HeroStat label="Team" value={teamName || "Pending"} helper={shopLabel || "Choose a concept"} />
            <HeroStat label="Shop" value={shopLabel || "Unselected"} helper="Identity updates in real time" />
          </div>
        </section>

        <div className="mx-auto max-w-6xl">
          {step === 0 && <StepSetup />}
          {step === 1 && <StepBudget />}
          {step === 2 && <StepSimulate />}
          {step === 3 && <StepAnalytics />}
          {step === 4 && <StepSummary />}
        </div>
      </main>

      <footer className="border-t border-white/60 py-6 text-center text-xs text-muted-foreground no-print">
        Built for classroom learning · Total budget ₹20,00,000
      </footer>
    </div>
  );
};

function HeaderPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="surface-panel flex items-center gap-3 rounded-2xl border border-white/80 px-4 py-3 shadow-soft">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="font-mono text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="surface-panel rounded-[1.6rem] border border-white/80 px-4 py-4 shadow-soft">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
    </div>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-secondary/55 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

export default Index;
