"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function loginAction(
  username: string,
  password: string
): Promise<{ error: string } | void> {
  const u = (username || "").trim();
  if (!u || !password) return { error: "Username dan kata sandi wajib diisi." };

  // 1) coba sebagai staff (Kesiswaan/BKA)
  const staff = await prisma.staff.findUnique({ where: { username: u } });
  if (staff && (await bcrypt.compare(password, staff.password))) {
    await createSession({ sub: staff.id, kind: "staff", role: staff.role, name: staff.nama });
    redirect("/dashboard");
  }

  // 2) coba sebagai siswa
  const siswa = await prisma.siswa.findUnique({ where: { username: u } });
  if (siswa && (await bcrypt.compare(password, siswa.password))) {
    await createSession({ sub: siswa.id, kind: "siswa", name: siswa.nama });
    redirect("/ortu");
  }

  return { error: "Username atau kata sandi salah. Coba lagi." };
}
