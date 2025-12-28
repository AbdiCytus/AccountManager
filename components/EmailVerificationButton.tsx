"use client";

import { useState } from "react";
import { toggleEmailVerification } from "@/actions/email";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

interface Props {
  id: string;
  isVerified: boolean;
}

export default function EmailVerificationButton({ id, isVerified }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    // Simulasi mengirim email (Delay 1 detik agar terasa nyata)
    if (!isVerified) {
      toast.loading("Mengirim email verifikasi...", { duration: 1000 });
      await new Promise((r) => setTimeout(r, 1000));
    }

    const result = await toggleEmailVerification(id);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
          <CheckBadgeIcon className="w-6 h-6" />
          <span className="font-bold">Terverifikasi</span>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className="text-xs text-gray-400 mt-2 hover:text-red-500 transition-colors underline">
          Batalkan Verifikasi (Debug)
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50">
      <XCircleIcon className="w-6 h-6" />
      <span className="font-medium">
        {isLoading ? "Memproses..." : "Verifikasi Sekarang"}
      </span>
    </button>
  );
}
