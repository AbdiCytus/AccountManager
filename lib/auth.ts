// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // 1. Import Provider

export const authOptions: NextAuthOptions = {
  providers: [
    // 2. Tambahkan GoogleProvider ke dalam array
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Kamu bisa tetap membiarkan CredentialsProvider di sini jika ingin dual login
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  // Opsional: Callbacks untuk kustomisasi data
  callbacks: {
    async jwt({ token, user, account }) {
      // Saat login sukses dengan Google, 'account' & 'user' akan tersedia
      if (account && user) {
        // Kita bisa simpan data tambahan jika perlu
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
