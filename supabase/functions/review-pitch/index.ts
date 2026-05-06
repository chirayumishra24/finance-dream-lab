import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, durationSec, teamName, shopName, finalPL, monthsRun } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    if (!transcript || transcript.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Transcript too short. Try recording again." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
Final P/L over ${monthsRun} months: ₹${finalPL.toLocaleString("en-IN")}
Pitch duration: ${Math.round(durationSec)}s

Transcript:
"""${transcript}"""`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_pitch_review",
            description: "Return a structured review of the pitch.",
            parameters: {
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
        }],
        tool_choice: { type: "function", function: { name: "submit_pitch_review" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const review = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ review }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-pitch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
