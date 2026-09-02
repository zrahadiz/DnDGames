import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

export async function generateAiResponse({
  prompt,
  model = "gemini-2.5-flash",
}: {
  prompt: string;
  model?: string;
}) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";

    console.log("Raw AI response:", text);

    // remove markdown json wrapper
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI generation failed:", error);

    throw new Error("Failed to generate AI response");
  }
}
