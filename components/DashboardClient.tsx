// components/DashboardClient.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  FolderIcon,
  ListBulletIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import AccountCard from "./AccountCard";
import GroupCard from "./GroupCard";
import EmailCard from "./EmailCard";
import toast from "react-hot-toast";

import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { moveAccountToGroup } from "@/actions/account";

import type {
  SavedAccount,
  AccountGroup,
  EmailIdentity,
} from "@/app/generated/prisma/client";

// --- TYPES ---
type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

type GroupWithCount = AccountGroup & {
  _count: { accounts: number };
};

type EmailWithRelations = EmailIdentity & {
  recoveryEmail?: { email: string } | null;
  _count: { linkedAccounts: number };
};

type DashboardProps = {
  accounts: AccountWithRelations[];
  groups: GroupWithCount[];
  emails: EmailWithRelations[];
  query: string;
};

type FilterType = "all" | "account" | "group";
type GroupStatusOption = "all" | "inside" | "outside"; // Tipe Baru
type FilterOption = "all" | "yes" | "no";
type SortOption = "newest" | "oldest" | "az" | "za";

interface DndData {
  type: "account" | "group";
  accountId?: string;
  groupId?: string;
  platformName?: string;
  groupName?: string;
}

const CATEGORIES = ["Social", "Game", "Work", "Finance", "Other"];

