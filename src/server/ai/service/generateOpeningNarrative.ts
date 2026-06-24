import { generateAiResponse } from "@/server/ai/config";
import { RoomContext } from "@/types/rooms";
import { promptOpenNarrative } from "../prompts/roomOpeningNarrative";

export async function generateOpeningNarrative(roomDetail: RoomContext) {
  try {
    const prompt = await promptOpenNarrative(roomDetail);
    console.log("Generated prompt for opening narrative:", prompt);

    const response = await generateAiResponse({
      prompt,
    });

    console.log("Generated opening narrative:", response);
    return response;
  } catch (error) {
    console.error("Failed to generate opening narrative:", error);
    throw new Error("Failed to generate opening narrative");
  }
}
