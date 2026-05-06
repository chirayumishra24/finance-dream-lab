import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Budget {
  rent: number;
  inventory: number;
  staff: number;
  decor: number;
  marketing: number;
}

interface MonthResult {
  month: number;
  baseRevenue: number;
  revenue: number;
  expenses: number;
  profit: number;
  event: string;
  misc: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      teamName,
      shopName,
      budget,
      months,
      scenarios,
    }: {
      teamName?: string;
      shopName?: string;
      budget?: Budget;
      months?: MonthResult[];
      scenarios?: Record<string, boolean>;
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    if (!months?.length) {
      return new Response(JSON.stringify({ error: "No simulation activity found to analyze." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalProfit = months.reduce((sum, month) => sum + month.profit, 0);
    const cumulativeTrend = months.reduce<number[]>((acc, month) => {
      const previous = acc.at(-1) ?? 0;
      acc.push(previous + month.profit);
      return acc;
    }, []);

    const activitySnapshot = {
      teamName: teamName || "Team",
      shopName: shopName || "Dream Shop",
      budget,
      scenarios,
      totalProfit,
      months: months.map((month, index) => ({
        ...month,
        cumulativeProfit: cumulativeTrend[index],
      })),
    };

    const systemPrompt = `You are a business simulation analyst and dashboard UX critic.
Review a student team's six-month shop simulation.
Return:
1. a short headline
2. a concise summary of the performance story
3. activity insights grounded in the provided numbers
4. practical next actions the team should take
5. visual improvements for the analytics/report UI that would make it clearer and more appealing

Rules:
- Be specific and data-aware.
- Do not invent numbers.
- Keep each bullet short and actionable.
- Visual recommendations must focus on charts, hierarchy, color use, spacing, annotations, and storytelling layout.`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{
            parts: [{
              text: `Analyze this simulation activity and propose UI improvements:\n${JSON.stringify(activitySnapshot, null, 2)}`,
            }],
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 900,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                headline: { type: "string" },
                summary: { type: "string" },
                activityInsights: {
                  type: "array",
                  items: { type: "string" },
                },
                actionRecommendations: {
                  type: "array",
                  items: { type: "string" },
                },
                visualRecommendations: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "headline",
                "summary",
                "activityInsights",
                "actionRecommendations",
                "visualRecommendations",
              ],
              additionalProperties: false,
            },
          },
        }),
      },
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Gemini analyze-activity error", resp.status, errorText);
      return new Response(JSON.stringify({ error: "Gemini analysis request failed." }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === "string")?.text;
    if (!rawText) throw new Error("Gemini returned an empty response");

    const analysis = JSON.parse(rawText);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-activity error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
