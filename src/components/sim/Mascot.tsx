import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MascotProps {
  message: string;
  name?: string;
  /** unique id so the same message doesn't replay across renders */
  speakKey: string;
}

/**
 * Friendly advisor mascot — animated SVG character with a speech bubble.
 * Uses the browser's SpeechSynthesis API for narration (no backend cost).
 */
export function Mascot({ message, name = "Penny", speakKey }: MascotProps) {
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mascot-muted") === "1";
  });
  const [speaking, setSpeaking] = useState(false);
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (lastKey.current === speakKey) return;
    lastKey.current = speakKey;
    if (muted) return;
    speak(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakKey, muted]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1.1;
    u.volume = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /female|samantha|google.*us|zira|jenny/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) u.voice = preferred;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem("mascot-muted", next ? "1" : "0");
    if (next) window.speechSynthesis.cancel();
    else speak(message);
  };

  return (
    <div className="relative flex items-start gap-3 lg:gap-4 rounded-xl lg:rounded-2xl border border-primary/15 bg-gradient-to-br from-accent/60 via-background to-background p-3 lg:p-4 shadow-soft animate-fade-up">
      <MascotAvatar speaking={speaking} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
            <span className="font-semibold text-xs lg:text-sm">{name}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[8px] lg:text-[10px] font-medium text-primary w-fit">
              <Sparkles className="h-2 w-2 lg:h-3 lg:w-3" /> Your coach
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1 text-xs lg:text-sm text-foreground/85 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function MascotAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative shrink-0">
      <div
        className={`absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-40 transition-opacity ${
          speaking ? "opacity-70 animate-pulse" : ""
        }`}
      />
      <svg
        viewBox="0 0 80 80"
        className={`relative h-10 w-10 lg:h-16 lg:w-16 drop-shadow-md ${speaking ? "animate-bob" : ""}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(239 84% 60%)" />
            <stop offset="100%" stopColor="hsl(258 90% 66%)" />
          </linearGradient>
        </defs>
        {/* Body / coin */}
        <circle cx="40" cy="40" r="32" fill="url(#bodyGrad)" />
        <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
        {/* Eyes */}
        <g fill="white">
          <ellipse cx="30" cy="36" rx="5" ry={speaking ? 5 : 5.5} />
          <ellipse cx="50" cy="36" rx="5" ry={speaking ? 5 : 5.5} />
        </g>
        <g fill="hsl(222 47% 11%)">
          <circle cx="31" cy="37" r="2.2" />
          <circle cx="51" cy="37" r="2.2" />
        </g>
        {/* Mouth */}
        {speaking ? (
          <ellipse cx="40" cy="52" rx="6" ry="3.5" fill="hsl(222 47% 11%)" />
        ) : (
          <path d="M32 52 Q40 58 48 52" stroke="hsl(222 47% 11%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {/* Cheeks */}
        <circle cx="24" cy="46" r="3" fill="hsl(0 75% 70%)" opacity="0.55" />
        <circle cx="56" cy="46" r="3" fill="hsl(0 75% 70%)" opacity="0.55" />
        {/* ₹ symbol on forehead */}
        <text x="40" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" opacity="0.8">
          ₹
        </text>
      </svg>
    </div>
  );
}
