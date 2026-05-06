import type { ReactNode } from "react";
import { useSim, ShopType } from "@/lib/simStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cake, BookOpen, Gamepad2, ToyBrick, Sparkles, ArrowRight, CheckCircle2, Users2, Wand2 } from "lucide-react";
import { Mascot } from "./Mascot";
import { ShopVisual } from "./ShopVisual";

const SHOPS: { type: ShopType; icon: any; desc: string }[] = [
  { type: "Bakery",      icon: Cake,      desc: "Fresh baked goods, daily inventory" },
  { type: "Bookstore",   icon: BookOpen,  desc: "Curated titles, slow but steady" },
  { type: "Toy Store",   icon: ToyBrick,  desc: "Seasonal peaks, festive demand" },
  { type: "Gaming Café", icon: Gamepad2,  desc: "Hourly billing, high footfall" },
  { type: "Custom",      icon: Sparkles,  desc: "Define your own concept" },
];

export function StepSetup() {
  const { teamName, shopType, customShop, setTeam, setShop, setStep } = useSim();
  const valid = teamName.trim().length > 1 && (shopType !== "Custom" || customShop.trim().length > 1);
  const selectedShop = SHOPS.find(({ type }) => type === shopType);
  const selectedLabel = shopType === "Custom" ? customShop || "Your custom concept" : shopType;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="surface-panel rounded-[1.8rem] border border-white/75 p-8 shadow-elev">
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-medium text-primary">Step 1 of 5</p>
            <h2 className="mt-1 text-4xl font-bold tracking-tight">Set up your venture</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Name your team, choose a shop identity, and set the tone for the next six months of decisions.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <IntroChip icon={<Users2 className="h-4 w-4" />} title="Team Identity" text="Give the simulator a believable team name." />
              <IntroChip icon={<Wand2 className="h-4 w-4" />} title="Shop Concept" text="Choose the business flavor that shapes the story." />
              <IntroChip icon={<CheckCircle2 className="h-4 w-4" />} title="Ready Check" text="Complete both fields to unlock the budget step." />
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[160px]">
            {shopType ? <ShopVisual /> : (
              <div className="w-full rounded-[1.5rem] border border-border/80 bg-secondary/45 p-8 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Preview Pending</div>
                <div className="mt-2 text-sm text-muted-foreground font-medium">Select a concept to visualize your venture.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Mascot
        speakKey="setup-intro"
        message="Welcome to Design Your Dream Shop! I'm Penny, your business coach. First, name your team and pick the kind of shop you'd love to run. Each shop has its own personality."
      />

      <Card className="surface-panel rounded-[1.6rem] p-6 shadow-soft">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="team">Team name</Label>
            <Input id="team" placeholder="e.g. The Profit Pioneers" value={teamName}
              onChange={(e) => setTeam(e.target.value)} maxLength={60} />
          </div>
          {shopType === "Custom" && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="custom">Custom shop concept</Label>
              <Input id="custom" placeholder="e.g. Plant Studio" value={customShop}
                onChange={(e) => setShop("Custom", e.target.value)} maxLength={60} />
            </div>
          )}
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Choose a shop</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOPS.map(({ type, icon: Icon, desc }) => {
            const active = shopType === type;
            return (
              <button key={type} onClick={() => setShop(type)}
                className={`group relative overflow-hidden rounded-[1.35rem] border p-5 text-left transition-all
                  ${active ? "border-primary/20 bg-primary/5 shadow-soft" : "border-white/80 bg-white/82 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"}`}>
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg
                  ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{type}</div>
                  {active && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Selected</span>}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" disabled={!valid} onClick={() => setStep(1)} className="bg-gradient-primary shadow-glow">
          Continue to Budget <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function IntroChip({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
