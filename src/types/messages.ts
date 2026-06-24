import type { Message as BaseMessage } from "@/server/validators/messages";
import { Users } from "./users";

export type MessageWithRelations = BaseMessage & {
  user: Pick<Users, "id" | "name">;
};
