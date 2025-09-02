"use client";

import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import lavaKnight from "@/assets/images/lavaKnight.png";
import api from "@/lib/axios";
import { socket } from "@/lib/socket";

export default function WaitingRoom() {
  interface Player {
    id: number;
    user_id: number;
    room_id: number;
    character_name: string;
    character_class: string;
    level: number;
    is_ready: boolean;
    last_seen_at: string;
  }

  interface Room {
    id: number;
    title: string;
    theme: string;
    password: string;
    max_players: number;
    status: string;
    host_id: number | null;
    created_at: string;
    players: Player[];
  }

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const params = useParams();
  const id = params.id; // <-- "7"

  const maxPlayers = 4;

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/detail?room_id=${id}`);
      console.log("Rooms fetched: ", data.roomsDetail);
      setRoom(data.roomsDetail);
      setPlayers(data.roomsDetail[0].players);
      console.log(data.roomsDetail[0].players);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    socket.on("room_update", (update) => {
      console.log("Room update received:", update);

      if (update.type === "player_joined" && update.player) {
        setPlayers((prevPlayers) => {
          // Check if the player already exists
          const exists = prevPlayers.some(
            (p) => p.user_id === update.player.user_id
          );

          if (exists) {
            // If player exists, update their info
            return prevPlayers.map((p) =>
              p.user_id === update.player.user_id
                ? { ...p, ...update.player }
                : p
            );
          } else {
            // If player is new, append to the array
            return [...prevPlayers, update.player];
          }
        });
      }
    });
  }, [socket]);

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/img/bg1.jpg')" }}
      >
        <h1 className="text-4xl font-bold mb-6">⚔️ Waiting Room</h1>

        <div className="w-full max-w-md  bg-opacity-60 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Pemain Bergabung:
          </h2>
          <ul className="list-disc list-inside mb-4">
            {players.map((player) => (
              <li key={player.id}>{player.character_name}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <button className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
            Mulai Game
          </button>
        </div>
      </div>
    </>
  );
}
