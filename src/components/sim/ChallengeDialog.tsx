import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EVENT_META, EventType } from "@/lib/simStore";
import { Mascot } from "./Mascot";
import { Zap, ArrowRight } from "lucide-react";

const CHALLENGE_POOL: { event: EventType; title: string; brief: string }[] = [
  { event: "good",     title: "Viral Moment",         brief: "A reel about your shop blows up online — expect a +20% revenue surge this month." },
  { event: "bad",      title: "Quiet Streets",        brief: "Foot traffic is unusually low. Demand drops 30% — how will you respond?" },
  { event: "expense",  title: "Equipment Breakdown",  brief: "A critical machine breaks. Pay ₹50,000 in unplanned repairs." },
  { event: "festival", title: "Festival Rush",        brief: "Festival season brings a one-time ₹1,00,000 sales boost. Ride the wave!" },
  { event: "none",     title: "Steady Sailing",       brief: "No surprises this month. A great chance to optimise operations." },
];

interface Props {
  open: boolean;
  monthNumber: number;
  onAccept: (event: EventType) => void;
}

export function ChallengeDialog({ open, monthNumber, onAccept }: Props) {
  const [challenge, setChallenge] = useState(CHALLENGE_POOL[0]);

  useEffect(() => {
    if (open) {
      const pick = CHALLENGE_POOL[Math.floor(Math.random() * CHALLENGE_POOL.length)];
      setChallenge(pick);
    }
  }, [open, monthNumber]);

  const meta = EVENT_META[challenge.event];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-elev">
        <div className="bg-gradient-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
            <Zap className="h-3.5 w-3.5" /> Challenge of Month {monthNumber}
          </div>
          <DialogHeader className="mt-2 text-left">
            <DialogTitle className="text-2xl text-primary-foreground">{challenge.title}</DialogTitle>
            <DialogDescription className="text-primary-foreground/85">
              Every month brings a new twist. Read the brief and decide how to react.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-4 p-6">
          <Mascot
            speakKey={`challenge-${monthNumber}-${challenge.event}`}
            message={`Heads up team! ${challenge.title}. ${challenge.brief}`}
          />
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event impact</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                meta.tone === "good" ? "bg-success-soft text-success" :
                meta.tone === "bad" ? "bg-danger-soft text-danger" :
                meta.tone === "warn" ? "bg-warning-soft text-warning" :
                "bg-secondary text-muted-foreground"
              }`}>{meta.label}</span>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => onAccept(challenge.event)}
            className="w-full bg-gradient-primary shadow-glow"
          >
            Accept the Challenge <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
