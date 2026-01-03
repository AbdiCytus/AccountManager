"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { ReactNode, useState, useRef, useEffect } from "react";

export default function ActionMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menutup menu saat klik di luar (Penting untuk Mobile)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      // DESKTOP LOGIC: Buka saat hover, tutup saat mouse keluar
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`relative flex items-center justify-center rounded-lg transition-all duration-300 ease-in-out border ${
        isOpen
          ? "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
          : "border-transparent hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-600"
      }`}>
      {/* MOBILE LOGIC: onClick akan menangani tap di layar sentuh */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 cursor-pointer text-gray-500 dark:text-gray-400 focus:outline-none animate-in fade-in duration-200">
          <EllipsisVerticalIcon className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="flex items-center gap-2 p-0.5 animate-in slide-in-from-right-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
