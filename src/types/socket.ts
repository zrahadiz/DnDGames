// types/socket.ts
import { RoomPlayer } from "@/server/validators/roomPlayers";
import { Characters } from "@/server/validators/character";
import { RoomDetail } from "./rooms";

export type PlayerWithCharacter = RoomPlayer & {
  character: Characters | null;
};

export type RoomUpdate =
  | {
      type: "room_state_updated";
      room: RoomDetail;
    }
  | {
      type: "room_deleted";
      roomId: string;
    }
  | {
      type: "game_started";
    };
