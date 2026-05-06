import { useSim } from "@/lib/simStore";
import { Stepper } from "@/components/sim/Stepper";
import { StepSetup } from "@/components/sim/StepSetup";
import { StepBudget } from "@/components/sim/StepBudget";
import { StepSimulate } from "@/components/sim/StepSimulate";
import { StepAnalytics } from "@/components/sim/StepAnalytics";
import { StepSummary } from "@/components/sim/StepSummary";
import { Button } from "@/components/ui/button";
import { Store, RotateCcw } from "lucide-react";

const Index = () => {
  const { step, resetSim, teamName, shopType, customShop } = useSim();
  const shopLabel = shopType === "Custom" ? customShop : shopType;

  return (
    <div className="min-h-screen bg-gradient-surface">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md no-print">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Store className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">Design Your Dream Shop</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Classroom Business Simulator</p>
            </div>
          </div>
          {teamName && (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="text-right">
                <div className="font-semibold leading-none">{teamName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{shopLabel}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetSim} title="Reset simulation">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="container pb-3">
          <Stepper />
        </div>
      </header>

      <main className="container py-8 md:py-12 max-w-6xl">
        {step === 0 && <StepSetup />}
        {step === 1 && <StepBudget />}
        {step === 2 && <StepSimulate />}
        {step === 3 && <StepAnalytics />}
        {step === 4 && <StepSummary />}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground no-print">
        Built for classroom learning · Total budget ₹20,00,000
      </footer>
    </div>
  );
};

export default Index;
