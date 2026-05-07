import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Lightbulb,
  PlayCircle,
  Presentation,
  Sparkles,
  Store,
} from "lucide-react";

type GuideStep = "setup" | "budget" | "simulate" | "analytics" | "pitch";

interface StepGuideProps {
  step: GuideStep;
  className?: string;
}

const GUIDES: Record<
  GuideStep,
  {
    eyebrow: string;
    title: string;
    icon: LucideIcon;
    tips: string[];
    outcome: string;
  }
> = {
  setup: {
    eyebrow: "Before You Start",
    title: "Define the venture before the numbers begin.",
    icon: Store,
    tips: [
      "Enter a clear team name so the final report feels presentation-ready.",
      "Pick a shop concept because it sets the story students will explain later.",
      "Use Custom only when the team can describe the business in one short phrase.",
    ],
    outcome: "You can continue when the team identity and shop concept are complete.",
  },
  budget: {
    eyebrow: "Budget Guide",
    title: "Use the sliders like founder trade-off controls.",
    icon: CircleDollarSign,
    tips: [
      "Stay inside each required spending range; invalid rows block progress.",
      "Watch remaining budget while moving sliders or typing exact amounts.",
      "Marketing is optional, but it should not weaken core operating spend.",
    ],
    outcome: "A balanced plan unlocks the month-by-month simulation.",
  },
  simulate: {
    eyebrow: "Operations Guide",
    title: "Run one month at a time and read the impact.",
    icon: PlayCircle,
    tips: [
      "Set projected revenue and miscellaneous expenses before pressing Run Month.",
      "Challenge Mode adds a guided monthly event brief for classroom discussion.",
      "Scenario switches change the business environment, so use them intentionally.",
    ],
    outcome: "Run at least one month before moving to Analytics; six months gives the strongest report.",
  },
  analytics: {
    eyebrow: "Analytics Guide",
    title: "Turn charts into a business explanation.",
    icon: BarChart3,
    tips: [
      "Compare monthly profit with the cumulative line to find momentum.",
      "Use best month, worst month, and break-even as pitch evidence.",
      "Generate Gemini analysis after the simulation to get sharper review notes.",
    ],
    outcome: "Use the numbers here to support the final presentation.",
  },
  pitch: {
    eyebrow: "Pitch Guide",
    title: "Package the simulation into a confident final report.",
    icon: Presentation,
    tips: [
      "Complete reflection fields with specific decisions and lessons learned.",
      "Record a concise pitch that explains the shop, budget, results, and next move.",
      "Use fullscreen for presenting and Export PDF when the report is ready.",
    ],
    outcome: "The final screen becomes the team’s presentation handout.",
  },
};

export function StepGuide({ step, className = "" }: StepGuideProps) {
  const guide = GUIDES[step];
  const Icon = guide.icon;

  return (
    <section className={`step-guide-card overflow-hidden rounded-[1.7rem] border border-white/75 p-5 shadow-soft ${className}`}>
      <div className="relative grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div className="relative">
          <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3 w-3" />
            {guide.eyebrow}
          </div>
          <div className="mt-4 flex items-start gap-4">
            <div className="guide-icon-cube flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">{guide.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.outcome}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {guide.tips.map((tip, index) => (
            <div
              key={tip}
              className="guide-tip-panel rounded-2xl border border-white/75 bg-white/66 p-4"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {index === 0 ? <ClipboardList className="h-3.5 w-3.5" /> : index === 1 ? <Lightbulb className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tip {index + 1}</span>
              </div>
              <p className="text-xs leading-5 text-foreground/78">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
