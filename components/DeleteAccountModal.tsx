// components/DeleteAccountModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/actions/account";
import toast from "react-hot-toast"; // Import toast
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

type DeleteProps = {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    platformName: string;
  };
};

export default function DeleteAccountModal({
  isOpen,
  onClose,
  account,
}: DeleteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleConfirmDelete() {
    setIsLoading(true);
    const result = await deleteAccount(account.id);
    setIsLoading(false);

    if (result.success) {
      toast.success("Akun berhasil dihapus!");
      router.refresh();
      onClose();
    } else {
      toast.error("Gagal menghapus akun.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
        {/* Ikon Peringatan Besar */}
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Akun?</h3>
        <p className="text-gray-500 text-sm mb-6">
          Apakah kamu yakin ingin menghapus akun{" "}
          <strong>{account.platformName}</strong>? Tindakan ini tidak bisa
          dibatalkan.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
            Batal
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {isLoading ? (
              "Menghapus..."
            ) : (
              <>
                <TrashIcon className="w-4 h-4" /> Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
