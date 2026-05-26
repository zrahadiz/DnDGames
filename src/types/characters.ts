export interface RaceSuggestion {
  name: string;
  description: string;
}

export interface ClassSuggestion {
  name: string;
  description: string;
}

export interface CharacterSuggestions {
  races: RaceSuggestion[];
  classes: ClassSuggestion[];
}
