"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { destroySession, requireStaff } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

// ---------- Catat kejadian (pelanggaran / prestasi) ----------
export async function addRecordAction(input: {
  siswaId: string;
  jenis: "PELANGGARAN" | "PRESTASI";
  kategori: string;
  poin: number;
  keterangan?: string;
  tanggal: string;
}): Promise<ActionResult> {
  const session = await requireStaff();

  const mag = Math.abs(Math.round(input.poin || 0));
  if (mag <= 0) return { ok: false, error: "Isi jumlah poin lebih dari 0." };
  if (!input.kategori?.trim()) return { ok: false, error: "Kategori wajib diisi." };

  const siswa = await prisma.siswa.findUnique({ where: { id: input.siswaId } });
  if (!siswa) return { ok: false, error: "Siswa tidak ditemukan." };

  await prisma.catatan.create({
    data: {
      siswaId: siswa.id,
      jenis: input.jenis,
      kategori: input.kategori.trim(),
      poin: input.jenis === "PELANGGARAN" ? -mag : mag,
      keterangan: input.keterangan?.trim() || null,
      tanggal: new Date((input.tanggal || new Date().toISOString().slice(0, 10)) + "T00:00:00Z"),
      pencatatId: session.sub,
      pencatatNama: session.name,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/siswa/${siswa.id}`);
  revalidatePath("/ortu");
  return { ok: true };
}

// ---------- Tambah siswa ----------
export async function addStudentAction(input: {
  nama: string;
  kelas: string;
  nis: string;
  nisn?: string;
  jenisKelamin?: string;
  agama?: string;
  asalSD?: string;
  statusDL?: string;
  poinAwal?: number;
  username?: string;
  password?: string;
}): Promise<ActionResult> {
  await requireStaff();

  const nama = input.nama?.trim();
  const kelas = input.kelas?.trim();
  const nis = input.nis?.trim();
  if (!nama || !kelas || !nis) return { ok: false, error: "Nama, kelas, dan NIS wajib diisi." };

  const username = (input.username?.trim() || nis).toLowerCase();
  const password = input.password?.trim() || "siswa123";
  const poinAwal = Number.isFinite(input.poinAwal) ? Math.round(input.poinAwal as number) : 100;
  const nisn = input.nisn?.trim() || null;

  if (await prisma.siswa.findUnique({ where: { nis } }))
    return { ok: false, error: "NIS sudah dipakai siswa lain." };

  if (nisn && await prisma.siswa.findUnique({ where: { nisn } }))
    return { ok: false, error: "NISN sudah dipakai siswa lain." };

  if (await prisma.siswa.findUnique({ where: { username } }))
    return { ok: false, error: "Username sudah dipakai siswa lain." };

  if (await prisma.staff.findUnique({ where: { username } }))
    return { ok: false, error: "Username sudah dipakai petugas." };

  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah belum ada. Jalankan seed terlebih dahulu." };

  const hash = await bcrypt.hash(password, 10);
  await prisma.siswa.create({
    data: {
      nama, kelas, nis, nisn, username, password: hash, poinAwal,
      jenisKelamin: input.jenisKelamin || "L",
      agama: input.agama?.trim() || "",
      asalSD: input.asalSD?.trim() || null,
      statusDL: input.statusDL?.trim() || null,
      sekolahId: sekolah.id,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------- Import siswa dari CSV ----------
export type ImportRow = {
  nama: string;
  kelas: string;
  nis: string;
  nisn?: string;
  jenisKelamin?: string;
  agama?: string;
  asalSD?: string;
  statusDL?: string;
  poinAwal?: number;
  username?: string;
  password?: string;
};

export type ImportResult = {
  ok: boolean;
  row: number;
  nis: string;
  nama: string;
  error?: string;
};

export async function importStudentsAction(rows: ImportRow[]): Promise<ImportResult[]> {
  await requireStaff();

  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) throw new Error("Data sekolah belum ada. Jalankan seed terlebih dahulu.");

  const results: ImportResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const nama = r.nama?.trim();
    const kelas = r.kelas?.trim();
    const nis = r.nis?.trim();

    if (!nama || !kelas || !nis) {
      results.push({ ok: false, row: i + 1, nis: nis || "-", nama: nama || "-", error: "Nama, kelas, dan NIS wajib diisi." });
      continue;
    }

    const username = (r.username?.trim() || nis).toLowerCase();
    const password = r.password?.trim() || "siswa123";
    const poinAwal = Number.isFinite(r.poinAwal) ? Math.round(r.poinAwal as number) : 100;

    if (await prisma.siswa.findUnique({ where: { nis } })) {
      results.push({ ok: false, row: i + 1, nis, nama, error: "NIS sudah terdaftar." });
      continue;
    }

    if (await prisma.siswa.findUnique({ where: { username } }) || await prisma.staff.findUnique({ where: { username } })) {
      results.push({ ok: false, row: i + 1, nis, nama, error: `Username "${username}" sudah dipakai.` });
      continue;
    }

    const nisnVal = r.nisn?.trim() || null;
    if (nisnVal && await prisma.siswa.findUnique({ where: { nisn: nisnVal } })) {
      results.push({ ok: false, row: i + 1, nis, nama, error: "NISN sudah terdaftar." });
      continue;
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.siswa.create({
      data: {
        nama, kelas, nis, nisn: nisnVal, username, password: hash, poinAwal,
        jenisKelamin: r.jenisKelamin || "L",
        agama: r.agama?.trim() || "",
        asalSD: r.asalSD?.trim() || null,
        statusDL: r.statusDL?.trim() || null,
        sekolahId: sekolah.id,
      },
    });
    results.push({ ok: true, row: i + 1, nis, nama });
  }

  revalidatePath("/dashboard");
  return results;
}

// ---------- Hapus siswa ----------
export async function deleteStudentAction(id: string): Promise<ActionResult> {
  await requireStaff();
  const siswa = await prisma.siswa.findUnique({ where: { id } });
  if (!siswa) return { ok: false, error: "Siswa tidak ditemukan." };
  await prisma.siswa.delete({ where: { id } });
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------- Hapus catatan ----------
export async function deleteRecordAction(recordId: string): Promise<ActionResult> {
  await requireStaff();
  const rec = await prisma.catatan.findUnique({ where: { id: recordId } });
  if (!rec) return { ok: false, error: "Catatan tidak ditemukan." };

  await prisma.catatan.delete({ where: { id: recordId } });

  revalidatePath("/dashboard");
  revalidatePath(`/siswa/${rec.siswaId}`);
  revalidatePath("/ortu");
  return { ok: true };
}

// ---------- Tambah presensi ----------
export async function addPresensiAction(input: {
  siswaId: string;
  tanggal: string;
  status: "IZIN" | "SAKIT" | "ALPA";
  keterangan?: string;
}): Promise<ActionResult> {
  const session = await requireStaff();
  if (!input.siswaId || !input.tanggal) return { ok: false, error: "Data tidak lengkap." };

  const tanggal = new Date(input.tanggal + "T00:00:00Z");

  await prisma.presensi.upsert({
    where: { siswaId_tanggal: { siswaId: input.siswaId, tanggal } },
    create: {
      siswaId: input.siswaId, tanggal, status: input.status,
      keterangan: input.keterangan?.trim() || null,
      pencatatId: session.sub, pencatatNama: session.name,
    },
    update: {
      status: input.status,
      keterangan: input.keterangan?.trim() || null,
      pencatatId: session.sub, pencatatNama: session.name,
    },
  });

  revalidatePath("/presensi");
  return { ok: true };
}

// ---------- Hapus presensi ----------
export async function deletePresensiAction(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.presensi.delete({ where: { id } });
  revalidatePath("/presensi");
  return { ok: true };
}

// ---------- Tambah prestasi ----------
export async function addPrestasiAction(input: {
  siswaId: string;
  judul: string;
  kategori: string;
  tingkat: "SEKOLAH" | "KOTA" | "PROVINSI" | "NASIONAL" | "INTERNASIONAL";
  peringkat?: string;
  tanggal: string;
  keterangan?: string;
}): Promise<ActionResult> {
  const session = await requireStaff();
  if (!input.siswaId || !input.judul || !input.kategori) return { ok: false, error: "Data tidak lengkap." };

  await prisma.prestasi.create({
    data: {
      siswaId: input.siswaId,
      judul: input.judul.trim(),
      kategori: input.kategori.trim(),
      tingkat: input.tingkat,
      peringkat: input.peringkat?.trim() || null,
      tanggal: new Date((input.tanggal || new Date().toISOString().slice(0, 10)) + "T00:00:00Z"),
      keterangan: input.keterangan?.trim() || null,
      pencatatId: session.sub,
      pencatatNama: session.name,
    },
  });

  revalidatePath("/prestasi");
  return { ok: true };
}

// ---------- Hapus prestasi ----------
export async function deletePrestasiAction(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.prestasi.delete({ where: { id } });
  revalidatePath("/prestasi");
  return { ok: true };
}

// ---------- Logout ----------
export async function logoutAction(): Promise<void> {
  destroySession();
  redirect("/login");
}
