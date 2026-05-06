import { useSim, ShopType } from "@/lib/simStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cake, BookOpen, Gamepad2, ToyBrick, Sparkles, ArrowRight } from "lucide-react";

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

  return (
    <div className="space-y-8 animate-fade-up">
      <header>
        <p className="text-sm font-medium text-primary">Step 1 of 5</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">Set up your venture</h2>
        <p className="mt-2 text-muted-foreground">Name your team and choose the kind of shop you'll operate for the next 6 months.</p>
      </header>

      <Card className="p-6 shadow-soft">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHOPS.map(({ type, icon: Icon, desc }) => {
            const active = shopType === type;
            return (
              <button key={type} onClick={() => setShop(type)}
                className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all
                  ${active ? "border-primary bg-accent shadow-glow" : "border-border bg-card hover:border-primary/40 hover:shadow-soft"}`}>
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg
                  ${active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{type}</div>
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
