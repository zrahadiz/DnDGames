import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRoomState(roomId: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),

    with: {
      campaign: {
        columns: {
          id: true,
          title: true,
          description: true,
        },

        with: {
          theme: {
            columns: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },

      players: {
        with: {
          character: true,
        },
      },
    },
  });

  return room;
}
