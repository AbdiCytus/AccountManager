// app/dashboard/group/[id]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma }from "@/lib/prisma"; // Pastikan path prisma client benar
import GroupDetailClient from "@/components/GroupDetailClient"; // Import komponen baru

type Props = { params: Promise<{ id: string }> };

export default async function GroupDetailPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. Ambil data group
  const group = await prisma.accountGroup.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!group) notFound();

  // 2. Ambil data akun di dalam group (sama seperti logic sebelumnya di getGroupById)
  // Kita fetch terpisah agar tipenya mudah dicocokkan dengan GroupDetailClient props
  const accounts = await prisma.savedAccount.findMany({
    where: {
      groupId: params.id,
      userId: session.user.id,
    },
    include: {
      emailIdentity: { select: { email: true } },
      group: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Render Client Component (Struktur layout container tetap disini)
  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto">
        <GroupDetailClient group={group} accounts={accounts} />
      </div>
    </div>
  );
}
