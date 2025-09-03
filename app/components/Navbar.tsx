"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-purple-700">Chyrplite</h1>
      <div className="flex gap-6">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <Link href="/create" className="hover:text-purple-600">Create</Link>
        <Link href="/saved" className="hover:text-purple-600">Saved</Link>
        <Link href="/auth" className="hover:text-purple-600">Login</Link>
      </div>
    </nav>
  );
}
