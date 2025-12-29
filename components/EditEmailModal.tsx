"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmail } from "@/actions/email";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EmailIdentity } from "@/app/generated/prisma/client";
import toast from "react-hot-toast";

type Props = {
  emailData: EmailIdentity; // Data email yang sedang diedit
  otherEmails: { id: string; email: string }[]; // List email lain untuk opsi recovery
};

export default function EditEmailModal({ emailData, otherEmails }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [is2FA, setIs2FA] = useState(emailData.is2FAEnabled);

  // Filter agar email ini sendiri tidak muncul di daftar recovery (cegah loop)
  const recoveryOptions = otherEmails.filter((e) => e.id !== emailData.id);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.append("id", emailData.id);

    await new Promise((r) => setTimeout(r, 800));

    const result = await updateEmail(formData);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
        <PencilIcon className="w-5 h-5" />
        <span>Edit</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-auto shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                Edit Email Master
              </h3>
              <button onClick={() => setIsOpen(false)} disabled={isLoading}>
                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Pengguna
                </label>
                <input
                  name="name"
                  defaultValue={emailData.name || ""}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alamat Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={emailData.email}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password Baru (Opsional)
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Biarkan kosong jika tidak ingin ubah"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mt-2">
                <input
                  type="checkbox"
                  name="is2FA"
                  checked={is2FA}
                  onChange={(e) => setIs2FA(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aktifkan 2FA
                </span>
              </div>

              {/* 2FA Fields */}
              {is2FA && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200 animate-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      No. HP
                    </label>
                    <input
                      name="phoneNumber"
                      defaultValue={emailData.phoneNumber || ""}
                      placeholder="+62..."
                      required
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Pemulih
                    </label>
                    <select
                      name="recoveryEmailId"
                      defaultValue={emailData.recoveryEmailId || ""}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="" disabled>
                        Pilih Email...
                      </option>
                      {recoveryOptions.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.email}
                        </option>
                      ))}
                    </select>
                    {recoveryOptions.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Butuh email lain untuk recovery
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
