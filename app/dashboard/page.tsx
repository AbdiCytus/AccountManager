// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccounts } from "@/actions/account";
import AddAccountModal from "@/components/AddAccountModal";
import AccountCard from "@/components/AccountCard";
import SearchInput from "@/components/SearchInput";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const accounts = await getAccounts(query);

  return (
    // Update padding: p-4 di mobile, p-8 di desktop
    <div className="p-4 sm:p-8 min-h-[calc(100vh-140px)] bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER RESPONSIVE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4 transition-colors">
          <div className="w-full md:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Brankas Akun
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Halo, <span className="font-medium">{session.user?.name}</span>
            </p>
          </div>

          {/* Container Search & Tombol: Stack di Mobile, Row di Desktop */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:items-center">
            <div className="w-full sm:w-64 lg:w-80">
              <SearchInput />
            </div>
            <div className="w-full sm:w-auto">
              <AddAccountModal />
            </div>
          </div>
        </div>

        {/* LIST AKUN */}
        {accounts.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 mx-auto max-w-lg md:max-w-full">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg px-4">
              {query
                ? `Tidak ditemukan akun dengan nama "${query}"`
                : "Belum ada akun yang disimpan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
