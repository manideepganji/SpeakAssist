export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { transcript, current_transcript } = req.body;
  const text = transcript || current_transcript;

  if (!text || text.trim().length < 3) {
    return res.status(200).send("Wait and listen for a moment.");
  }

  const systemPrompt = `
You are a silent real-time speaking assistant used during live online meetings.

You receive the most recent spoken sentence from the conversation.

Your task is to generate ONE fluent, natural sentence that the user can say next.

RULES:
- Output ONLY the sentence.
- Maximum 1–2 lines.
- No questions.
- No explanations.
- No acknowledgements.
- No emojis.
- No AI mentions.

If the user should not speak yet, output exactly:
"Wait and listen for a moment."
`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 60,
      temperature: 0.4
    })
  });

  const data = await aiRes.json();
  const answer =
    data?.choices?.[0]?.message?.content ||
    "Wait and listen for a moment.";

  res.status(200).send(answer.trim());
}
