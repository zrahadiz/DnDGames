"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [search, setSearch] = useState("");

  const rooms = [
    { id: 1, name: "Room A", genre: "Fantasy", players: 2, maxPlayers: 4 },
    { id: 2, name: "Room B", genre: "Sci-Fi", players: 3, maxPlayers: 4 },
    { id: 3, name: "Room C", genre: "Horror", players: 1, maxPlayers: 4 },
    { id: 4, name: "Room D", genre: "Mystery", players: 4, maxPlayers: 4 },
  ];

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Daftar Room */}
        <main className="container mx-auto px-4 py-8">
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
        </main>
      </div>
    </div>
  );
}
