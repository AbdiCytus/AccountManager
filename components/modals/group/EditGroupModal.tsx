"use client";
import type { AccountGroup } from "@/app/generated/prisma/client";
import Portal from "@/components/Portal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateGroup } from "@/actions/group";
import toast from "react-hot-toast";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function EditGroupModal({
  group,
  isIcon = false,
}: {
  group: AccountGroup;
  isIcon?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateGroup(group.id, name);
      if (result.success) {
        toast.success("Group updated!");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengupdate group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          isIcon
            ? "p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            : "flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        }
        title="Edit Group">
        <PencilSquareIcon className="w-5 h-5" />
        {!isIcon && <span>Edit</span>}
      </button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <form
              onSubmit={handleUpdate}
              className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Edit Folder Group
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Group
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Masukkan nama group..."
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                    {isLoading && (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Portal>
      )}
    </>
  );
}
