// components/profile/LogDate.tsx
"use client";

import { useEffect, useState } from "react";

export default function LogDate({ date }: { date: Date }) {
  // Gunakan state untuk menghindari hydration mismatch error
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // Logic ini berjalan di browser user
    const localString = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

    setFormattedDate(localString);
  }, [date]);

  // Render placeholder saat server-side render, lalu ganti dengan tanggal asli
  if (!formattedDate)
    return <span className="opacity-50 text-[10px]">Loading...</span>;

  return <span>{formattedDate}</span>;
}
