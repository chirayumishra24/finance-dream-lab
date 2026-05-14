type RequestBody = {
  transcript?: string;
  durationSec?: number;
  teamName?: string;
  shopName?: string;
  finalPL?: number;
  monthsRun?: number;
};

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

function parseGeminiError(status: number, errorText: string) {
  const normalized = errorText.toLowerCase();

  if (status === 400) return "Gemini rejected the pitch review request. Check the request format.";
  if (status === 401 || status === 403) {
    if (normalized.includes("api key")) return "Gemini API key is invalid, restricted, or not allowed for this request.";
    return "Gemini access was denied. Check the API key and Google AI project permissions.";
  }
  if (status === 404) return "Gemini endpoint or model was not found.";
  if (status === 429) return "Gemini rate limit or quota was reached. Try again later.";
  if (status >= 500) return "Gemini is temporarily unavailable. Try again in a moment.";

  return "Gemini pitch review request failed.";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { transcript, durationSec, teamName, shopName, finalPL, monthsRun } = (req.body ?? {}) as RequestBody;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    if (!transcript || transcript.trim().length < 5) {
      return res.status(400).json({ error: "Transcript too short. Try recording again." });
    }

    const systemPrompt = `You are an expert pitch reviewer for student business plans.
Analyze the pitch transcript and financial data provided.
Return a JSON object exactly in this format:
{
  "scores": {
    "clarity": number (1-10),
    "financials": number (1-10),
    "persuasiveness": number (1-10),
    "overall": number (1-10)
  },
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "summary": "string (final summary)"
}
DO NOT include any text before or after the JSON.`;

    const userPrompt = `Team: ${teamName}
Shop: ${shopName}
Final P/L over ${monthsRun} months: ₹${(finalPL ?? 0).toLocaleString("en-IN")}
Pitch duration: ${Math.round(durationSec ?? 0)}s

Transcript:
"""${transcript}"""`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini review-pitch error", response.status, errorText);
      return res.status(response.status).json({ error: parseGeminiError(response.status, errorText) });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === "string")?.text;

    if (!rawText) {
      console.error("Gemini empty response data:", JSON.stringify(data, null, 2));
      return res.status(500).json({ error: "Gemini returned an empty response.", debug: data });
    }

    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      console.warn("Gemini finishReason:", finishReason);
    }

    try {
      // Clean up markdown if present
      const cleaned = rawText.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
      const parsed = JSON.parse(cleaned);
      console.log("Gemini parsed success:", JSON.stringify(parsed, null, 2));
      return res.status(200).json({ review: parsed });
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON. Raw text:", rawText);
      return res.status(500).json({ 
        error: "Gemini returned invalid JSON format.",
        details: parseError instanceof Error ? parseError.message : String(parseError),
        raw: rawText.substring(0, 200)
      });
    }
  } catch (error) {
    console.error("review-pitch error:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
