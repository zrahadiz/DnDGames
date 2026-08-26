import { InferSelectModel } from "drizzle-orm";
import { joinRoomSchema } from "@/server/validators/roomPlayers";

import { roomPlayers } from "@/db/schema";

import { z } from "zod";

export type RoomPlayer = InferSelectModel<typeof roomPlayers>;

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
