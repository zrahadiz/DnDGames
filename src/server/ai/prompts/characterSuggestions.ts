export async function promptCharacterSuggestions({
  title,
  description,
  backgroundLore,
  worldSetup,
}: {
  title: string;

  description?: string | null;

  backgroundLore?: string | null;

  worldSetup: unknown;
}) {
  const prompt = `
Generate 5 fantasy RPG races
and 5 character classes.

Campaign Title:
${title}

Description:
${description}

Background Lore:
${backgroundLore}

World Setup:
${JSON.stringify(worldSetup)}

Requirements:
- thematic
- immersive
- concise names
- return JSON only

Return ONLY valid JSON.
Do not use markdown.
Do not use \`\`\`json.

Format:
{
  "races": [
    {
      "name": "",
      "description": ""
    }
  ],
  "classes": [
    {
      "name": "",
      "description": ""
    }
  ]
}
`;

  return prompt;
}
