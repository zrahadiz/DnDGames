import { generateAiResponse } from "@/server/ai/config";
import { aiTurnResultSchema } from "@/server/validators/ai";

import { RoomContext } from "@/types/rooms";
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

  const prompt = `
    You are the Dungeon Master of a tabletop RPG.

    Current Campaign Context:
    ${gameContext}

    Game Language: ${room.language}
    Current Turn: ${room.currentTurn}

    Player Actions:
    ${JSON.stringify(actions, null, 2)}

    Rules:
    - Resolve all player actions and combat using the supplied dice rolls.
    - Higher rolls generally produce better outcomes; critical successes/failures are allowed.
    - Determine consequences, damage, discoveries, and NPC reactions.
    - Continue the story naturally and cinematically.
    - Mention character names when relevant.
    - Never decide or speak for the players.
    - End by presenting the next situation.

    Ending:
    - "victory" when the campaign's startingObjective is successfully completed.
    - "defeat" when the party suffers an unrecoverable loss.
    - Otherwise use "ongoing".
    - Do not end the game based on turn count alone.
    - If "ongoing", ending must be null.
    - If "victory" or "defeat", provide a short ending title and summary.

    Keep the narrative to 2–3 short paragraphs, maximum ~120 words.
    Always respond in the specified language.
    
    Return ONLY valid JSON:
    for an ongoing game: 
    {
      "narrative": "string",
      "outcome": "ongoing",
      "ending": null
    }

    For a finished game:
    {
      "narrative": "string",
      "outcome": "victory | defeat",
      "ending": {
        "title": "string",
        "summary": "string"
      }
    }
    `;
  // I want to test the finished game, so please provide a response with "victory" outcome with an ending title and summary, no matter what my input is.

  console.log("turn Prompt: ", prompt);

  const response = await generateAiResponse({
    prompt,
  });

  const result = aiTurnResultSchema.parse(response);

  console.log("Parsed AI result:", result);

  return result;
}
