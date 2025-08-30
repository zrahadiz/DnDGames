"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [roomInput, setRoomInput] = useState({
    title: "",
    theme: "",
    password: "",
    max_players: 0,
    character_name: "",
    character_class: "",
  });

  useEffect(() => {
    api
      .get("/rooms")
      .then((res) => {
        console.log("res: ", res.data);
        setRooms(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const prev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const createRoom = () => {
    if (step == 1) {
      setStep(step + 1);
    } else {
      api
        .post("/rooms/create", roomInput)
        .then((res) => {
          console.log("Room created: ", res.data);
          // setRooms([...rooms, res.data.room]);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log(e.target);
    setRoomInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // const rooms = [
  //   { id: 1, name: "Room A", genre: "Fantasy", players: 2, maxPlayers: 4 },
  //   { id: 2, name: "Room B", genre: "Sci-Fi", players: 3, maxPlayers: 4 },
  //   { id: 3, name: "Room C", genre: "Horror", players: 1, maxPlayers: 4 },
  //   { id: 4, name: "Room D", genre: "Mystery", players: 4, maxPlayers: 4 },
  // ];

  // const filtered = rooms.filter((r) =>
  //   r.name.toLowerCase().includes(search.toLowerCase())
  // );

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/img/bg1.jpg')" }}
    >
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

        <div className="absolute bottom-10 right-10">
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button variant="outline">Create Room</Button>
              </DialogTrigger>
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
                        onChange={handleChange}
                      />
                      <Label htmlFor="theme">Theme</Label>
                      <Input
                        type="theme"
                        id="theme"
                        placeholder="theme"
                        value={roomInput.theme}
                        onChange={handleChange}
                      />
                      <Label htmlFor="password">Password</Label>
                      <Input
                        type="password"
                        id="password"
                        placeholder="password"
                        value={roomInput.password}
                        onChange={handleChange}
                      />
                      <Label htmlFor="max_player">Max Player</Label>
                      <Input
                        type="number"
                        id="max_players"
                        placeholder="max_players"
                        value={roomInput.max_players}
                        onChange={handleChange}
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
                        onChange={handleChange}
                      />
                      <Label htmlFor="character_class">Character Class</Label>
                      <Input
                        type="text"
                        id="character_class"
                        placeholder="class"
                        value={roomInput.character_class}
                        onChange={handleChange}
                      />
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" disabled={step == 1} onClick={prev}>
                    Prev
                  </Button>
                  <Button onClick={createRoom}>
                    {step == 1 ? "Next" : "Create Room"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>

        {/* Daftar Room */}
        {/* <main className="container mx-auto px-4 py-8">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {filtered.map((room) => (
                <div
                  key={room.id}
                  className="bg-white/90 p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <Link
                    href={`/rooms/${room.id}`}
                    className="block text-indigo-600 text-lg font-bold hover:underline mb-2"
                  >
                    {room.name}
                  </Link>
                  <p className="text-gray-800">Genre: {room.genre}</p>
                  <p className="text-gray-800">
                    Players: {room.players}/{room.maxPlayers}
                  </p>
                  <p
                    className={`mt-2 font-semibold ${
                      room.players >= room.maxPlayers
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {room.players >= room.maxPlayers ? "Full" : "Open"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white">Room tidak ditemukan...</p>
          )}
        </main> */}
      </div>
    </div>
  );
}
