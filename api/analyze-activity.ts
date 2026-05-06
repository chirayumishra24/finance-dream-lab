type Budget = {
  rent: number;
  inventory: number;
  staff: number;
  decor: number;
  marketing: number;
};

type MonthResult = {
  month: number;
  baseRevenue: number;
  revenue: number;
  expenses: number;
  profit: number;
  event: string;
  misc: number;
};

type RequestBody = {
  teamName?: string;
  shopName?: string;
  budget?: Budget;
  months?: MonthResult[];
  scenarios?: Record<string, boolean>;
};

function parseGeminiError(status: number, errorText: string) {
  const normalized = errorText.toLowerCase();

  if (status === 400) return "Gemini rejected the request. Check the model request format.";
  if (status === 401 || status === 403) {
    if (normalized.includes("api key")) return "Gemini API key is invalid, restricted, or not allowed for this request.";
    return "Gemini access was denied. Check the API key and Google AI project permissions.";
  }
  if (status === 404) return "Gemini endpoint or model was not found.";
  if (status === 429) return "Gemini rate limit or quota was reached. Try again later.";
  if (status >= 500) return "Gemini is temporarily unavailable. Try again in a moment.";

  return "Gemini analysis request failed.";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { teamName, shopName, budget, months, scenarios }: RequestBody = req.body ?? {};
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    if (!months?.length) {
      return res.status(400).json({ error: "No simulation activity found to analyze." });
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini analyze-activity error", response.status, errorText);
      return res.status(response.status).json({ error: parseGeminiError(response.status, errorText) });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === "string")?.text;

    if (!rawText) {
      return res.status(500).json({ error: "Gemini returned an empty response." });
    }

    return res.status(200).json({ analysis: JSON.parse(rawText) });
  } catch (error) {
    console.error("analyze-activity error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
