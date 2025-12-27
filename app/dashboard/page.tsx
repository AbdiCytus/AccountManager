// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="mt-50 w-screen flex flex-col justify-center text-center">
      <h1 className="font-bold text-2xl mb-1">Welcome to Next Dashboard!</h1>
      <p className="text-xl font-extralight">{session.user?.email}</p>
    </div>
  );
}
