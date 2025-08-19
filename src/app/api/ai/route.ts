import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY, // ✅ safe: server only
});

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received prompt:", body.prompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: body.prompt,
  });

  return NextResponse.json({ text: response.text });
}
