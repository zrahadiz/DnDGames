// /pages/api/messages/[id].ts
import { db } from "@/db";
import { messages, rooms, roomPlayers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requiredUser } from "@/server/auth/requiredUser";
import { apiResponse } from "@/server/utils/apiResponse";
import { createMessageSchema } from "@/server/validators/messages";
import { UnauthorizedError } from "@/server/errors/unauthorized";

type Params = Promise<{ roomId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const userId = currentUser.user.id;

    const { roomId } = await params;

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!room) {
      return apiResponse(404, {
        success: false,
        message: "Room not found",
      });
    }

    const membership = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.roomId, roomId),
        eq(roomPlayers.userId, userId),
      ),
    });

    if (!membership) {
      return apiResponse(403, {
        success: false,
        message: "You are not a member of this room",
      });
    }

    const data = await db.query.messages.findMany({
      where: eq(messages.roomId, roomId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    return apiResponse(200, {
      success: true,
      message: "Messages fetched successfully",
      data,
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

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const { roomId } = await params;
    const body = await req.json();

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!room) {
      return apiResponse(404, {
        success: false,
        message: "Room not found",
      });
    }

    const membership = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.roomId, roomId),
        eq(roomPlayers.userId, currentUser.user.id),
      ),
    });

    if (!membership) {
      return apiResponse(403, {
        success: false,
        message: "You are not a member of this room",
      });
    }

    const result = createMessageSchema.safeParse(body);
    console.log("result:", result);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid Input",
        error: result.error.flatten(),
      });
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        ...result.data,
        roomId,
        senderId: currentUser.user.id,
      })
      .returning();

    return apiResponse(201, {
      success: true,
      message: "Message has been created",
      data: {
        ...newMessage,
        sender: {
          id: currentUser.user.id,
          name: currentUser.user.name,
        },
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
