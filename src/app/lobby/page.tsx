"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { socket } from "@/lib/socket";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [joinRoomDialog, setJoinRoomDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [roomInput, setRoomInput] = useState({
    title: "",
    theme: "",
    password: "",
    max_players: 0,
    user_id: 0,
    character_name: "",
    character_class: "",
  });

  const [joinRoomInput, setJoinRoomInput] = useState({
    room_id: 0,
    user_id: 0,
    character_name: "",
    character_class: "",
  });

  const handleRoomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log(e.target);
    setRoomInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleJoinRoomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log(e.target);
    setJoinRoomInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const filtered = rooms.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const prev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const next = async () => {
    if (step == 1) {
      setStep(step + 1);
    } else {
      createRoom();
    }
  };

  const createUser = async () => {
    setLoadingState(true);
    setLoadingText("Creating user...");
    try {
      const { data } = await api.post("/users/create", { username: username });
      console.log("User created: ", data);
      localStorage.setItem("user_id", data.data[0].id);
      localStorage.setItem("username", data.data[0].username);
      setUserDialog(false);
    } catch (error) {
      console.error("Error create user:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const fetchRooms = async () => {
    setLoadingState(true);
    setLoadingText("Fetching rooms...");
    try {
      const response = await api.get("/rooms");
      setRooms(response.data.rooms);
      console.log("Rooms fetched: ", response.data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const createRoom = async () => {
    setLoadingState(true);
    setLoadingText("Creating room...");
    try {
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        roomInput.user_id = parseInt(user_id);
      } else {
        throw new Error("User ID not found. Please create an account first.");
      }
      const { data } = await api.post("/rooms/create", roomInput);
      console.log("Room created: ", data.data);
      fetchRooms();
      setCreateRoomDialog(false);
      router.push("/waiting-room/" + data.data.id);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const openJoinDialog = (room_id: number) => {
    setJoinRoomInput((prev) => ({ ...prev, room_id: room_id }));
    setJoinRoomDialog(true);
  };

  const joinRoom = async () => {
    setJoinRoomDialog(false);
    setLoadingState(true);
    setLoadingText("Joining room...");
    try {
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        joinRoomInput.user_id = parseInt(user_id);
      } else {
        throw new Error("User ID not found. Please create an account first.");
      }
      const response = await api.post("/rooms/join", joinRoomInput);
      console.log("UserId:", joinRoomInput.user_id);
      socket.emit("join_room", {
        roomId: joinRoomInput.room_id,
        userId: joinRoomInput.user_id,
      });
      socket.on("room_update", (data) => {
        console.log("Updated participants:", data.participants);
      });
      console.log("Joined Room: ", response.data);
      router.push("/waiting-room/" + joinRoomInput.room_id);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    socket.connect();
    if (!localStorage.getItem("user_id")) {
      setUserDialog(true);
    }
    fetchRooms();
    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("room_update", (data) => {
      console.log("room updated:", data);
    });

    socket.on("error_message", (msg) => {
      console.error("socket error:", msg);
    });
  }, []);

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/img/bg1.jpg')" }}
      >
        <Loading status={loadingState} fullscreen text={loadingText} />
        {/* Overlay agar konten lebih mudah dibaca */}
        <div className="min-h-screen bg-black/40">
          {/* Header */}
          <header className="bg-black/60 text-white py-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center px-4">
              <h1 className="text-2xl font-bold">DnD Virtual</h1>
              <nav className="space-x-6">
                <a href="/lobby" className="hover:text-indigo-300">
                  Room
                </a>
                <a href="/about" className="hover:text-indigo-300">
                  About
                </a>
              </nav>
            </div>
          </header>

          {/* Hero & Search */}
          <div className="py-12">
            <div className="container mx-auto px-4 text-center text-white">
              <h2 className="text-3xl font-semibold mb-4">
                Temukan Petualanganmu
              </h2>
              <p className="mb-6">Cari room yang cocok untukmu!</p>
              <input
                type="text"
                placeholder="Cari room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md mx-auto p-3 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-bold bg-black/50 placeholder-gray-300"
              />
            </div>
          </div>

          <div className="absolute bottom-10 right-10 ">
            <Button
              variant="outline"
              onClick={() => setCreateRoomDialog(true)}
              className="cursor-pointer"
            >
              Create Room
            </Button>
          </div>

          {/* Daftar Room */}
          <div className="container mx-auto px-4 py-8">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {filtered.map((room) => (
                  <Card
                    key={room.id}
                    className="hover:scale-[1.02] hover:shadow-lg transition transform duration-200"
                  >
                    <CardHeader>
                      <CardTitle>{room.title}</CardTitle>
                      <CardDescription>{room.theme}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Max Players : {room.max_players}</p>
                      <p>Status : {room.status}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        onClick={() => openJoinDialog(room.id)}
                        className="w-full cursor-pointer"
                      >
                        Join Room
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-white">Room tidak ditemukan...</p>
            )}
          </div>

          <Dialog open={userDialog} onOpenChange={setUserDialog}>
            <form>
              <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                showCloseButton={false}
                className="sm:max-w-[425px]"
              >
                <DialogHeader>
                  <DialogTitle>Create Account</DialogTitle>
                </DialogHeader>
                <div className="grid w-full max-w-sm items-center gap-3">
                  <Label htmlFor="character_name">Username</Label>
                  <Input
                    type="text"
                    id="character_name"
                    placeholder="name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={createUser}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Create Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>

          <Dialog open={createRoomDialog} onOpenChange={setCreateRoomDialog}>
            <form>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Room</DialogTitle>
                  <DialogDescription>
                    Configure your room as your wish.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid w-full max-w-sm items-center gap-3">
                  {step === 1 ? (
                    <>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        type="title"
                        id="title"
                        placeholder="title"
                        value={roomInput.title}
                        onChange={handleRoomInput}
                      />
                      <Label htmlFor="theme">Theme</Label>
                      <Input
                        type="theme"
                        id="theme"
                        placeholder="theme"
                        value={roomInput.theme}
                        onChange={handleRoomInput}
                      />
                      <Label htmlFor="password">Password</Label>
                      <Input
                        type="password"
                        id="password"
                        placeholder="password"
                        value={roomInput.password}
                        onChange={handleRoomInput}
                      />
                      <Label htmlFor="max_player">Max Player</Label>
                      <Input
                        type="number"
                        id="max_players"
                        placeholder="max_players"
                        value={roomInput.max_players}
                        onChange={handleRoomInput}
                      />
                    </>
                  ) : (
                    <>
                      <Label htmlFor="character_name">Character Name</Label>
                      <Input
                        type="text"
                        id="character_name"
                        placeholder="name"
                        value={roomInput.character_name}
                        onChange={handleRoomInput}
                      />
                      <Label htmlFor="character_class">Character Class</Label>
                      <Input
                        type="text"
                        id="character_class"
                        placeholder="class"
                        value={roomInput.character_class}
                        onChange={handleRoomInput}
                      />
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" disabled={step == 1} onClick={prev}>
                    Prev
                  </Button>
                  <Button onClick={next}>
                    {step == 1 ? "Next" : "Create Room"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>

          <Dialog open={joinRoomDialog} onOpenChange={setJoinRoomDialog}>
            <form>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Hero</DialogTitle>
                  <DialogDescription>
                    Please tell us your name and role Hero.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid w-full max-w-sm items-center gap-3">
                  <Label htmlFor="character_name">Character Name</Label>
                  <Input
                    type="text"
                    id="character_name"
                    placeholder="name"
                    value={joinRoomInput.character_name}
                    onChange={handleJoinRoomInput}
                  />
                  <Label htmlFor="character_class">Character Class</Label>
                  <Input
                    type="text"
                    id="character_class"
                    placeholder="class"
                    value={joinRoomInput.character_class}
                    onChange={handleJoinRoomInput}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={joinRoom}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Join Room
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>
    </>
  );
}
