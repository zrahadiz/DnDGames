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
  console.log("Game context for AI:", gameContext);

  const prompt = `
  You are the Dungeon Master of a tabletop RPG.

  Campaign:
  ${gameContext}

  Language: ${room.language}
  Turn: ${room.currentTurn}

  Player Actions:
  ${JSON.stringify(actions, null, 2)}

  Rules:
  - Resolve all actions using the supplied dice rolls.
  - Higher rolls generally give better results; critical successes/failures are allowed.
  - Describe consequences, combat, discoveries, and NPC reactions naturally.
  - Mention character names when relevant.
  - Never choose actions or dialogue for players.
  - End ongoing narration with the next situation.

  Character Effects:
  - Return only effects that actually happen this turn.
  - Use only character IDs provided in the context.
  - Allowed effects:
    - "damage": lose HP
    - "heal": restore HP
    - "mana_cost": spend mana
    - "mana_restore": restore mana
    - "xp": gain experience
  - A character may receive multiple different effects in the same turn.
  - Combine duplicate effect types for the same character when possible.
  - Return effect amounts only, never final HP, mana, XP, or level values.
  - HP/mana effects must be 1–50.
  - XP should normally be 5–30.

  Outcome:
  - "victory" if the campaign startingObjective is completed.
  - "defeat" if the party suffers an unrecoverable loss.
  - Otherwise use "ongoing".
  - Never end the game because of turn count.
  - If ongoing, ending must be null.
  - If victory or defeat, provide an ending title and summary.

  Keep narrative to 2–3 short paragraphs, maximum ~120 words.
  Always use the specified language.

  Return ONLY valid JSON:

  {
    "narrative": "string",
    "outcome": "ongoing | victory | defeat",
    "characterEffects": [
      {
        "characterId": "uuid",
        "type": "damage | heal | mana_cost | mana_restore | xp",
        "amount": 10
      }
    ],
    "ending": null
  }

  If outcome is "victory" or "defeat", ending must be:

  {
    "title": "string",
    "summary": "string"
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
