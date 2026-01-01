import AddDataModal from "./modals/AddDataModal";
import SearchInput from "./dashboard/SearchInput";
import ImportExportMenu from "./menu/ImportExportMenu";
import Link from "next/link";
import Image from "next/image";

type Props = {
  session: { user?: { name: string } };
  emails: { id: string; email: string }[];
  groups: { id: string; name: string }[];
};

export default async function DashboardHeader({
  session,
  emails,
  groups,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4 transition-colors">
      <div className="w-full md:w-auto flex gap-3 items-center">
        <Link href="/dashboard/profile" className="shrink-0 group relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors shadow-sm">
            {/* Gunakan placeholder Google atau URL statis aman */}
            <Image
              src="https://lh3.googleusercontent.com/a/default-user"
              alt="Profile"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Manage Accounts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Hello, <span className="font-medium">{session.user?.name}</span>
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-auto gap-3 sm:items-center">
        <SearchInput />
        <div className="flex gap-2 items-center">
          <ImportExportMenu variant="dashboard" scope="all" />
          <AddDataModal existingEmails={emails} existingGroups={groups} />
        </div>
      </div>
    </div>
  );
}
