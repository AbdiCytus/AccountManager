"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image"; // Gunakan Image component dari Next.js

export default function Navbar() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3 bg-gray-800 py-3 px-4 rounded-lg">
          {/* Tampilkan Foto Profil Google */}
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}

          <div>
            <p className="font-bold">{session.user.name}</p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-3 py-1 rounded">
          Logout
        </button>
      </nav>
    );
  }
}
