import Link from "next/link";
import { verifyEmailToken } from "@/actions/verify";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage(props: Props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md">
           <h1 className="text-red-500 font-bold text-xl mb-2">Token Hilang</h1>
           <p className="text-gray-600 dark:text-gray-300">Link tidak valid.</p>
        </div>
      </div>
    );
  }

  // Panggil Server Action langsung di sini
  const result = await verifyEmailToken(token);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100 dark:border-gray-700">
        
        {result.success ? (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Berhasil!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Terima kasih. Status email Anda kini sudah terverifikasi (Centang Hijau).
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Gagal</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {result.message}
            </p>
          </>
        )}

        <Link 
          href="/dashboard?tab=emails"
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}