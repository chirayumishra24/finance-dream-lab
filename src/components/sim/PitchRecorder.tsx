import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Loader2, RotateCcw, Sparkles, Award } from "lucide-react";
import { useSim } from "@/lib/simStore";
import { toast } from "sonner";

const PITCH_DURATION = 90; // seconds

export function PitchRecorder() {
  const { teamName, shopType, customShop, months, pitch, setPitch } = useSim();
  const shopName = shopType === "Custom" ? customShop || "Custom Shop" : shopType;
  const finalPL = months.reduce((a, m) => a + m.profit, 0);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [interim, setInterim] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => stop(true);
    // eslint-disable-next-line
  }, []);

  function start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    transcriptRef.current = "";
    setInterim("");
    setPitch({ transcript: "", durationSec: 0, review: null });

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e: any) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) transcriptRef.current += r[0].transcript + " ";
        else interimText += r[0].transcript;
      }
      setInterim(interimText);
    };
    rec.onerror = (e: any) => {
      console.warn("recognition error", e);
      if (e.error === "not-allowed") toast.error("Microphone permission denied");
    };
    rec.onend = () => {
      if (recording) {
        // auto-restart if we still want to record (Chrome stops after silence)
        try { rec.start(); } catch {}
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}

    startTimeRef.current = Date.now();
    setRecording(true);
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(s);
      if (s >= PITCH_DURATION) stop();
    }, 200);
  }

  function stop(silent = false) {
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.onend = null; rec.stop(); } catch {}
      recognitionRef.current = null;
    }
    const finalTranscript = (transcriptRef.current + " " + interim).trim();
    const dur = Math.min(PITCH_DURATION, Math.floor((Date.now() - startTimeRef.current) / 1000));
    if (!silent && finalTranscript.length > 0) {
      setPitch({ transcript: finalTranscript, durationSec: dur });
    }
  }

  async function submitForReview() {
    if (!pitch.transcript) { toast.error("Record a pitch first"); return; }
    setSubmitting(true);
    try {
      const apiResponse = await fetch("/api/review-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: pitch.transcript,
          durationSec: pitch.durationSec,
          teamName, shopName, finalPL, monthsRun: months.length,
        }),
      });

      const data = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(data?.error || "Could not get review");
      if (data?.error) throw new Error(data.error);
      setPitch({ review: data.review });
      toast.success("AI review ready!");
    } catch (e: any) {
      toast.error(e.message || "Could not get review");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    stop(true);
    setElapsed(0);
    setInterim("");
    transcriptRef.current = "";
    setPitch({ transcript: "", durationSec: 0, review: null });
  }

  const remaining = PITCH_DURATION - elapsed;
  const pct = (elapsed / PITCH_DURATION) * 100;
  const review = pitch.review;

  return (
    <Card className="overflow-hidden p-0 shadow-soft">
      <div className="border-b bg-gradient-to-r from-accent/60 to-background px-6 py-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <Award className="h-3.5 w-3.5" /> The Pitch
        </div>
        <h3 className="mt-1 text-xl font-bold tracking-tight">Record your 90-second pitch</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Hit record, sell your shop's story, then let the AI judge score it.
        </p>
      </div>

      <div className="p-6 space-y-5">
        {!supported ? (
          <div className="rounded-md border border-warning/40 bg-warning-soft p-4 text-sm text-warning">
            Live transcription is not supported in this browser. Try Chrome or Edge.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <button
                onClick={recording ? () => stop() : start}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground shadow-glow transition-transform hover:scale-105 ${
                  recording ? "bg-gradient-danger" : "bg-gradient-primary"
                }`}
                aria-label={recording ? "Stop recording" : "Start recording"}
              >
                {recording && <span className="absolute inset-0 rounded-full bg-danger/40 animate-pulse-ring" />}
                {recording ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
              </button>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tabular-nums">
                    {fmt(elapsed)} <span className="text-sm text-muted-foreground">/ {fmt(PITCH_DURATION)}</span>
                  </span>
                  <span className={`text-xs font-medium ${recording ? "text-danger" : "text-muted-foreground"}`}>
                    {recording ? `● Recording — ${remaining}s left` : pitch.transcript ? "Recorded" : "Ready"}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all ${recording ? "bg-gradient-danger" : "bg-gradient-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {(recording || pitch.transcript) && (
              <div className="rounded-lg border bg-secondary/40 p-4 max-h-48 overflow-y-auto">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Live transcript
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {pitch.transcript || transcriptRef.current}
                  <span className="text-muted-foreground">{interim}</span>
                  {!pitch.transcript && !transcriptRef.current && !interim && (
                    <span className="text-muted-foreground italic">Start speaking…</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={submitForReview}
                disabled={!pitch.transcript || submitting || recording}
                className="bg-gradient-primary shadow-glow"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {submitting ? "Reviewing…" : review ? "Re-review pitch" : "Get AI Review"}
              </Button>
              {(pitch.transcript || elapsed > 0) && (
                <Button variant="ghost" onClick={reset} disabled={recording || submitting}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              )}
            </div>
          </>
        )}

        {review && (
          <div className="space-y-4 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-accent/40 to-background p-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">AI Pitch Review</h4>
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-glow">
                <Award className="h-3.5 w-3.5" /> {(review.scores?.overall || 0)}/10
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ScoreCell label="Clarity" v={review.scores?.clarity || 0} />
              <ScoreCell label="Financials" v={review.scores?.financials || 0} />
              <ScoreCell label="Persuasion" v={review.scores?.persuasiveness || 0} />
            </div>

            <p className="text-sm italic text-muted-foreground">"{review.summary || "No summary provided."}"</p>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-success mb-1.5">Strengths</div>
                <ul className="space-y-1 text-sm">
                  {(review.strengths || []).map((s, i) => <li key={i} className="flex gap-2"><span className="text-success">✓</span>{s}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-warning mb-1.5">Improve</div>
                <ul className="space-y-1 text-sm">
                  {(review.improvements || []).map((s, i) => <li key={i} className="flex gap-2"><span className="text-warning">→</span>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ScoreCell({ label, v }: { label: string; v: number }) {
  const tone = v >= 8 ? "text-success" : v >= 5 ? "text-foreground" : "text-warning";
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-bold ${tone}`}>{v}<span className="text-xs text-muted-foreground">/10</span></div>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
