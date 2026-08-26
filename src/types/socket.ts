// types/socket.ts
import { RoomDetail } from "./rooms";
import { Characters } from "./characters";
import { RoomPlayer } from "./roomPlayers";

export type PlayerWithCharacter = RoomPlayer & {
  character: Characters | null;
};

export type RoomUpdate =
  | {
      type: "room_state_updated";
      room: RoomDetail;
      kick?: boolean;
    }
  | {
      type: "room_deleted";
      roomId: string;
    }
  | {
      type: "game_started";
    };
