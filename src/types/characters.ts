export interface RaceSuggestion {
  name: string;
  description: string;
}

export interface ClassSuggestion {
  name: string;
  description: string;
}

export interface CharacterSuggestions {
  status: string;
  races: RaceSuggestion[];
  classes: ClassSuggestion[];
}
