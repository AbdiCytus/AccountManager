// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account"; // Import fungsi pengambil data
import AddAccountModal from "@/components/AddAccountModal"; // Import komponen tombol tadi

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  // 1. Ambil Data Akun (Server Side Fetching) 🚀
  const accounts = await getAccounts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER: Judul & Tombol Tambah */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Brankas Akun</h1>
            <p className="text-gray-500">Halo, {session.user?.name}</p>
          </div>
          <AddAccountModal />
        </div>

        {/* LIST AKUN (GRID) */}
        {accounts.length === 0 ? (
          // State Kosong
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              Belum ada akun yang disimpan.
            </p>
            <p className="text-sm text-gray-400">
              {`Klik tombol "Tambah Akun" untuk mulai.`}
            </p>
          </div>
        ) : (
          // State Ada Data
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                    {account.category}
                  </div>
                  {/* Nanti tombol delete disini */}
                </div>

                <h3 className="font-bold text-lg text-gray-800">
                  {account.platformName}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{account.username}</p>

                <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-mono text-gray-600">••••••••</span>
                  {/* Nanti tombol lihat password disini */}
                  <button className="text-xs text-blue-600 hover:underline">
                    Show
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
