import { eq, inArray } from "drizzle-orm";

import { characters } from "@/db/schema";
import type { CharacterEffect } from "@/types/characters";

import { applyXp } from "./characterProgression";

export async function applyCharacterEffects(
  tx: any,
  effects: CharacterEffect[],
) {
  if (effects.length === 0) {
    return [];
  }

  const characterIds = [
    ...new Set(effects.map((effect) => effect.characterId)),
  ];

  const affectedCharacters = await tx.query.characters.findMany({
    where: inArray(characters.id, characterIds),
  });

  const updatedCharacters = [];

  for (const character of affectedCharacters) {
    const characterEffects = effects.filter(
      (effect) => effect.characterId === character.id,
    );

    let next = {
      level: character.level,
      xp: character.xp,

      hp: character.hp,
      maxHp: character.maxHp,

      mana: character.mana,
      maxMana: character.maxMana,
    };

    for (const effect of characterEffects) {
      switch (effect.type) {
        case "damage":
          next.hp = Math.max(0, next.hp - effect.amount);
          break;

        case "heal":
          next.hp = Math.min(next.maxHp, next.hp + effect.amount);
          break;

        case "mana_cost":
          next.mana = Math.max(0, next.mana - effect.amount);
          break;

        case "mana_restore":
          next.mana = Math.min(next.maxMana, next.mana + effect.amount);
          break;

        case "xp":
          next = applyXp(next, effect.amount);
          break;
      }
    }

    const [updated] = await tx
      .update(characters)
      .set({
        level: next.level,
        xp: next.xp,

        hp: next.hp,
        maxHp: next.maxHp,

        mana: next.mana,
        maxMana: next.maxMana,

        updatedAt: new Date(),
      })
      .where(eq(characters.id, character.id))
      .returning();

    updatedCharacters.push(updated);
  }

  return updatedCharacters;
}
