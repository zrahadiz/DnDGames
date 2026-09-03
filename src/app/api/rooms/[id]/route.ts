// /pages/api/rooms/create.ts
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requiredUser } from "@/server/auth/requiredUser";
import { apiResponse } from "@/server/utils/apiResponse";
import { UnauthorizedError } from "@/server/errors/unauthorized";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    await requiredUser();

    const { id } = await params;
    console.log("Fetching Room with ID:", id);

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
      columns: {
        id: true,
        hostId: true,
        name: true,
        status: true,
      },

      with: {
        campaign: {
          columns: {
            title: true,
            description: true,
          },
        },

        players: {
          with: {
            character: true,
          },
        },
      },
    });

    if (!room) {
      return apiResponse(404, {
        success: false,
        message: "Room not found",
      });
    }

    console.log("Fetched Room :", room);

    return apiResponse(200, {
      success: true,
      message: "Room fetched successfully",
      data: {
        id: room.id,
        hostId: room.hostId,
        name: room.name,
        status: room.status,
        campaign: room.campaign,
        players: room.players,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error?.message || "Unauthorized",
        error,
      });
    }
    return apiResponse(500, {
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
}
