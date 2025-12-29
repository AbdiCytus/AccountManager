"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import DeleteAccountModal from "./DeleteAccountModal";

interface DeleteProps {
  id: string;
  accountName: string;
  redirectTo?: string;
}

export default function DeleteAccountButton({
  id,
  accountName,
  redirectTo,
}: DeleteProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
        <TrashIcon className="w-5 h-5" />
        Hapus Akun
      </button>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={{ id: id, platformName: accountName }}
        redirectTo={redirectTo}
      />
    </>
  );
}
