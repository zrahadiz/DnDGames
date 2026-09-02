import type { InferSelectModel } from "drizzle-orm";
import { messages } from "@/db/schema";
import { Users } from "./users";

export type Message = InferSelectModel<typeof messages>;

export type MessageWithRelations = Message & {
  user: Pick<Users, "id" | "name">;
};
