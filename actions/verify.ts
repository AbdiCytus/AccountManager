"use server";

import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. KIRIM EMAIL VERIFIKASI (Dengan Rate Limit & Expiry)
export async function sendVerificationEmail(emailId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const emailData = await prisma.emailIdentity.findUnique({
      where: { id: emailId, userId: session.user.id },
    });

    if (!emailData) return { success: false, message: "Email tidak ditemukan" };
    if (emailData.isVerified)
      return { success: false, message: "Email sudah terverifikasi" };

    // --- LOGIKA RATE LIMIT (MAX 3X PER HARI) ---
    const now = new Date();
    const lastSent = emailData.lastVerificationSent;
    let attempts = emailData.verificationAttempts;

    // Cek apakah hari ini berbeda dengan terakhir kirim (Reset jika sudah ganti hari)
    if (lastSent && lastSent.toDateString() !== now.toDateString()) {
      attempts = 0;
    }

    if (attempts >= 3) {
      return {
        success: false,
        message: "Batas verifikasi harian telah habis",
      };
    }

    // --- GENERATE TOKEN & EXPIRY (1 HARI) ---
    const token = `${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 Jam

    // Update DB (Simpan token, expiry, dan increment attempt)
    await prisma.emailIdentity.update({
      where: { id: emailId },
      data: {
        verificationToken: token,
        tokenExpiresAt: expiresAt,
        lastVerificationSent: now,
        verificationAttempts: attempts + 1,
      },
    });

    // Kirim Email (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Account Manager" <${process.env.SMTP_EMAIL}>`,
      to: emailData.email,
      subject: "Verifikasi Email Anda",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563EB;">Verifikasi Email</h2>
          <p>Halo <b>${emailData.name || "Pengguna"}</b>,</p>
          <p>Sistem kami menerima permintaan untuk memverifikasi alamat email ini: <b>${
            emailData.email
          }</b>.</p>
          <p>Silakan klik tombol di bawah ini untuk memverifikasi:</p>
          <a href="${verifyLink}" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifikasi Sekarang</a>
          <p>Link ini hanya berlaku selama <b>24 jam</b>.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">Jika Anda tidak merasa melakukan ini, abaikan saja email ini.</p>
        </div> `,
    });

    return {
      success: true,
      message: `Link verifikasi dikirim!`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengirim email." };
  }
}

// 2. PROSES VERIFIKASI TOKEN (Cek Token & Expiry)
export async function verifyEmailToken(token: string) {
  try {
    const emailData = await prisma.emailIdentity.findFirst({
      where: { verificationToken: token },
    });

    if (!emailData) return { success: false, message: "Token tidak valid." };

    // --- CEK EXPIRY ---
    if (emailData.tokenExpiresAt && new Date() > emailData.tokenExpiresAt) {
      return {
        success: false,
        message: "Link verifikasi sudah kadaluarsa (Expired).",
      };
    }

    // Verifikasi Sukses
    await prisma.emailIdentity.update({
      where: { id: emailData.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
        verificationAttempts: 0, // Reset attempt jika berhasil
      },
    });

    return { success: true, message: "Email berhasil diverifikasi!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
