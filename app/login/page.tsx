"use client"; // Harus Client Component karena ada onClick

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1>Login Page</h1>

      {/* Tombol Login Google */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Sign in with Google
      </button>

      {/* Tombol Login Biasa (jika ada credentials) */}
      <button onClick={() => signIn()} className="text-sm text-gray-500">
        Login with Options
      </button>
    </div>
  );
}
