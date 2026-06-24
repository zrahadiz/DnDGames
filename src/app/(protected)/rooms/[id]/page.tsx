"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

import api from "@/lib/axios";

import character2 from "@/assets/images/character2.png";
import character3 from "@/assets/images/character3.png";

import Loading from "@/components/feedback/loading";
import { CardHero } from "@/components/ui/playerHero";
import { socket } from "@/lib/socket-client";
import { RoomDetail } from "@/types/rooms";
import { toast } from "@/lib/toast";
import { GameEventWithRelations, TurnProgress } from "@/types/gameEvents";

import { RoomUpdate } from "@/types/socket";

import { useRouter } from "next/navigation";

export default function Home() {
  const [gameEvents, setGameEvents] = useState<GameEventWithRelations[]>([]);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [turnProgress, setTurnProgress] = useState<TurnProgress | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const roomId = params.id; // <-- "7"

  const router = useRouter();

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/${roomId}`);

      setRoom(data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const fetchEvents = async () => {
    setLoadingState(true);
    setLoadingText("Mengambil Pesan");
    try {
      const { data } = await api.get(`/rooms/${roomId}/actions`);
      console.log("fetched messages:", gameEvents);
      setGameEvents(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchEvents();
  }, [roomId]);

  const submitAction = async () => {
    if (!input.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);

      const { data } = await api.post(`/rooms/${roomId}/actions`, {
        action: input,
      });

      setTurnProgress(data.data.turnProgress);

      socket.emit("game_event_created", {
        roomId,
        event: data.data.event,
      });

      // socket.emit("sync_room_state", {
      //   roomId,
      // });

      setInput("");
    } catch (error) {
      console.error(error);

      toast("Failed to submit action", {
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleRoomUpdate = (update: RoomUpdate) => {
      switch (update.type) {
        case "room_state_updated":
          setRoom(update.room);
          break;

        case "room_deleted":
          window.location.href = "/rooms";
          break;
      }
    };

    socket.on("room_update", handleRoomUpdate);

    return () => {
      socket.off("room_update", handleRoomUpdate);
    };
  }, [router]);

  useEffect(() => {
    const handleGameEvent = ({ event }: { event: GameEventWithRelations }) => {
      console.log("received game event", event);
      setGameEvents((prev) => {
        const exists = prev.some((e) => e.id === event.id);

        if (exists) return prev;

        return [...prev, event];
      });
    };

    socket.on("game_event_created", handleGameEvent);

    return () => {
      socket.off("game_event_created", handleGameEvent);
    };
  }, []);

  useEffect(() => {
    const resolveTurn = async () => {
      console.log("1");
      console.log("tp: ", turnProgress);
      if (!turnProgress?.allPlayersSubmitted) return;

      try {
        const { data } = await api.post(`/rooms/${roomId}/resolve-turn`);
        console.log("2");

        socket.emit("game_event_created", {
          roomId,
          event: data.data.aiEvent,
        });

        socket.emit("sync_room_state", {
          roomId,
        });
      } catch (error: any) {
        if (error?.response?.status !== 409) {
          console.error(error);
        }
      }
    };

    resolveTurn();
  }, [turnProgress, roomId]);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("join_room", {
      roomId,
    });
  }, [roomId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [gameEvents]);

  if (!room) {
    return;
  }

  const half = Math.ceil(room.players.length / 2);
  const leftPlayers = room.players.slice(0, half);
  const rightPlayers = room.players.slice(half);

  return (
    <div className="flex flex-col justify-center py-5 px-10 bg-gray-100 h-screen w-full">
      <Loading status={loadingState} fullscreen text={loadingText} />

      <h1 className="hidden md:block text-3xl font-extrabold text-gray-800 mb-4 text-center shrink-0">
        Dungeon Room - {room.name}
      </h1>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* LEFT PLAYERS */}
        <div className="hidden md:flex col-span-3">
          <div className="flex flex-col gap-3 w-full">
            {leftPlayers.map((player) => (
              <div key={player.id} className="bg-white rounded-xl p-3 shadow">
                <h3 className="font-bold">{player.character?.name}</h3>

                <p className="text-sm text-gray-500">
                  {player.character?.race}
                </p>

                <p className="text-sm text-gray-500">
                  {player.character?.characterClass}
                </p>

                <p className="text-xs mt-2">Level {player.character?.level}</p>

                <div className="flex justify-between text-xs mt-2">
                  <span>HP: {player.character?.hp}</span>

                  <span>Mana: {player.character?.mana}</span>
                </div>

                <div className="mt-2">
                  {player.isConnected ? (
                    <span className="text-green-600 text-xs">Online</span>
                  ) : (
                    <span className="text-red-600 text-xs">Offline</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-12 md:col-span-6 flex flex-col min-h-0">
          <div className="bg-white rounded-xl shadow-lg flex flex-col flex-1 min-h-0">
            {/* HEADER */}
            <div className="border-b p-4">
              <h2 className="font-bold text-xl">The Adventure</h2>

              {turnProgress && (
                <div className="mt-2 text-sm text-gray-600">
                  Turn {turnProgress.currentTurn}
                  {" • "}
                  {turnProgress.submittedCount}/{turnProgress.totalPlayers}
                  {" players acted"}
                </div>
              )}
            </div>

            {/* TIMELINE */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {gameEvents.length === 0 && (
                <div className="text-center text-gray-500">
                  No events yet...
                </div>
              )}

              {gameEvents.map((msg) => {
                const text =
                  typeof msg.payload === "object" &&
                  msg.payload &&
                  "text" in msg.payload
                    ? String(msg.payload.text)
                    : JSON.stringify(msg.payload);

                const isAi = msg.eventType === "ai_narration";

                return (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-4 ${
                      isAi
                        ? "bg-purple-100 border border-purple-200"
                        : "bg-blue-100 border border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">
                        {isAi
                          ? "🎲 Dungeon Master"
                          : `⚔️ ${msg.character?.name ?? "Unknown Player"}`}
                      </span>

                      <span className="text-xs opacity-70">
                        Turn {msg.turnNumber}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap">{text}</div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <textarea
                  className="flex-1 border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  value={input}
                  disabled={isSubmitting}
                  placeholder="Describe your action..."
                  onChange={(e) => setInput(e.target.value)}
                />

                <button
                  onClick={submitAction}
                  disabled={isSubmitting || !input.trim()}
                  className="bg-purple-600 text-white px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Act"}
                </button>
              </div>

              {turnProgress && (
                <div className="mt-2 text-xs text-gray-500">
                  Waiting for {turnProgress.remainingCount} player(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PLAYERS */}
        <div className="hidden md:flex col-span-3">
          <div className="flex flex-col gap-3 w-full">
            {rightPlayers.map((player) => (
              <div key={player.id} className="bg-white rounded-xl p-3 shadow">
                <h3 className="font-bold">{player.character?.name}</h3>

                <p className="text-sm text-gray-500">
                  {player.character?.race}
                </p>

                <p className="text-sm text-gray-500">
                  {player.character?.characterClass}
                </p>

                <p className="text-xs mt-2">Level {player.character?.level}</p>

                <div className="flex justify-between text-xs mt-2">
                  <span>HP: {player.character?.hp}</span>

                  <span>Mana: {player.character?.mana}</span>
                </div>

                <div className="mt-2">
                  {player.isConnected ? (
                    <span className="text-green-600 text-xs">Online</span>
                  ) : (
                    <span className="text-red-600 text-xs">Offline</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
