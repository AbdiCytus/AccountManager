// types/dashboard.ts

import {
  SavedAccount,
  AccountGroup,
  EmailIdentity,
} from "@/app/generated/prisma/client";

export type FilterType = "all" | "account" | "group";
export type GroupStatusOption = "all" | "inside" | "outside";
export type FilterOption = "all" | "yes" | "no";
export type SortOption = "newest" | "oldest" | "az" | "za";

export type AccountWithRelations = SavedAccount & {
  emailIdentity: { email: string } | null;
  group: { name: string } | null;
};

export type GroupWithCount = AccountGroup & {
  _count: { accounts: number };
};

export type EmailWithRelations = EmailIdentity & {
  recoveryEmail?: { email: string } | null;
  _count: { linkedAccounts: number };
};

export interface DndData {
  type: "account" | "group";
  accountId?: string;
  groupId?: string;
  platformName?: string;
  groupName?: string;
}
