"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket-client";

import api from "@/lib/axios";

import lavaKnight from "@/assets/images/lavaKnight.png";

import Loading from "@/components/feedback/loading";
import { PlayerCard } from "@/components/ui/playerCard";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import { useRouter } from "next/navigation";
import { RoomDetail } from "@/types/rooms";
import { RoomUpdate } from "@/types/socket";
import { useAuthStore } from "@/stores/auth-store";

export default function WaitingRoom() {
  const { user, fetchUser } = useAuthStore();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const router = useRouter();
  const params = useParams();
  const roomId = params.id;

  const currentPlayer: RoomDetail["players"][number] | null =
    room?.players.find((p) => p.userId === user?.id) ?? null;
  const isHost = currentPlayer?.role === "host";
  const isPlayerReady = currentPlayer?.isReady ?? false;
  const players = room?.players ?? [];
  const readyPlayersCount = players.filter(
    (p) => p.role !== "host" && p.isReady,
  ).length;
  const totalPlayersCount = players.filter((p) => p.role !== "host").length;
  const buttonDisabled = isHost && readyPlayersCount !== totalPlayersCount;

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const { data } = await api.get(`/rooms/${roomId}`);
      setRoom(data.data);
      console.log("Fetched room data:", data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const leaveRoomHandler = async () => {
    setLoadingState(true);
    setLoadingText("Leaving room...");
    try {
      const { data } = await api.delete(`/rooms/${roomId}/leave`);
      console.log("Left room:", data);
      if (data.success) {
        console.log("Emitting sync_room_state after leaving room");
        socket.emit("sync_room_state", {
          roomId,
        });
        router.push("/lobby");
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const startGameHandler = async () => {
    console.log("Current User Player:", currentPlayer);
    console.log("Is Host (from handler):", isHost);
    console.log("Current User ID:", user?.id);
    console.log("Room ID:", roomId);
    if (isHost) {
      // Host is starting the game
      setLoadingState(true);
      setLoadingText("Starting game...");
      try {
        const { data } = await api.patch(`/rooms/${roomId}/start`);

        if (data.success) {
          console.log("Emitting sync_room_state after leaving room");
          socket.emit("sync_room_state", {
            roomId,
          });
        }
        router.replace(`/rooms/${roomId}`);
      } catch (error) {
        console.error("Error starting game:", error);
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    } else {
      // Non-host is toggling to ready state
      console.log("Toggling ready state for player");
      setLoadingState(true);
      setLoadingText("Updating status...");
      try {
        const { data } = await api.patch(`/rooms/${roomId}/toggle-ready`);
        console.log("Toggled ready status:", data);
        if (data.success) {
          console.log("Emitting sync_room_state after leaving room");
          socket.emit("sync_room_state", {
            roomId,
          });
        }
      } catch (error) {
        console.error("Error toggling ready status:", error);
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    }
  };

  useEffect(() => {
    const handleRoomUpdate = (update: RoomUpdate) => {
      console.log("Received room update:", update);
      switch (update.type) {
        case "room_state_updated":
          console.log("Room state updated:", update.room);
          setRoom(update.room);
          break;

        case "room_deleted":
          console.log("Room deleted:", update.roomId);
          if (update.roomId === roomId) {
            alert("The room has been deleted. Returning to lobby.");
            router.replace("/lobby");
          }
          break;

        case "game_started":
          router.replace(`/rooms/${roomId}`);
          break;

        default:
          console.warn("Unknown room update:", update);
      }
    };

    socket.on("room_update", handleRoomUpdate);

    return () => {
      socket.off("room_update", handleRoomUpdate);
    };
  }, [roomId, router]);

  useEffect(() => {
    if (!roomId) return;

    if (!user) {
      fetchUser();
    }

    fetchRooms();

    socket.emit("join_room", {
      roomId,
    });
  }, [roomId]);

  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log("Socket event:", event, args);
    });

    return () => {
      socket.offAny();
    };
  }, []);

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/img/bg1.jpg')" }}
      >
        <div className="absolute bottom-4 right-4 cursor-pointer">
          <Button
            className="py-2 px-6 bg-red-600 hover:bg-red-700 rounded-lg font-bold cursor-pointer"
            onClick={leaveRoomHandler}
          >
            <LogOut /> Leave Room
          </Button>
        </div>
        <Loading status={loadingState} fullscreen text={loadingText} />
        <h1 className="text-4xl font-bold mb-6">⚔️ Waiting Room</h1>
        {room ? <p>Room name: {room.name}</p> : <p>No room selected.</p>}

        <div className="w-full max-w-3xl bg-opacity-60 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Pemain Bergabung:
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {room?.players.map((player) => (
              <PlayerCard
                key={player.userId}
                name={player.character?.name || "Unknown"}
                status={player.isReady}
                avatarUrl={lavaKnight}
              />
              // <li key={player.id}>{player.character_name}</li>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button
            disabled={buttonDisabled}
            className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-bold cursor-pointer"
            onClick={startGameHandler}
          >
            {isHost ? "Start Game" : isPlayerReady ? "Unready" : "Ready"}
          </Button>
        </div>
      </div>
    </>
  );
}
