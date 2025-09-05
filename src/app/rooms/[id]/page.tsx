"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";

import api from "@/lib/axios";

import character1 from "@/assets/images/character1.svg";
import character2 from "@/assets/images/character2.png";
import character3 from "@/assets/images/character3.png";

import { CardHero } from "@/components/ui/playerHero";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";

export default function Home() {
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

  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    []
  );
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const router = useRouter();
  const params = useParams();
  const id = params.id; // <-- "7"

  const fetchRooms = async () => {
    const currentUserId = Number(localStorage.getItem("user_id"));
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/detail?room_id=${id}`);
      const roomData = data.roomsDetail[0];
      // 👇 Check if user still exists in the room
      // const stillInRoom = roomData.players.some(
      //   (p: Player) => p.user_id === currentUserId
      // );

      // if (!stillInRoom) {
      //   console.log("User not in this room anymore, redirecting to lobby.");
      //   router.replace("/lobby");
      //   return;
      // }

      setRoom(roomData);
      setPlayers(roomData.players);
      socket.emit("refresh_room", {
        roomId: id,
        userId: currentUserId,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: roomData.firstMessage },
      ]);
      console.log("Rooms fetched: ", data.roomsDetail);
      console.log("Players Fetched: ", data.roomsDetail[0].players);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add player message
    setMessages((prev) => [...prev, { role: "player", text: input }]);

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log("AI response:", data.text);
    setAnswer(data.text);

    setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    setInput("");
  };

  const askAi = async (prompt: string) => {
    if (!input.trim()) return;

    // Add player message
    setMessages((prev) => [...prev, { role: "player", text: input }]);

    // Call AI API (for now: fake AI response)
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log("AI response:", data.text);
    setAnswer(data.text);

    setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    setInput("");
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Split the players array into two halves
  const half = Math.ceil(players.length / 2);
  const leftPlayers = players.slice(0, half);
  const rightPlayers = players.slice(half);

  return (
    <div className="bg-gray-100 min-h-screen p-4 flex flex-col items-center">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Dungeon Room - {room?.title}
        </h1>

        {/* Main Layout Grid */}
        <div className="flex-1 grid grid-cols-12 gap-1 md:gap-4 min-h-0">
          {/* Left Column (Players) */}
          <div className="hidden md:flex col-span-12 md:col-span-3 justify-center">
            <div className="flex flex-col justify-between gap-4 w-full sm:w-2/3 md:w-full">
              {leftPlayers.map((player) => (
                <CardHero
                  key={player.id}
                  image={character2}
                  name={player.character_name}
                  role={`${player.character_class} - Level ${player.level}`}
                />
              ))}
            </div>
          </div>

          {/* Middle Column (Chat Area) */}
          <div className="col-span-12 md:col-span-6 flex flex-col min-h-0">
            <div className="flex flex-col bg-white shadow-lg rounded-xl p-4 h-full min-h-0">
              {/* Chat Header */}
              <h1 className="text-xl font-bold mb-4 text-gray-800">
                The Arena
              </h1>

              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg ${
                      msg.role === "ai"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <b>{msg.role === "ai" ? "Dungeon Master" : "You"}:</b>{" "}
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <textarea
                  className="flex-1 border border-gray-300 rounded-lg p-2 w-5/6 resize-none min-h-[3rem] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  onClick={sendMessage}
                  className="bg-purple-600 text-white px-4 py-2 w-1/6 h-full rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Players) */}
          <div className="hidden md:flex col-span-12 md:col-span-3  justify-center">
            <div className="flex flex-col justify-between gap-4 w-full sm:w-2/3 md:w-full">
              {rightPlayers.map((player) => (
                <CardHero
                  key={player.id}
                  image={character2}
                  name={player.character_name}
                  role={`${player.character_class} - Level ${player.level}`}
                />
              ))}
            </div>
          </div>

          {/* Players for Phone */}
          {players.map((player) => (
            <div className="flex md:hidden col-span-3 justify-center mt-5">
              <CardHero
                key={player.id}
                image={character3}
                name={player.character_name}
                role={`${player.character_class} - Level ${player.level}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
