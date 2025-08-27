// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/img/bg1.jpg')" }}
    >
      {/* Navbar */}
      <nav className="bg-black/70 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DnD Virtual</h1>
        <ul className="flex gap-6">
          <li>
            <Link href="/lobby" className="hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-gray-300">
              About
            </Link>
          </li>
        </ul>
      </nav>

      {/* Konten About */}
      <main className="container mx-auto px-6 py-12 text-white">
        <h2 className="text-3xl font-bold mb-6">Apa itu Dungeons & Dragons (DnD)?</h2>
        <p className="mb-4 text-lg leading-relaxed">
          Dungeons & Dragons (DnD) adalah permainan role-playing (RPG) di mana para pemain
          berperan sebagai karakter dalam dunia fantasi. Permainan ini dipandu oleh seorang
          Dungeon Master (DM) yang mengatur cerita, tantangan, serta dunia tempat para
          pemain berpetualang.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Pemain membuat karakter dengan memilih ras, kelas, dan latar belakang, lalu
          menggunakan dadu untuk menentukan keberhasilan aksi mereka. Kreativitas, kerja
          sama tim, dan imajinasi sangat penting dalam permainan ini.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Untuk pemula, jangan khawatir! Kamu tidak perlu langsung menghafal semua aturan.
          Mulailah dengan karakter sederhana, ikuti arahan DM, dan biarkan ceritanya
          berkembang seiring permainan berlangsung.
        </p>
        <h3 className="text-2xl font-semibold mt-8 mb-4">Mengapa Menarik?</h3>
        <ul className="list-disc list-inside text-lg space-y-2">
          <li>Mengasah kreativitas dan imajinasi</li>
          <li>Meningkatkan kemampuan kerja sama dan komunikasi</li>
          <li>Setiap permainan unik dan penuh kejutan</li>
          <li>Bisa dimainkan dengan teman atau komunitas baru</li>
        </ul>
      </main>
    </div>
  );
}
