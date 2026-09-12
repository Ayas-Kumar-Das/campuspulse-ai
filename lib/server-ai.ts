import { GoogleGenAI } from "@google/genai";

export async function structuredAI(
  instructions: string,
  input: string,
  _name: string,
  schema: Record<string, unknown>,
) {
  const key = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  if (!key || !model) return null;
  const client = new GoogleGenAI({ apiKey: key });
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await client.models.generateContent({
        model,
        contents: input,
        config: {
          systemInstruction: instructions,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          temperature: 0.1,
          maxOutputTokens: 4096,
          abortSignal: AbortSignal.timeout(25000),
        },
      });
      break;
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (attempt === 2 || (status !== 429 && status !== 503)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
    }
  }
  if (!response) throw new Error("AI provider is unavailable.");
  const output = response.text;
  if (!output) throw new Error("AI did not return a usable response.");
  return JSON.parse(output);
}
