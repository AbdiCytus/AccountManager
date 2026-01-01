// actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getProfileStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // 1. Ambil Statistik Global
  const [totalAccounts, totalEmails, totalGroups, logs] = await Promise.all([
    prisma.savedAccount.count({ where: { userId } }),
    prisma.emailIdentity.count({ where: { userId } }),
    prisma.accountGroup.count({ where: { userId } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20, // Batasi 20 log terakhir
    }),
  ]);

  // 2. Ambil Data Kategori untuk Grafik
  const accounts = await prisma.savedAccount.findMany({
    where: { userId },
    select: { categories: true },
  });

  // Hitung distribusi kategori (Manual aggregation karena array string)
  const categoryStats: Record<string, number> = {};
  accounts.forEach((acc) => {
    acc.categories.forEach((cat) => {
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
  });

  return {
    user: session.user,
    stats: {
      accounts: totalAccounts,
      emails: totalEmails,
      groups: totalGroups,
    },
    chartData: categoryStats,
    logs,
  };
}
