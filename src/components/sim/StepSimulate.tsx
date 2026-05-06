import { useState } from "react";
import { useSim, formatINR, formatCompact, EVENT_META, EventType } from "@/lib/simStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Play, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";

export function StepSimulate() {
  const { months, currentMonth, runMonth, setStep, teacherMode, toggleTeacher, scenarios, setScenario, resetSim, budget } = useSim();
  const [revenue, setRevenue] = useState(350_000);
  const [misc, setMisc] = useState(20_000);
  const [event, setEvent] = useState<EventType>("none");

  const finished = currentMonth > 6;
  const cumulative = months.reduce((a, m) => a + m.profit, 0);

  const handleRun = () => {
    runMonth({ revenue, misc, event: teacherMode ? event : undefined });
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Step 3 of 5</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Run the business</h2>
          <p className="mt-2 text-muted-foreground">Simulate 6 months of operations one at a time.</p>
        </div>
        <div className="flex gap-3">
          <Tile label="Month" value={`${Math.min(currentMonth, 6)} / 6`} />
          <Tile label="Cumulative P/L" value={formatCompact(cumulative)} tone={cumulative >= 0 ? "success" : "danger"} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        {/* Controls */}
        <Card className="p-5 shadow-soft h-fit space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Month {Math.min(currentMonth, 6)} controls</h3>
            <Button variant="ghost" size="sm" onClick={resetSim}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Projected Revenue</Label>
              <span className="font-mono text-sm">{formatINR(revenue)}</span>
            </div>
            <Slider value={[revenue]} min={200_000} max={500_000} step={10_000}
              onValueChange={([v]) => setRevenue(v)} disabled={finished} />
          </div>

          <div className="space-y-2">
            <Label>Miscellaneous Expense</Label>
            <Input type="number" value={misc} onChange={(e) => setMisc(Math.max(0, +e.target.value || 0))}
              className="font-mono" disabled={finished} />
          </div>

          <div className="rounded-md bg-secondary/60 p-3 text-xs space-y-1">
            <Row k="Rent (monthly)" v={formatINR(budget.rent / 6)} />
            <Row k="Staff (monthly)" v={formatINR(budget.staff / 6)} />
            <Row k="Misc" v={formatINR(misc)} />
            <div className="border-t border-border my-1" />
            <Row k="Total Expenses" v={formatINR(budget.rent / 6 + budget.staff / 6 + misc)} bold />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Teacher Mode</div>
              <div className="text-xs text-muted-foreground">Manually pick event</div>
            </div>
            <Switch checked={teacherMode} onCheckedChange={toggleTeacher} />
          </div>

          {teacherMode && (
            <div className="space-y-2 animate-fade-in">
              <Label>Assign event</Label>
              <Select value={event} onValueChange={(v) => setEvent(v as EventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Scenarios</Label>
            <ScenarioToggle label="Competitor opens (−10%)" k="competitor" />
            <ScenarioToggle label="Rent hike from M4 (+15%)" k="rentHike" />
            <ScenarioToggle label="Online sales boost (+10%)" k="onlineBoost" />
          </div>

          <Button size="lg" onClick={handleRun} disabled={finished}
            className="w-full bg-gradient-primary shadow-glow">
            <Play className="mr-2 h-4 w-4" />
            {finished ? "Simulation complete" : `Run Month ${currentMonth}`}
          </Button>
        </Card>

        {/* Results table */}
        <Card className="p-0 shadow-soft overflow-hidden">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold">Monthly Performance</h3>
            <p className="text-xs text-muted-foreground">Each row appears as you run a month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Month</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3 text-right">Expenses</th>
                  <th className="px-5 py-3 text-right">Profit / Loss</th>
                  <th className="px-5 py-3 text-left">Event</th>
                </tr>
              </thead>
              <tbody>
                {months.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    Run your first month to see results here.
                  </td></tr>
                )}
                {months.map((m) => {
                  const pos = m.profit >= 0;
                  const ev = EVENT_META[m.event];
                  return (
                    <tr key={m.month} className="border-t animate-fade-up">
                      <td className="px-5 py-4 font-medium">M{m.month}</td>
                      <td className="px-5 py-4 text-right font-mono">{formatINR(m.revenue)}</td>
                      <td className="px-5 py-4 text-right font-mono text-muted-foreground">{formatINR(m.expenses)}</td>
                      <td className={`px-5 py-4 text-right font-mono font-semibold ${pos ? "text-success" : "text-danger"}`}>
                        <span className="inline-flex items-center gap-1">
                          {pos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {formatINR(m.profit)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <EventBadge tone={ev.tone}>{ev.label}</EventBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button size="lg" disabled={months.length === 0} onClick={() => setStep(3)} className="bg-gradient-primary shadow-glow">
          View Analytics <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-mono ${bold ? "font-semibold text-foreground" : ""}`}>{v}</span>
    </div>
  );
}

function Tile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger" }) {
  const cls = tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-lg border bg-card px-4 py-2 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg font-semibold ${cls}`}>{value}</div>
    </div>
  );
}

function EventBadge({ tone, children }: { tone: "neutral" | "good" | "bad" | "warn"; children: React.ReactNode }) {
  const map = {
    neutral: "bg-secondary text-muted-foreground",
    good:    "bg-success-soft text-success",
    bad:     "bg-danger-soft text-danger",
    warn:    "bg-warning-soft text-warning",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}>{children}</span>;
}

function ScenarioToggle({ label, k }: { label: string; k: "competitor" | "rentHike" | "onlineBoost" }) {
  const { scenarios, setScenario } = useSim();
  return (
    <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-secondary/50">
      <span>{label}</span>
      <Switch checked={scenarios[k]} onCheckedChange={(v) => setScenario(k, v)} />
    </label>
  );
}
