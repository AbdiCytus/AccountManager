// components/SessionProvider.tsx
"use client"; // Wajib karena menggunakan React Context

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}