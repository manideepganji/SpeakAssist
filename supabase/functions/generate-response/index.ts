export const runtime = "edge";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

// Handle preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

// Main API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcript = body.transcript || body.current_transcript;

    if (!transcript || transcript.trim().length < 3) {
      return new Response("Wait and listen for a moment.", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // FINAL SYSTEM PROMPT
    const systemPrompt = `
You are a silent real-time speaking assistant used during live online meetings
such as Google Meet, Zoom, or Microsoft Teams.

You receive the most recent spoken sentence from the conversation.

Your task is to generate ONE fluent, natural sentence that the user can say next.

RULES:
- Output ONLY the sentence to speak.
- Maximum 1–2 lines.
- No questions.
- No explanations.
- No acknowledgements or fillers.
- No emojis.
- No analysis.
- No AI or system mentions.

If the user should not speak yet, output exactly:
"Wait and listen for a moment."
`;

    // Call AI gateway
    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: transcript },
          ],
          max_tokens: 80,
          temperature: 0.4,
        }),
      }
    );

    const data = await aiResponse.json();
    const answer =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Wait and listen for a moment.";

    return new Response(answer, {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new Response("Wait and listen for a moment.", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
}
