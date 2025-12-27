// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // 1. Ambil session langsung di server
  const session = await getServerSession(authOptions);

  // 2. Proteksi Halaman: Jika tidak ada session, tendang ke login
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div>
      <h1>Halaman Dashboard Rahasia</h1>
      <p>Selamat datang, {session.user?.email}</p>
    </div>
  );
}
