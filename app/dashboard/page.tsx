// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import AddAccountModal from "@/components/AddAccountModal";
import AccountCard from "@/components/AccountCard";
import SearchInput from "@/components/SearchInput";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const accounts = await getAccounts(query);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER: Judul & Tombol Tambah */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl font-bold text-gray-800">Brankas Akun</h1>
            <p className="text-gray-500 text-sm">Halo, {session.user?.name}</p>
          </div>

          <div className="flex w-full md:w-auto gap-3 items-center">
            <SearchInput />
            <AddAccountModal />
          </div>
        </div>

        {/* LIST AKUN (GRID) */}
        {accounts.length === 0 ? (
          // State Kosong
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              {query
                ? `Tidak ditemukan akun dengan nama "${query}"`
                : "Belum ada akun yang disimpan."}
            </p>
            <p className="text-sm text-gray-400">
              {`Klik tombol "Tambah Akun" untuk mulai.`}
            </p>
          </div>
        ) : (
          // State Ada Data
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                id={account.id}
                platformName={account.platformName}
                username={account.username}
                category={account.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
