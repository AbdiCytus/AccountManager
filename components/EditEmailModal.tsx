"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmail } from "@/actions/email";
import { EmailIdentity } from "@/app/generated/prisma/client"; // Import tipe data asli dari Prisma
import {
  PencilSquareIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Portal from "./Portal";

type Props = {
  emailData: EmailIdentity;
  otherEmails: { id: string; email: string }[];
  isIcon: boolean;
};

export default function EditEmailModal({
  emailData,
  otherEmails,
  isIcon = false,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE FORM ---
  // Kita butuh state inputEmail untuk mendeteksi perubahan secara real-time
  const [inputEmail, setInputEmail] = useState(emailData.email);
  const [is2FA, setIs2FA] = useState(emailData.is2FAEnabled);

  // --- STATE KONFIRMASI ---
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  // Filter agar email ini sendiri tidak muncul di opsi recovery
  const recoveryOptions = otherEmails.filter((e) => e.id !== emailData.id);

  // Cek apakah email sedang diedit (berbeda dari database)
  const isEmailChanged = inputEmail !== emailData.email;

  // 1. HANDLER PERTAMA: Saat tombol "Simpan" diklik
  async function handlePreSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("id", emailData.id);

    // ATURAN PENTING:
    // Jika email ini SUDAH VERIFIED dan USER MENGUBAH ALAMAT EMAIL-nya
    // Maka tampilkan konfirmasi dulu, jangan langsung simpan.
    if (emailData.isVerified && isEmailChanged) {
      setPendingFormData(formData); // Simpan data di memori sementara
      setShowConfirmation(true); // Tampilkan layer konfirmasi
      return; // Berhenti di sini
    }

    // Jika kondisi di atas tidak terpenuhi, langsung simpan
    await processUpdate(formData);
  }

  // 2. HANDLER KEDUA: Proses Simpan ke Server (Eksekusi Akhir)
  async function processUpdate(formData: FormData) {
    setIsLoading(true);
    setShowConfirmation(false); // Tutup layer konfirmasi jika ada

    // UX Delay sedikit
    await new Promise((r) => setTimeout(r, 800));

    const result = await updateEmail(formData);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      setPendingFormData(null);
      router.refresh(); // Refresh halaman agar data terbaru muncul
    } else {
      toast.error(result.message);
    }
  }

  // Fungsi Reset saat modal ditutup/dibuka
  const handleOpen = () => {
    setInputEmail(emailData.email);
    setIs2FA(emailData.is2FAEnabled);
    setShowConfirmation(false);
    setIsOpen(true);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={handleOpen}
        className={
          isIcon
            ? "p-2 text-blue-600 hover:text-blue-800 transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
            : "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        }
        title="Edit Email">
        {isIcon && <PencilSquareIcon className="w-5 h-5" />}
      </button>

      {/* OVERLAY MODAL */}
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-auto shadow-2xl p-6 relative overflow-hidden transition-all">
              {/* --- LAYAR 1: FORM UTAMA --- */}
              {!showConfirmation ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                      Edit Email Master
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}>
                      <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>

                  <form onSubmit={handlePreSubmit} className="space-y-4">
                    {/* Nama Pengguna */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama Pengguna
                      </label>
                      <input
                        name="name"
                        defaultValue={emailData.name || ""}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Alamat Email & Warning Box */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alamat Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />

                      {/* LOGIKA PERINGATAN TEKS */}
                      {emailData.isVerified && (
                        <div
                          className={`mt-2 text-xs p-3 rounded-lg border flex items-start gap-2 transition-colors ${
                            isEmailChanged
                              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}>
                          <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            {isEmailChanged ? (
                              <>
                                <b>Peringatan:</b> Anda mengubah email yang
                                terverifikasi. <br />
                                Status verifikasi akan <u>DICABUT</u> jika Anda
                                menyimpan perubahan ini.
                              </>
                            ) : (
                              "Email ini sudah Terverifikasi (Aman). Mengubah alamat email akan menghapus status verifikasi."
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password Baru (Opsional)
                      </label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Biarkan kosong jika tidak ingin ubah"
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* 2FA Section */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mt-2">
                      <input
                        type="checkbox"
                        name="is2FA"
                        id="is2FA"
                        checked={is2FA}
                        onChange={(e) => setIs2FA(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <label
                        htmlFor="is2FA"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        Aktifkan 2-Factor Authentication (2FA)
                      </label>
                    </div>

                    {is2FA && (
                      <div className="space-y-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            No. HP
                          </label>
                          <input
                            name="phoneNumber"
                            defaultValue={emailData.phoneNumber || ""}
                            placeholder="+62..."
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Pemulih
                          </label>
                          <select
                            name="recoveryEmailId"
                            defaultValue={emailData.recoveryEmailId || ""}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="" disabled>
                              Pilih Email...
                            </option>
                            {recoveryOptions.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow">
                        {isLoading ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* --- LAYAR 2: KONFIRMASI (Jika Verified & Email Berubah) --- */
                <div className="text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-400 ring-8 ring-yellow-50 dark:ring-yellow-900/10">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Konfirmasi Perubahan Email
                  </h3>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-sm text-left">
                    <p className="text-gray-800 dark:text-gray-200 mb-2 font-medium">
                      Anda akan melakukan hal berikut:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                      <li>
                        Mengubah alamat email dari <b>{emailData.email}</b>{" "}
                        menjadi <b>{inputEmail}</b>.
                      </li>
                      <li className="text-red-600 dark:text-red-400 font-bold">
                        {'Status "Terverifikasi" akan dicabut/dihapus.'}
                      </li>
                      <li>
                        Anda harus melakukan verifikasi ulang ke email yang
                        baru.
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmation(false)} // Kembali ke Form
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Batal
                    </button>
                    <button
                      onClick={() =>
                        pendingFormData && processUpdate(pendingFormData)
                      } // Lanjut Simpan
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex justify-center gap-2 items-center shadow-lg shadow-blue-500/30">
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        "Ya, Simpan & Reset"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
