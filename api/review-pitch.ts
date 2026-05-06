type RequestBody = {
  transcript?: string;
  durationSec?: number;
  teamName?: string;
  shopName?: string;
  finalPL?: number;
  monthsRun?: number;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { transcript, durationSec, teamName, shopName, finalPL, monthsRun }: RequestBody = req.body ?? {};
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    if (!transcript || transcript.trim().length < 5) {
      return res.status(400).json({ error: "Transcript too short. Try recording again." });
    }

    const systemPrompt = `You are a friendly but rigorous business pitch judge for a high-school entrepreneurship class.
Score a student team's spoken pitch on three dimensions (each 1-10):
- clarity: structure, flow, articulation
- financials: how well they referenced budget, profit/loss, key numbers
- persuasiveness: storytelling, hook, conviction
Then compute overall as the rounded average.
Return 2-3 concrete strengths and 2-3 specific improvements. Keep tone supportive.`;

    const userPrompt = `Team: ${teamName}
Shop: ${shopName}
Final P/L over ${monthsRun} months: ₹${(finalPL ?? 0).toLocaleString("en-IN")}
Pitch duration: ${Math.round(durationSec ?? 0)}s

Transcript:
"""${transcript}"""`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 700,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                scores: {
                  type: "object",
                  properties: {
                    clarity: { type: "number" },
                    financials: { type: "number" },
                    persuasiveness: { type: "number" },
                    overall: { type: "number" },
                  },
                  required: ["clarity", "financials", "persuasiveness", "overall"],
                  additionalProperties: false,
                },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                summary: { type: "string" },
              },
              required: ["scores", "strengths", "improvements", "summary"],
              additionalProperties: false,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini review-pitch error", response.status, errorText);
      return res.status(response.status).json({ error: "Gemini pitch review request failed." });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === "string")?.text;

    if (!rawText) {
      return res.status(500).json({ error: "Gemini returned an empty response." });
    }

    return res.status(200).json({ review: JSON.parse(rawText) });
  } catch (error) {
    console.error("review-pitch error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
