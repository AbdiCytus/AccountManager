import { encrypt, decrypt } from "@/lib/crypto";

export default function TestCryptoPage() {
  const originalText = "KUDATERBANGKACHOW0028";

  // 1. Coba Enkripsi
  // Ini akan mengubah teks menjadi kode acak
  const encrypted = encrypt(originalText);

  // 2. Coba Dekripsi balik
  // Ini harus mengubah kode acak tadi KEMBALI menjadi teks asli
  let decrypted = "";
  let errorMsg = "";

  try {
    decrypted = decrypt(encrypted);
  } catch (err) {
    errorMsg = "Gagal mendekripsi! Cek konfigurasi Key.";
  }

  // 3. Cek apakah cocok
  const isSuccess = originalText === decrypted;

  return (
    <div className="p-10 space-y-6 font-mono">
      <h1 className="text-2xl font-bold font-sans">
        Uji Coba Sistem Enkripsi 🛡️
      </h1>

      <div className="border p-6 rounded bg-gray-100 flex flex-col gap-4">
        <div>
          <p className="text-gray-500 text-sm">Input (Teks Asli):</p>
          <p className="font-bold text-lg">{originalText}</p>
        </div>

        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
          <p className="text-gray-500 text-sm">
            Hasil Enkripsi (Yang disimpan di DB):
          </p>
          <p className="break-all text-blue-800">{encrypted}</p>
          <p className="text-xs text-gray-400 mt-1">
            *Coba refresh halaman, kode ini harusnya berubah-ubah terus (karena
            IV acak).
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Hasil Dekripsi (Yang dilihat User):
          </p>
          {errorMsg ? (
            <p className="text-red-600 font-bold">{errorMsg}</p>
          ) : (
            <p className="font-bold text-lg text-green-700">{decrypted}</p>
          )}
        </div>
      </div>

      <div
        className={`p-4 rounded text-white text-center font-bold text-xl ${
          isSuccess ? "bg-green-600" : "bg-red-600"
        }`}>
        STATUS: {isSuccess ? "BERHASIL & AMAN ✅" : "GAGAL ❌"}
      </div>
    </div>
  );
}
