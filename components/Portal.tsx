// acc-man/components/Portal.tsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Pengecekan safety
  if (typeof document === "undefined") return null;

  return createPortal(children, document.body);
}
