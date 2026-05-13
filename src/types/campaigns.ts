import type { Campaign as BaseCampaign } from "@/server/validators/campaigns";

export type Campaign = BaseCampaign & {
  authorName?: string;
  playerCount?: number;
  rating?: number;
};