export default function DashboardClient({
  accounts,
  groups,
  emails,
  query,
}: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. STATE MANAGEMENT ---
  const activeTab =
    searchParams.get("tab") === "emails" ? "emails" : "accounts";

  const [filterType, setFilterType] = useState<FilterType>("all");

  // STATE BARU: Status Group (Hanya aktif jika filterType === 'account')
  const [filterGroupStatus, setFilterGroupStatus] =
    useState<GroupStatusOption>("all");

  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterHasEmail, setFilterHasEmail] = useState<FilterOption>("all");
  const [filterHasPassword, setFilterHasPassword] =
    useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);

  // --- 2. HANDLERS ---
  const handleTabChange = (tab: "accounts" | "emails") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTypeChange = (type: FilterType) => {
    setFilterType(type);

    // Reset filter yang relevan saat tipe berubah
    if (type !== "account") {
      setFilterGroupStatus("all"); // Reset status group jika bukan mode akun
    }

    if (type === "group") {
      setFilterCategories([]);
      setFilterHasEmail("all");
      setFilterHasPassword("all");
    }
  };

  const toggleCategory = (category: string) => {
    setFilterCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // --- 3. FILTERING & SORTING ENGINE ---
  const { filteredAccounts, filteredGroups } = useMemo(() => {
    let resAccounts = [...accounts];
    let resGroups = [...groups];

    // A. FILTERING LOGIC

    // 1. Filter Tipe Tampilan
    if (filterType === "group") {
      resAccounts = [];
    } else if (filterType === "account") {
      resGroups = [];
      // Mode Akun: Semua akun ditampilkan by default, nanti difilter status groupnya di bawah
    } else {
      // Mode All: Tampilkan Group + Akun Yg Tidak Punya Group (Orphan) saja
      resAccounts = resAccounts.filter((acc) => !acc.groupId);
    }

    // 2. Filter Lanjutan (Hanya berlaku jika akun ditampilkan dan BUKAN mode Group)
    if (filterType !== "group") {
      // LOGIKA BARU: Filter Status Group (Hanya jika mode 'account')
      if (filterType === "account") {
        if (filterGroupStatus === "inside") {
          resAccounts = resAccounts.filter((acc) => acc.groupId !== null);
        } else if (filterGroupStatus === "outside") {
          resAccounts = resAccounts.filter((acc) => acc.groupId === null);
        }
      }

      // Kategori
      if (filterCategories.length > 0) {
        resAccounts = resAccounts.filter((acc) =>
          acc.categories.some((cat) => filterCategories.includes(cat))
        );
      }

      // Email
      if (filterHasEmail !== "all") {
        resAccounts = resAccounts.filter((acc) =>
          filterHasEmail === "yes" ? !!acc.emailIdentity : !acc.emailIdentity
        );
      }

      // Password
      if (filterHasPassword !== "all") {
        resAccounts = resAccounts.filter((acc) =>
          filterHasPassword === "yes"
            ? !!acc.encryptedPassword
            : !acc.encryptedPassword
        );
      }
    }

    // B. SORTING LOGIC
    if (resAccounts.length > 0) {
      if (sortBy === "oldest") {
        resAccounts.reverse();
      } else if (sortBy === "az") {
        resAccounts.sort((a, b) =>
          a.platformName.localeCompare(b.platformName)
        );
      } else if (sortBy === "za") {
        resAccounts.sort((a, b) =>
          b.platformName.localeCompare(a.platformName)
        );
      }
    }

    if (resGroups.length > 0) {
      if (sortBy === "oldest") {
        resGroups.reverse();
      } else if (sortBy === "az") {
        resGroups.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "za") {
        resGroups.sort((a, b) => b.name.localeCompare(a.name));
      }
    }

    return { filteredAccounts: resAccounts, filteredGroups: resGroups };
  }, [
    accounts,
    groups,
    filterType,
    filterGroupStatus, // Dependency baru
    filterCategories,
    filterHasEmail,
    filterHasPassword,
    sortBy,
  ]);

  const isDataEmpty =
    filteredAccounts.length === 0 && filteredGroups.length === 0;

  // --- DND LOGIC ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as DndData | undefined;
    const overData = over.data.current as DndData | undefined;

    if (
      activeData?.type === "account" &&
      activeData.accountId &&
      overData?.type === "group" &&
      overData.groupId
    ) {
      const toastId = toast.loading(
        `Memindahkan ${activeData.platformName || "akun"}...`
      );
      const result = await moveAccountToGroup(
        activeData.accountId,
        overData.groupId
      );

      if (result.success) toast.success(result.message, { id: toastId });
      else toast.error(result.message, { id: toastId });
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* --- TOOLBAR --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-30 transition-colors">
          <div className="flex gap-2 w-full sm:w-auto relative">
            {activeTab === "accounts" && (
              <>
                {/* 1. BUTTON FILTER */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === "filter" ? null : "filter")
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      filterType !== "all" ||
                      filterCategories.length > 0 ||
                      filterHasEmail !== "all" ||
                      filterHasPassword !== "all" ||
                      filterGroupStatus !== "all" // Cek jika filter baru aktif
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    }`}>
                    <FunnelIcon className="w-4 h-4" />
                    <span>Filter</span>
                    {filterCategories.length > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">
                        {filterCategories.length}
                      </span>
                    )}
                    <ChevronDownIcon
                      className={`w-3 h-3 transition-transform ${
                        openMenu === "filter" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* DROPDOWN FILTER */}
                  {openMenu === "filter" && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}></div>
                      <div className="absolute top-full left-0 py-2 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                        {/* Section Tipe */}
                        <SectionHeader title="Tampilkan" />
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                          <button
                            onClick={() => handleTypeChange("all")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterType === "all"
                                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                : "text-gray-500"
                            }`}>
                            Semua
                          </button>
                          <button
                            onClick={() => handleTypeChange("account")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterType === "account"
                                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                : "text-gray-500"
                            }`}>
                            Akun
                          </button>
                          <button
                            onClick={() => handleTypeChange("group")}
                            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                              filterType === "group"
                                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                : "text-gray-500"
                            }`}>
                            Group
                          </button>
                        </div>

                        {/* FILTER KHUSUS STATUS GROUP (Hanya muncul jika Tampilkan: Akun) */}
                        {filterType === "account" && (
                          <>
                            <SectionHeader title="Lokasi Akun" />
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 mx-4 rounded-lg mb-2">
                              <button
                                onClick={() => setFilterGroupStatus("all")}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                                  filterGroupStatus === "all"
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500"
                                }`}>
                                Semua
                              </button>
                              <button
                                onClick={() => setFilterGroupStatus("outside")}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                                  filterGroupStatus === "outside"
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500"
                                }`}>
                                Luar
                              </button>
                              <button
                                onClick={() => setFilterGroupStatus("inside")}
                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                                  filterGroupStatus === "inside"
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500"
                                }`}>
                                Grup
                              </button>
                            </div>
                          </>
                        )}

                        {/* Section Filter Lanjutan (Hidden jika filterType = Group) */}
                        {filterType !== "group" && (
                          <>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                            <SectionHeader title="Kategori" />

                            <div className="px-4 flex flex-wrap gap-2 mb-2">
                              {CATEGORIES.map((cat) => {
                                const isActive = filterCategories.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-all select-none ${
                                      isActive
                                        ? "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300 font-medium"
                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                    }`}>
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                            <SectionHeader title="Kelengkapan" />

                            <div className="px-4 py-2 space-y-3">
                              {/* Filter Email */}
                              <div>
                                <p className="text-xs text-gray-500 mb-1.5">
                                  Email Terhubung
                                </p>
                                <div className="flex gap-2">
                                  {(
                                    [
                                      ["all", "Semua"],
                                      ["yes", "Ada"],
                                      ["no", "Tidak"],
                                    ] as const
                                  ).map(([val, label]) => (
                                    <button
                                      key={val}
                                      onClick={() =>
                                        setFilterHasEmail(val as FilterOption)
                                      }
                                      className={`px-3 py-1 rounded text-xs border ${
                                        filterHasEmail === val
                                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800"
                                          : "border-gray-200 dark:border-gray-600"
                                      }`}>
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Filter Password */}
                              <div>
                                <p className="text-xs text-gray-500 mb-1.5">
                                  Password Tersimpan
                                </p>
                                <div className="flex gap-2">
                                  {(
                                    [
                                      ["all", "Semua"],
                                      ["yes", "Ada"],
                                      ["no", "Tidak"],
                                    ] as const
                                  ).map(([val, label]) => (
                                    <button
                                      key={val}
                                      onClick={() =>
                                        setFilterHasPassword(
                                          val as FilterOption
                                        )
                                      }
                                      className={`px-3 py-1 rounded text-xs border ${
                                        filterHasPassword === val
                                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800"
                                          : "border-gray-200 dark:border-gray-600"
                                      }`}>
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Reset Button */}
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-4 pb-2">
                          <button
                            onClick={() => {
                              handleTypeChange("all");
                              setFilterGroupStatus("all");
                              setFilterCategories([]);
                              setFilterHasEmail("all");
                              setFilterHasPassword("all");
                              setOpenMenu(null);
                            }}
                            className="w-full py-2 text-xs text-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            Reset Filter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 2. BUTTON SORT */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === "sort" ? null : "sort")
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      sortBy !== "newest"
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    }`}>
                    <ArrowsUpDownIcon className="w-4 h-4" />
                    <span>Urutkan</span>
                  </button>

                  {/* DROPDOWN SORT */}
                  {openMenu === "sort" && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}></div>
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden py-1 animate-in zoom-in-95 duration-150">
                        <SectionHeader title="Waktu Ditambahkan" />
                        <DropdownItem
                          label="Paling Baru"
                          active={sortBy === "newest"}
                          onClick={() => setSortBy("newest")}
                        />
                        <DropdownItem
                          label="Paling Lama"
                          active={sortBy === "oldest"}
                          onClick={() => setSortBy("oldest")}
                        />

                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                        <SectionHeader
                          title={
                            filterType === "group"
                              ? "Nama Group"
                              : "Nama Platform"
                          }
                        />
                        <DropdownItem
                          label="Abjad (A-Z)"
                          active={sortBy === "az"}
                          onClick={() => setSortBy("az")}
                        />
                        <DropdownItem
                          label="Abjad (Z-A)"
                          active={sortBy === "za"}
                          onClick={() => setSortBy("za")}
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* KANAN: Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => handleTabChange("accounts")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "accounts"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Akun</span>
            </button>
            <button
              onClick={() => handleTabChange("emails")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "emails"
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              <EnvelopeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        {activeTab === "accounts" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredGroups.length > 0 && (
              <section className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <FolderIcon className="w-5 h-5 text-blue-500" />
                    Folder Group
                  </h2>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500">
                    {filteredGroups.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      id={group.id}
                      name={group.name}
                      count={group._count.accounts}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredAccounts.length > 0 && (
              <section className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <ListBulletIcon className="w-5 h-5 text-green-500" />
                    Daftar Akun
                  </h2>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500">
                    {filteredAccounts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAccounts.map((acc) => (
                    <AccountCard
                      key={acc.id}
                      id={acc.id}
                      platformName={acc.platformName}
                      username={acc.username}
                      categories={acc.categories}
                      email={acc.emailIdentity?.email}
                      hasPassword={!!acc.encryptedPassword}
                      icon={acc.icon}
                      groupName={acc.group?.name}
                      groupId={acc.groupId}
                    />
                  ))}
                </div>
              </section>
            )}

            {isDataEmpty && (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex flex-col items-center gap-2">
                  <FunnelIcon className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    Tidak ada data yang sesuai filter.
                  </p>
                  <button
                    onClick={() => {
                      handleTypeChange("all");
                      setFilterGroupStatus("all");
                      setFilterCategories([]);
                      setFilterHasEmail("all");
                      setFilterHasPassword("all");
                    }}
                    className="text-sm text-blue-600 hover:underline">
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {emails.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <EnvelopeIcon className="w-5 h-5 text-purple-500" />
                  Daftar Email
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emails.map((email) => (
                    <EmailCard
                      key={email.id}
                      id={email.id}
                      email={email.email}
                      name={email.name}
                      isVerified={email.isVerified}
                      linkedCount={email._count.linkedAccounts}
                    />
                  ))}
                </div>
              </section>
            )}

            {emails.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">
                  {query
                    ? `Tidak ada email dengan kata kunci "${query}"`
                    : "Belum ada email master."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DndContext>
  );
}

// --- UI HELPER ---
const DropdownItem = ({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={() => onClick()}
    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center transition-colors ${
      active
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}>
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
    {active && <CheckIcon className="w-4 h-4" />}
  </button>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-4 py-1.5 mt-2 mb-1 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
    {title}
  </div>
);
