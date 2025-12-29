"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // 👇 PERHATIKAN: setMounted HARUS ada di dalam useEffect
  useEffect(() => {
    setMounted(true);
  }, []); // [] artinya hanya jalan sekali setelah render pertama (mounting)

  // Jika belum mounted (masih di server atau render pertama), jangan tampilkan apa-apa
  if (!mounted) return null;
  
  // Pengecekan ekstra agar aman
  if (typeof document === "undefined") return null;

  return createPortal(children, document.body);
}