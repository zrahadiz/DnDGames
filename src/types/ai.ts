export type AiTurnResult = {
  narration: string;
  outcome: "ongoing" | "victory" | "defeat";
  ending?: {
    title: string;
    summary: string;
  };
};
