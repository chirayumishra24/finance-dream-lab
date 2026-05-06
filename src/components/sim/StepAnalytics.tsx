import { useSim, formatINR, formatCompact } from "@/lib/simStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Area, ComposedChart,
} from "recharts";
import { Mascot } from "./Mascot";

export function StepAnalytics() {
  const { months, setStep } = useSim();

  let cum = 0;
  const data = months.map((m) => {
    cum += m.profit;
    return {
      name: `M${m.month}`,
      profit: m.profit,
      cumulative: cum,
      revenue: m.revenue,
      expenses: m.expenses,
    };
  });

  const total = cum;
  const best = months.reduce((b, m) => (m.profit > (b?.profit ?? -Infinity) ? m : b), months[0]);
  const worst = months.reduce((b, m) => (m.profit < (b?.profit ?? Infinity) ? m : b), months[0]);
  const breakEvenIdx = data.findIndex(d => d.cumulative >= 0);

  return (
    <div className="space-y-8 animate-fade-up">
      <header>
        <p className="text-sm font-medium text-primary">Step 4 of 5</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">Performance analytics</h2>
        <p className="mt-2 text-muted-foreground">Profit trajectory and cumulative position over the simulated period.</p>
      </header>

      <Mascot
        speakKey="analytics-intro"
        message="Time to read the story your numbers tell. Look at when you peaked, when you struggled, and whether you reached break-even. These insights will fuel your final pitch."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPI label="Final P/L" value={formatCompact(total)} tone={total >= 0 ? "success" : "danger"} />
        <KPI label="Best Month" value={best ? `M${best.month} · ${formatCompact(best.profit)}` : "—"} tone="success" />
        <KPI label="Worst Month" value={worst ? `M${worst.month} · ${formatCompact(worst.profit)}` : "—"} tone="danger" />
        <KPI label="Break-even" value={breakEvenIdx >= 0 ? `Month ${breakEvenIdx + 1}` : "Not reached"} />
      </div>

      <Card className="p-5 shadow-soft">
        <h3 className="mb-1 font-semibold">Monthly Profit / Loss</h3>
        <p className="mb-4 text-xs text-muted-foreground">Bars indicate per-month result; line shows cumulative position</p>
        <div className="h-80">
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(239 84% 60%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(239 84% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatCompact(v)} width={70} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                formatter={(v: number) => formatINR(v)}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              <Area type="monotone" dataKey="cumulative" stroke="hsl(239 84% 60%)" strokeWidth={2.5}
                fill="url(#cumGrad)" name="Cumulative" />
              <Line type="monotone" dataKey="profit" stroke="hsl(152 76% 40%)" strokeWidth={2}
                dot={{ r: 4, fill: "hsl(152 76% 40%)" }} name="Monthly P/L" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h3 className="mb-4 font-semibold">Revenue vs Expenses</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatCompact(v)} width={70} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                formatter={(v: number) => formatINR(v)} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(239 84% 60%)" strokeWidth={2} name="Revenue" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(0 75% 55%)" strokeWidth={2} name="Expenses" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button size="lg" onClick={() => setStep(4)} className="bg-gradient-primary shadow-glow">
          View Summary <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function KPI({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger" }) {
  const cls = tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <Card className="p-4 shadow-soft">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold ${cls}`}>{value}</div>
    </Card>
  );
}
