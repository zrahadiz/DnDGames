import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { gameEvents, rooms } from "@/db/schema";
import { requiredUser } from "@/server/auth/requiredUser";
import { endGameSchema } from "@/server/validators/endGame";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requiredUser();
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = endGameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { reason, title, summary } = parsed.data;

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Room not found.",
        },
        { status: 404 },
      );
    }

    if (room.hostId !== currentUser.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the host can end the game.",
        },
        { status: 403 },
      );
    }

    if (room.status === "finished") {
      return NextResponse.json(
        {
          success: false,
          message: "Game has already ended.",
        },
        { status: 409 },
      );
    }

    const data = await db.transaction(async (tx) => {
      const [gameEndEvent] = await tx
        .insert(gameEvents)
        .values({
          roomId,
          turnNumber: room.currentTurn,
          eventType: "game_end",
          payload: {
            reason,
            title,
            summary,
            narrative: `The host has ended the adventure with a ${reason}.`,
          },
        })
        .returning();

      await tx
        .update(rooms)
        .set({
          status: "finished",
        })
        .where(eq(rooms.id, roomId));

      return {
        gameEndEvent,
        outcome: reason,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Game ended successfully.",
      data,
    });
  } catch (error) {
    console.error("Manual end game failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to end game.",
      },
      { status: 500 },
    );
  }
}
