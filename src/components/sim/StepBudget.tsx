import { useSim, TOTAL_BUDGET, formatINR, formatCompact } from "@/lib/simStore";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Mascot } from "./Mascot";

const FIELDS = [
  { key: "rent",      label: "Rent",                min: 300_000, max: 600_000,  required: true,  color: "hsl(239 84% 60%)" },
  { key: "inventory", label: "Stock / Inventory",   min: 500_000, max: 1_000_000, required: true,  color: "hsl(258 90% 66%)" },
  { key: "staff",     label: "Staff Salaries",      min: 200_000, max: 500_000,  required: true,  color: "hsl(199 89% 48%)" },
  { key: "decor",     label: "Decoration & Setup",  min: 100_000, max: 300_000,  required: true,  color: "hsl(38 92% 50%)" },
  { key: "marketing", label: "Marketing (optional)",min: 0,       max: 400_000,  required: false, color: "hsl(152 76% 40%)" },
] as const;

export function StepBudget() {
  const { budget, setBudget, setStep } = useSim();
  const allocated = Object.values(budget).reduce((a, b) => a + b, 0);
  const remaining = TOTAL_BUDGET - allocated;
  const over = remaining < 0;

  const violations = FIELDS.filter(f => {
    const v = budget[f.key];
    if (!f.required && v === 0) return false;
    return v < f.min || v > f.max;
  });

  const valid = !over && violations.length === 0;
  const data: { name: string; value: number; color: string }[] = FIELDS
    .filter(f => budget[f.key] > 0)
    .map(f => ({ name: f.label, value: budget[f.key], color: f.color }));
  if (remaining > 0) data.push({ name: "Unallocated", value: remaining, color: "hsl(220 16% 88%)" });

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Step 2 of 5</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Allocate your budget</h2>
          <p className="mt-2 text-muted-foreground">Distribute ₹20,00,000 across operational categories.</p>
        </div>
        <div className="flex gap-3">
          <StatTile label="Total Budget" value={formatCompact(TOTAL_BUDGET)} />
          <StatTile label="Allocated"    value={formatCompact(allocated)} tone={over ? "danger" : "default"} />
          <StatTile label="Remaining"    value={formatCompact(remaining)} tone={over ? "danger" : remaining === 0 ? "success" : "default"} />
        </div>
      </header>

      <Mascot
        speakKey="budget-intro"
        message="Now the fun part — money! You have twenty lakh rupees. Spread it wisely between rent, inventory, staff, decoration, and marketing. Stay within each range, and don't overshoot the total."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          {FIELDS.map(f => {
            const v = budget[f.key];
            const bad = (f.required && (v < f.min || v > f.max)) || (!f.required && v > f.max);
            return (
              <Card key={f.key} className="p-5 shadow-soft">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-base font-semibold">{f.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Range: {formatCompact(f.min)} – {formatCompact(f.max)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={v}
                      onChange={(e) => setBudget({ [f.key]: Math.max(0, Number(e.target.value) || 0) } as any)}
                      className="w-36 font-mono text-right"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Slider
                    value={[v]}
                    min={0}
                    max={f.max}
                    step={10_000}
                    onValueChange={([val]) => setBudget({ [f.key]: val } as any)}
                  />
                </div>
                {bad && (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Must be between {formatCompact(f.min)} and {formatCompact(f.max)}
                  </div>
                )}
              </Card>
            );
          })}

          {over && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
              <AlertTriangle className="h-4 w-4" />
              You've exceeded the total budget by {formatCompact(-remaining)}.
            </div>
          )}
        </div>

        <Card className="p-5 shadow-soft h-fit lg:sticky lg:top-6">
          <h3 className="mb-1 font-semibold">Allocation Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Live distribution</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v: number) => formatINR(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm">
            {data.map((d, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{formatCompact(d.value)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(0)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button size="lg" disabled={!valid} onClick={() => setStep(2)} className="bg-gradient-primary shadow-glow">
          Start Simulation <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger" }) {
  const toneCls = tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-lg border bg-card px-4 py-2 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}
