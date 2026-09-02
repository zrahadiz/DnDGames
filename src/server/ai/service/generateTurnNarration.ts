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

  const prompt = `
    You are the Dungeon Master of a tabletop RPG.

    Current Campaign Context:
    ${gameContext}

    Game Language: ${room.language}

    Current Turn: ${room.currentTurn}

    Player Actions:
    ${JSON.stringify(actions, null, 2)}

    Instructions:    
    - Limit your responses to 2–3 short paragraphs (maximum ~120 words).
    - Use the language specified in the Game Language, no matter what the user inputs language.
    - Resolve all player actions.
    - Resolve combat actions using the supplied dice roll.
    - Higher dice rolls should generally result in better outcomes.
    - Critical successes and failures are allowed.
    - Determine combat results, damage, injuries, discoveries, and consequences.
    - Narrate naturally and cinematically.
    - Mention character names.
    - Describe NPC reactions.
    - Continue the story.
    - Do NOT decide future player actions.
    - Do NOT speak as a player.
    - End by presenting the next situation and waiting for player responses.

    Return ONLY valid JSON.

    {
      "narrative": "generated narrative here"
    }
    `;

  console.log("turn Prompt: ", prompt);

  const response = await generateAiResponse({
    prompt,
  });

  return response.narrative;
}
