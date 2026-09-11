type CharacterProgressionState = {
  level: number;
  xp: number;

  hp: number;
  maxHp: number;

  mana: number;
  maxMana: number;
};

export function applyXp(character: CharacterProgressionState, xpGain: number) {
  let level = character.level;
  let xp = character.xp + xpGain;

  let maxHp = character.maxHp;
  let maxMana = character.maxMana;

  while (xp >= getRequiredXp(level)) {
    xp -= getRequiredXp(level);

    level += 1;

    maxHp += 10;
    maxMana += 10;
  }

  return {
    ...character,
    level,
    xp,
    maxHp,
    maxMana,

    hp: Math.min(character.hp, maxHp),
    mana: Math.min(character.mana, maxMana),
  };
}

export function getRequiredXp(level: number) {
  return level * 100;
}
