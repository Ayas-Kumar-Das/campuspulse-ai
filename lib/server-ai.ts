export async function structuredAI(
  instructions: string,
  input: string,
  name: string,
  schema: Record<string, unknown>,
) {
  const key = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL;
  if (!key || !model) return null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions,
      input,
      text: { format: { type: "json_schema", name, strict: true, schema } },
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error("AI provider is unavailable.");
  const body = await response.json();
  const output = body.output
    ?.flatMap(
      (item: { content?: { type: string; text?: string }[] }) =>
        item.content || [],
    )
    .find(
      (item: { type: string; text?: string }) => item.type === "output_text",
    )?.text;
  if (!output) throw new Error("AI did not return a usable response.");
  return JSON.parse(output);
}
