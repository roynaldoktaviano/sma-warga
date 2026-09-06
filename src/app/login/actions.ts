"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

// ---------- Rate limit percobaan login ----------
// Catatan: disimpan in-memory per proses server — cukup untuk deployment single-instance,
// tapi akan reset saat server restart dan tidak sinkron lintas instance kalau di-scale horizontal.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;   // jendela hitung percobaan gagal
const LOCKOUT_MS = 5 * 60 * 1000;  // durasi kunci setelah melebihi batas

type Attempt = { count: number; firstAttemptAt: number; lockedUntil?: number };
const attempts = new Map<string, Attempt>();

function rateLimitKey(username: string): string {
  return username.toLowerCase();
}

function checkRateLimit(username: string): { blocked: boolean; retryAfterSec?: number } {
  const key = rateLimitKey(username);
  const a = attempts.get(key);
  if (!a) return { blocked: false };

  const now = Date.now();
  if (a.lockedUntil && now < a.lockedUntil) {
    return { blocked: true, retryAfterSec: Math.ceil((a.lockedUntil - now) / 1000) };
  }
  // Jendela hitung sudah lewat — reset percobaan
  if (now - a.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key);
    return { blocked: false };
  }
  return { blocked: false };
}

function recordFailure(username: string): void {
  const key = rateLimitKey(username);
  const now = Date.now();
  const a = attempts.get(key);

  if (!a || now - a.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  const count = a.count + 1;
  if (count >= MAX_ATTEMPTS) {
    attempts.set(key, { count, firstAttemptAt: a.firstAttemptAt, lockedUntil: now + LOCKOUT_MS });
  } else {
    attempts.set(key, { count, firstAttemptAt: a.firstAttemptAt });
  }
}

function clearAttempts(username: string): void {
  attempts.delete(rateLimitKey(username));
}

export async function loginAction(
  username: string,
  password: string
): Promise<{ error: string } | void> {
  const u = (username || "").trim();
  if (!u || !password) return { error: "Username dan kata sandi wajib diisi." };

  const limit = checkRateLimit(u);
  if (limit.blocked) {
    const menit = Math.max(1, Math.ceil((limit.retryAfterSec ?? 0) / 60));
    return { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${menit} menit.` };
  }

  // 1) coba sebagai staff (Kesiswaan/BKA)
  const staff = await prisma.staff.findUnique({ where: { username: u } });
  if (staff && (await bcrypt.compare(password, staff.password))) {
    clearAttempts(u);
    await createSession({ sub: staff.id, kind: "staff", role: staff.role, ekskulExtra: staff.ekskulExtra, name: staff.nama });
    const isGuru = staff.role === "GURU" || staff.role === "GURU_BK";
    redirect(isGuru ? "/presensi" : "/dashboard");
  }

  // 2) coba sebagai orang tua — username ortu-{nisn}, password terpisah dari siswa
  if (u.startsWith("ortu-")) {
    const nisn = u.slice(5);
    const siswa = await prisma.siswa.findUnique({ where: { nisn } });
    if (siswa && (await bcrypt.compare(password, siswa.passwordOrtu))) {
      clearAttempts(u);
      await createSession({ sub: siswa.id, kind: "ortu", name: siswa.nama });
      redirect("/ortu");
    }
  }

  // 3) coba sebagai siswa — cari by NISN dulu, fallback ke username/NIS
  const siswa =
    (await prisma.siswa.findUnique({ where: { nisn: u } })) ??
    (await prisma.siswa.findUnique({ where: { username: u } }));
  if (siswa && (await bcrypt.compare(password, siswa.password))) {
    clearAttempts(u);
    await createSession({ sub: siswa.id, kind: "siswa", name: siswa.nama });
    redirect("/ortu");
  }

  recordFailure(u);
  return { error: "NISN/username atau kata sandi salah. Coba lagi." };
}
