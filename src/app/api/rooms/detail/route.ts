// /pages/api/rooms/create.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, room_players } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const room_id = searchParams.get("room_id");

  const roomDetail = await db
    .select()
    .from(rooms)
    .innerJoin(room_players, eq(rooms.id, room_players.room_id))
    .where(and(room_id ? eq(rooms.id, Number(room_id)) : undefined));

  const grouped = roomDetail.reduce((acc, item) => {
    console.log("Acc: ", acc);
    console.log("Item: ", item);
    const roomId = item.rooms.id;
    if (!acc[roomId]) {
      acc[roomId] = {
        ...item.rooms,
        players: [],
      };
    }
    acc[roomId].players.push(item.room_players);
    return acc;
  }, {} as Record<number, any>);

  const roomDetailArray = Object.values(grouped);
  //   console.log("Room Detail: ", roomDetailArray);
  return NextResponse.json(
    {
      roomsDetail: roomDetailArray,
      messages: "Success get detail room",
      status: 200,
    },
    { status: 200 }
  );
}
