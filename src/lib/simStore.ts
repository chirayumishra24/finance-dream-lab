import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TOTAL_BUDGET = 2_000_000;

export type ShopType = "Bakery" | "Bookstore" | "Toy Store" | "Gaming Café" | "Custom";

export type EventType =
  | "none"
  | "good"
  | "bad"
  | "expense"
  | "festival";

export const EVENT_META: Record<EventType, { label: string; tone: "neutral" | "good" | "bad" | "warn" }> = {
  none:     { label: "No Event",          tone: "neutral" },
  good:     { label: "Good Month +20%",   tone: "good" },
  bad:      { label: "Bad Month −30%",    tone: "bad" },
  expense:  { label: "Unexpected −₹50K",  tone: "warn" },
  festival: { label: "Festival +₹1L",     tone: "good" },
};

export interface Budget {
  rent: number;
  inventory: number;
  staff: number;
  decor: number;
  marketing: number;
}

export interface MonthResult {
  month: number;
  baseRevenue: number;
  revenue: number;
  expenses: number;
  profit: number;
  event: EventType;
  misc: number;
}

export type Step = 0 | 1 | 2 | 3 | 4;

export interface PitchReview {
  scores: { clarity: number; financials: number; persuasiveness: number; overall: number };
  strengths: string[];
  improvements: string[];
  summary: string;
}

interface State {
  step: Step;
  teamName: string;
  shopType: ShopType;
  customShop: string;
  budget: Budget;
  months: MonthResult[];
  currentMonth: number; // 1..6 next to run; 7 when finished
  teacherMode: boolean; // when true: monthly Challenge popup
  pendingChallenge: EventType | null;
  scenarios: { competitor: boolean; rentHike: boolean; onlineBoost: boolean };
  reflection: { challenge: string; improve: string };
  pitch: { transcript: string; durationSec: number; review: PitchReview | null };

  setStep: (s: Step) => void;
  setTeam: (name: string) => void;
  setShop: (s: ShopType, custom?: string) => void;
  setBudget: (b: Partial<Budget>) => void;
  runMonth: (input: { revenue: number; misc: number; event?: EventType }) => void;
  resetSim: () => void;
  toggleTeacher: () => void;
  setPendingChallenge: (e: EventType | null) => void;
  setScenario: (k: keyof State["scenarios"], v: boolean) => void;
  setReflection: (r: Partial<State["reflection"]>) => void;
  setPitch: (p: Partial<State["pitch"]>) => void;
}

const initialBudget: Budget = {
  rent: 400_000,
  inventory: 700_000,
  staff: 350_000,
  decor: 200_000,
  marketing: 150_000,
};

function rollEvent(): EventType {
  // Weighted: more neutral, less extreme
  const r = Math.random();
  if (r < 0.35) return "none";
  if (r < 0.55) return "good";
  if (r < 0.72) return "bad";
  if (r < 0.86) return "expense";
  return "festival";
}

export const useSim = create<State>()(
  persist(
    (set, get) => ({
      step: 0,
      teamName: "",
      shopType: "Bakery",
      customShop: "",
      budget: initialBudget,
      months: [],
      currentMonth: 1,
      teacherMode: false,
      pendingChallenge: null,
      scenarios: { competitor: false, rentHike: false, onlineBoost: false },
      reflection: { challenge: "", improve: "" },
      pitch: { transcript: "", durationSec: 0, review: null },

      setStep: (step) => set({ step }),
      setTeam: (teamName) => set({ teamName }),
      setShop: (shopType, customShop) =>
        set({ shopType, customShop: customShop ?? get().customShop }),
      setBudget: (b) => set({ budget: { ...get().budget, ...b } }),
      toggleTeacher: () => set({ teacherMode: !get().teacherMode, pendingChallenge: null }),
      setPendingChallenge: (e) => set({ pendingChallenge: e }),
      setScenario: (k, v) => set({ scenarios: { ...get().scenarios, [k]: v } }),
      setReflection: (r) => set({ reflection: { ...get().reflection, ...r } }),
      setPitch: (p) => set({ pitch: { ...get().pitch, ...p } }),

      runMonth: ({ revenue, misc, event }) => {
        const { months, currentMonth, budget, scenarios, teacherMode } = get();
        if (currentMonth > 6) return;

        const ev: EventType = teacherMode && event ? event : rollEvent();

        let baseRevenue = revenue;
        if (scenarios.onlineBoost) baseRevenue *= 1.1;
        if (scenarios.competitor) baseRevenue *= 0.9;

        let adjusted = baseRevenue;
        let extraExpense = 0;
        if (ev === "good") adjusted *= 1.2;
        if (ev === "bad") adjusted *= 0.7;
        if (ev === "festival") adjusted += 100_000;
        if (ev === "expense") extraExpense += 50_000;

        const rent = scenarios.rentHike && currentMonth >= 4
          ? Math.round(budget.rent / 6 * 1.15)
          : Math.round(budget.rent / 6);
        const staffMonthly = Math.round(budget.staff / 6);
        const expenses = rent + staffMonthly + misc + extraExpense;

        const result: MonthResult = {
          month: currentMonth,
          baseRevenue: Math.round(baseRevenue),
          revenue: Math.round(adjusted),
          expenses,
          profit: Math.round(adjusted - expenses),
          event: ev,
          misc,
        };

        set({ months: [...months, result], currentMonth: currentMonth + 1 });
      },

      resetSim: () =>
        set({
          step: 0,
          months: [],
          currentMonth: 1,
          reflection: { challenge: "", improve: "" },
        }),
    }),
    { name: "design-shop-sim" },
  ),
);

export const formatINR = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const formatCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};
