import type { ReactNode } from "react";
import { useSim } from "@/lib/simStore";
import { Stepper } from "@/components/sim/Stepper";
import { StepSetup } from "@/components/sim/StepSetup";
import { StepBudget } from "@/components/sim/StepBudget";
import { StepSimulate } from "@/components/sim/StepSimulate";
import { StepAnalytics } from "@/components/sim/StepAnalytics";
import { StepSummary } from "@/components/sim/StepSummary";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  LayoutDashboard,
  Maximize,
  PlayCircle,
  Presentation,
  RotateCcw,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ShopVisual } from "@/components/sim/ShopVisual";
import { VisualBackdrop } from "@/components/sim/VisualBackdrop";

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-surface">
      <VisualBackdrop />
      <div className="dashboard-radial absolute inset-0" />
      <div className="dashboard-grid absolute inset-0 opacity-70" />
      <div className="dashboard-vignette absolute inset-0" />
      <div className="ambient-orb left-[-8rem] top-12 h-60 w-60 bg-primary/30" />
      <div className="ambient-orb right-[-4rem] top-28 h-72 w-72 bg-warning/30" />
      <div className="ambient-orb left-[24%] top-[34%] h-72 w-72 bg-primary/10" />

      <header className="sticky top-0 z-30 border-b border-white/60 bg-background/78 backdrop-blur-xl no-print">
        <div className="container flex min-h-16 lg:min-h-20 items-center justify-between gap-4 py-3 lg:py-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl lg:rounded-2xl bg-gradient-hero shadow-soft">
              <Store className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 lg:gap-2 rounded-full border border-primary/10 bg-white/80 px-2 lg:px-2.5 py-0.5 lg:py-1 text-[9px] lg:text-[11px] font-semibold uppercase tracking-[0.15em] lg:tracking-[0.2em] text-primary whitespace-nowrap">
                <LayoutDashboard className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                Dream Shop Dashboard
              </div>
              <h1 className="mt-1 text-sm lg:text-lg font-bold leading-none truncate">Dream Shop Simulator</h1>

            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <HeaderPill icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value="₹20,00,000" />
              <HeaderPill icon={<TrendingUp className="h-3.5 w-3.5" />} label="Sprint" value={`Step ${step + 1} / 5`} />
            </div>
            {teamName && (
              <div className="surface-panel rounded-xl lg:rounded-2xl border border-white/80 px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm shadow-soft">
                <div className="font-semibold leading-none truncate max-w-[80px] lg:max-w-none">{teamName}</div>
                <div className="mt-0.5 lg:mt-1 text-[10px] lg:text-xs text-muted-foreground truncate">{shopLabel}</div>
              </div>
            )}
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleFullscreen} 
                title="Toggle fullscreen" 
                className="h-9 w-9 rounded-xl hover:bg-white/40 active:scale-95 transition-all"
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetSim} 
                title="Reset simulation" 
                className="h-9 w-9 rounded-xl hover:bg-white/40 active:scale-95 transition-all text-destructive"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container pb-3 lg:pb-4 overflow-hidden">
          <Stepper />
        </div>
      </header>

      <main className="container relative z-10 max-w-7xl py-8 md:py-10">
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="hero-console surface-panel flex h-full lg:min-h-[620px] flex-col rounded-[1.5rem] lg:rounded-[2.1rem] border border-white/75 p-5 lg:p-8 shadow-elev">
            <div className="relative">
              <div className="mb-4 lg:mb-5 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3 py-1 text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <span className="h-2 w-2 rounded-full bg-success shadow-glow" />
                {currentMeta.eyebrow}
              </div>
              <h2 className="max-w-3xl text-2xl lg:text-5xl font-bold leading-tight">{currentMeta.title}</h2>
              <p className="mt-3 lg:mt-4 max-w-2xl text-xs lg:text-base leading-relaxed text-muted-foreground">
                {currentMeta.detail}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <QuickMetric label="Phase" value={`0${step + 1}`} />
              <QuickMetric label="Team" value={teamName || "Pending"} />
              <QuickMetric label="Focus" value={["Concept", "Capital", "Operations", "Insights", "Pitch"][step]} />
            </div>

            <HeroCommandCanvas step={step} teamName={teamName} shopLabel={shopLabel} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <ShopVisual />
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <HeroStat label="Current Phase" value={`Step ${step + 1}`} helper={step === 4 ? "Final pitch mode" : "Active workflow"} />
              <HeroStat label="Team" value={teamName || "Pending"} helper={shopLabel || "Choose a concept"} />
              <HeroStat label="Budget" value="₹20,00,000" helper="Initial seed capital" />
            </div>
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

      <footer className="relative z-10 border-t border-white/60 py-6 text-center text-xs text-muted-foreground no-print">
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
    <div className="metric-chip rounded-2xl border border-border/80 bg-secondary/55 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function HeroCommandCanvas({ step, teamName, shopLabel }: { step: number; teamName: string; shopLabel: string }) {
  const progress = ((step + 1) / 5) * 100;
  const nodes = [
    { label: "Concept", icon: Store },
    { label: "Capital", icon: CircleDollarSign },
    { label: "Operate", icon: PlayCircle },
    { label: "Signals", icon: BarChart3 },
    { label: "Pitch", icon: Presentation },
  ];

  return (
    <div className="command-board mt-6 lg:mt-8 flex-1">
      <div className="command-board-orbit hidden lg:block" />
      <div className="command-board-glow command-board-glow-one" />
      <div className="command-board-glow command-board-glow-two" />

      <div className="relative grid h-full gap-4 lg:gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="strategy-map rounded-[1.6rem] border border-white/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Founder Flight Path</div>
              <h3 className="mt-2 text-xl font-bold">Build, test, explain.</h3>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-white/70 px-3 py-2 text-right shadow-sm">
              <div className="font-mono text-lg font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ready</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {nodes.map(({ label, icon: Icon }, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <div key={label} className={`route-node ${active ? "route-node-active" : done ? "route-node-done" : ""}`}>
                  <div className="route-node-icon">
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {done ? "Locked in" : active ? "Working now" : "Queued next"}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/50 p-5 shadow-soft backdrop-blur">
          <div className="absolute inset-0 bg-grid opacity-45" />
          <div className="growth-tower">
            <span className="tower-floor tower-floor-one" />
            <span className="tower-floor tower-floor-two" />
            <span className="tower-floor tower-floor-three" />
            <span className="tower-floor tower-floor-four" />
          </div>

          <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/72 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Live Brief
            </div>
            <div className="mt-2 max-w-[13rem] text-sm font-semibold leading-5">
              {teamName || "Your team"} is shaping a {shopLabel || "shop"} story.
            </div>
          </div>

          <div className="insight-card insight-card-one">
            <ArrowUpRight className="h-4 w-4 text-success" />
            <span>Decision impact</span>
          </div>
          <div className="insight-card insight-card-two">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Profit signals</span>
          </div>
          <div className="insight-card insight-card-three">
            <Wallet className="h-4 w-4 text-warning" />
            <span>Budget control</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
