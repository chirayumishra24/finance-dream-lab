import { Request, Response } from "express";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const responseJsonSchema = {
  type: "object",
  properties: {
    status: { type: "string" },
    totalProfit: { type: "number" },
    topSellingItem: { type: "string" },
    customerSentiment: { type: "number" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          text: { type: "string" }
        },
        required: ["type", "text"]
      }
    }
  },
  required: ["status", "totalProfit", "topSellingItem", "customerSentiment", "recommendations"]
};

function parseGeminiError(status: number, text: string) {
  try {
    const json = JSON.parse(text);
    return json.error?.message || `Gemini API Error (${status})`;
  } catch {
    return `Gemini API Error (${status})`;
  }
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    const { activityId, gameState } = req.body;

    const systemPrompt = `You are an AI Business Analyst. 
Analyze the current game state and provide a summary of performance and actionable recommendations.
Output MUST be valid JSON matching the provided schema.`;

    const userPrompt = `Activity: ${activityId}
Game State: ${JSON.stringify(gameState, null, 2)}

Provide analysis and recommendations:
- Profit should be calculated correctly.
- Do not invent numbers.
- Keep each bullet short and actionable.
- Visual recommendations must focus on charts, hierarchy, color use, spacing, annotations, and storytelling layout.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseJsonSchema
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini analyze-activity error", response.status, errorText);
      return res.status(response.status).json({ error: parseGeminiError(response.status, errorText) });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === "string")?.text;

    if (!rawText) {
      console.error("Gemini empty response data:", JSON.stringify(data, null, 2));
      return res.status(500).json({ error: "Gemini returned an empty response." });
    }

    try {
      const cleaned = rawText.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
      return res.status(200).json({ analysis: JSON.parse(cleaned) });
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON. Raw text:", rawText);
      return res.status(500).json({ 
        error: "Gemini returned invalid JSON format.",
        details: parseError instanceof Error ? parseError.message : String(parseError)
      });
    }
  } catch (error) {
    console.error("analyze-activity error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
