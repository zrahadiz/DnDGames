import { RoomContext } from "@/types/rooms";
import { generateAiResponse } from "@/server/ai/config";

import { TurnActionContext } from "@/types/gameEvents";

import { roomContext } from "../contexts/room";

export async function generateTurnNarration({
  room,
  actions,
}: {
  room: RoomContext;
  actions: TurnActionContext[];
}) {
  const gameContext = await roomContext(room);
  const actionSummary = actions
    .map((action) => {
      const text =
        typeof action.payload === "object" &&
        action.payload &&
        "text" in action.payload
          ? action.payload.text
          : "";

      return `
${action.character?.name ?? "Unknown"}:
${text}
`;
    })
    .join("\n");

  const prompt = `
You are the Dungeon Master.

Current Campaign Context:
${gameContext}

Current Turn: ${room.currentTurn}

Player Actions:
${actionSummary}

Instructions:
- Narrate the consequences of the player actions.
- Describe the world, NPC reactions, discoveries, and outcomes.
- Mention player characters naturally.
- Do NOT decide future player actions.
- Do NOT speak as a player.
- End by presenting the next situation and waiting for player responses.

Return ONLY valid JSON.
  Do not use markdown.
  Do not use \`\`\`json.

  Format:
  {
    "narrative": "Your generated opening narrative goes here."
  }   
`;

  const response = await generateAiResponse({
    prompt,
  });

  return response;
}
