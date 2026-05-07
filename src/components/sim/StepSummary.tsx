import type { ReactNode } from "react";
import { useSim, formatINR, formatCompact, EVENT_META } from "@/lib/simStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Award, TrendingUp, Users, Wallet, Share2, Download, ArrowLeft, Store, Lightbulb, Maximize2, Palette, Printer, Sparkles } from "lucide-react";
import { ShopVisual } from "./ShopVisual";
import { toast } from "sonner";
import { Mascot } from "./Mascot";
import { PitchRecorder } from "./PitchRecorder";
import { StepGuide } from "./StepGuide";

export function StepSummary() {
  const { teamName, shopType, customShop, budget, months, reflection, activityAnalysis, setReflection, setStep } = useSim();
  const total = months.reduce((a, m) => a + m.profit, 0);
  const shopName = shopType === "Custom" ? customShop || "Custom Shop" : shopType;

  const handleFullscreen = () => {
    const el = document.getElementById("summary-doc");
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="no-print">
        <StepGuide step="pitch" />
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4 no-print">
        <div>
          <p className="text-sm font-medium text-primary">Step 5 of 5</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Final presentation</h2>
          <p className="mt-2 text-muted-foreground">Review your business performance and reflect.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFullscreen}><Maximize2 className="mr-2 h-4 w-4" /> Fullscreen</Button>
          <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
          <Button onClick={() => window.print()} className="bg-gradient-primary shadow-glow">
            <Printer className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </header>

      <div className="no-print">
        <Mascot
          speakKey="summary-intro"
          message="This is your moment! Review the report, then record a 90-second pitch. The AI judge will score your clarity, financial reasoning, and persuasiveness."
        />
      </div>

      <div className="no-print">
        <PitchRecorder />
      </div>

      <div id="summary-doc" className="space-y-6 bg-background p-6 rounded-xl">
        <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
          <ShopVisual />
          <Card className="overflow-hidden p-0 shadow-elev flex flex-col justify-center">
            <div className="bg-gradient-primary p-8 text-primary-foreground h-full">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Final Report</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{teamName || "Team"}</h1>
              <p className="mt-1 text-lg opacity-90">{shopName}</p>
              <div className="mt-6 flex flex-wrap gap-6">
                <Stat label="Net Result" value={formatINR(total)} />
                <Stat label="Months Run" value={`${months.length} / 6`} />
                <Stat label="Total Budget" value={formatCompact(2_000_000)} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">Budget Allocation</h3>
            <ul className="space-y-2 text-sm">
              <Line k="Rent" v={formatINR(budget.rent)} />
              <Line k="Inventory" v={formatINR(budget.inventory)} />
              <Line k="Staff" v={formatINR(budget.staff)} />
              <Line k="Decoration" v={formatINR(budget.decor)} />
              <Line k="Marketing" v={formatINR(budget.marketing)} />
              <div className="border-t pt-2 mt-2">
                <Line k="Total" v={formatINR(Object.values(budget).reduce((a, b) => a + b, 0))} bold />
              </div>
            </ul>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="mb-4 font-semibold">Monthly Performance</h3>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left py-1">M</th><th className="text-right">P/L</th><th className="text-left pl-3">Event</th></tr>
              </thead>
              <tbody>
                {months.map(m => (
                  <tr key={m.month} className="border-t">
                    <td className="py-2 font-medium">M{m.month}</td>
                    <td className={`py-2 text-right font-mono ${m.profit >= 0 ? "text-success" : "text-danger"}`}>
                      {formatINR(m.profit)}
                    </td>
                    <td className="py-2 pl-3 text-muted-foreground text-xs">{EVENT_META[m.event].label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <Card className="p-6 shadow-soft">
          <h3 className="mb-4 font-semibold">Team Reflection</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Biggest challenge</Label>
              <Textarea rows={4} value={reflection.challenge}
                onChange={(e) => setReflection({ challenge: e.target.value })}
                placeholder="What was the hardest decision or situation?" />
            </div>
            <div className="space-y-2">
              <Label>What would you improve</Label>
              <Textarea rows={4} value={reflection.improve}
                onChange={(e) => setReflection({ improve: e.target.value })}
                placeholder="What would you do differently next time?" />
            </div>
          </div>
        </Card>

        {activityAnalysis && (
          <Card className="overflow-hidden p-0 shadow-elev">
            <div className="bg-gradient-primary p-6 text-primary-foreground">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                <Sparkles className="h-3.5 w-3.5" />
                Gemini Activity Review
              </div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{activityAnalysis.headline}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-primary-foreground/85">{activityAnalysis.summary}</p>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-3">
              <SummaryList
                icon={<Lightbulb className="h-4 w-4 text-warning" />}
                title="Insights"
                items={activityAnalysis.activityInsights}
              />
              <SummaryList
                icon={<Sparkles className="h-4 w-4 text-success" />}
                title="Next Moves"
                items={activityAnalysis.actionRecommendations}
              />
              <SummaryList
                icon={<Palette className="h-4 w-4 text-primary" />}
                title="Visual Improvements"
                items={activityAnalysis.visualRecommendations}
              />
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-between no-print">
        <Button variant="outline" onClick={() => setStep(3)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    </div>
  );
}

function SummaryList({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-secondary/35 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/75" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-0.5 font-mono text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Line({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <li className="flex justify-between">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>{k}</span>
      <span className={`font-mono ${bold ? "font-semibold" : ""}`}>{v}</span>
    </li>
  );
}
