"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { destroySession, requireStaff, canInput, canVerify, canManage } from "@/lib/auth";

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
  if (!canInput(session.role))
    return { ok: false, error: "Hanya Kesiswaan, Kepsek, atau Guru yang bisa mencatat kejadian." };

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
  revalidatePath("/catatan");
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
  const password = input.password?.trim() || nis;
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
  const session = await requireStaff();
  if (!canVerify(session.role)) throw new Error("Hanya Waka Kesiswaan atau Kepsek yang bisa mengimpor siswa.");
  if (rows.length > 500) throw new Error("Maksimal 500 baris per sekali import.");

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
  const session = await requireStaff();
  if (session.role !== "KESISWAAN" && session.role !== "KEPSEK")
    return { ok: false, error: "Hanya Kesiswaan atau Kepsek yang bisa menghapus siswa." };
  const siswa = await prisma.siswa.findUnique({ where: { id } });
  if (!siswa) return { ok: false, error: "Siswa tidak ditemukan." };
  await prisma.siswa.delete({ where: { id } });
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------- Hapus catatan ----------
export async function deleteRecordAction(recordId: string): Promise<ActionResult> {
  const session = await requireStaff();
  const rec = await prisma.catatan.findUnique({ where: { id: recordId } });
  if (!rec) return { ok: false, error: "Catatan tidak ditemukan." };

  if (rec.pencatatId !== session.sub && !canVerify(session.role))
    return { ok: false, error: "Hanya pencatat atau verifikator yang bisa menghapus catatan ini." };

  await prisma.catatan.delete({ where: { id: recordId } });

  revalidatePath("/dashboard");
  revalidatePath(`/siswa/${rec.siswaId}`);
  revalidatePath("/catatan");
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

// ---------- Presensi per kelas (bulk) ----------
export async function addPresensiKelasAction(
  tanggal: string,
  entries: { siswaId: string; status: "HADIR" | "IZIN" | "SAKIT" | "ALPA" }[]
): Promise<ActionResult> {
  const session = await requireStaff();
  if (!tanggal) return { ok: false, error: "Tanggal wajib diisi." };
  const tgl = new Date(tanggal + "T00:00:00Z");

  for (const en of entries) {
    if (en.status === "HADIR") {
      // HADIR = hapus record (siswa dianggap hadir jika tidak ada record)
      await prisma.presensi.deleteMany({
        where: { siswaId: en.siswaId, tanggal: tgl },
      });
    } else {
      await prisma.presensi.upsert({
        where: { siswaId_tanggal: { siswaId: en.siswaId, tanggal: tgl } },
        create: {
          siswaId: en.siswaId, tanggal: tgl, status: en.status as "IZIN" | "SAKIT" | "ALPA",
          pencatatId: session.sub, pencatatNama: session.name,
        },
        update: {
          status: en.status as "IZIN" | "SAKIT" | "ALPA",
          pencatatId: session.sub, pencatatNama: session.name,
        },
      });
    }
  }

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

// ---------- Preview & proses kenaikan kelas ----------
export type KenaikanPreview = {
  lulus:  { id: string; nama: string; kelas: string }[];
  naik:   { id: string; nama: string; dari: string; ke: string }[];
  skip:   { id: string; nama: string; kelas: string }[];
};

function nextKelas(kelas: string): { action: "lulus" | "naik" | "skip"; ke?: string } {
  const m = kelas.trim().match(/^(\d+)(.*)/);
  if (!m) return { action: "skip" };
  const angka = parseInt(m[1]);
  const suffix = m[2];
  if (angka >= 9) return { action: "lulus" };
  return { action: "naik", ke: String(angka + 1) + suffix };
}

export async function getKenaikanPreviewAction(): Promise<KenaikanPreview> {
  await requireStaff();
  const siswa = await prisma.siswa.findMany({
    where: { status: "AKTIF" },
    select: { id: true, nama: true, kelas: true },
    orderBy: [{ kelas: "asc" }, { nama: "asc" }],
  });

  const lulus: KenaikanPreview["lulus"] = [];
  const naik:  KenaikanPreview["naik"]  = [];
  const skip:  KenaikanPreview["skip"]  = [];

  for (const s of siswa) {
    const res = nextKelas(s.kelas);
    if (res.action === "lulus") lulus.push({ id: s.id, nama: s.nama, kelas: s.kelas });
    else if (res.action === "naik") naik.push({ id: s.id, nama: s.nama, dari: s.kelas, ke: res.ke! });
    else skip.push({ id: s.id, nama: s.nama, kelas: s.kelas });
  }

  return { lulus, naik, skip };
}

export async function prosesKenaikanKelasAction(): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canVerify(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan atau Kepsek yang bisa memproses kenaikan kelas." };
  const siswa = await prisma.siswa.findMany({
    where: { status: "AKTIF" },
    select: { id: true, kelas: true },
  });

  const updates: Promise<unknown>[] = [];
  for (const s of siswa) {
    const res = nextKelas(s.kelas);
    if (res.action === "lulus") {
      updates.push(prisma.siswa.update({ where: { id: s.id }, data: { status: "LULUS" } }));
    } else if (res.action === "naik") {
      updates.push(prisma.siswa.update({ where: { id: s.id }, data: { kelas: res.ke! } }));
    }
  }

  await Promise.all(updates);
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------- Update status siswa (pindah, dll) ----------
export async function updateSiswaStatusAction(id: string, status: "AKTIF" | "LULUS" | "PINDAH"): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canVerify(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan atau Kepsek yang bisa mengubah status siswa." };
  const siswa = await prisma.siswa.findUnique({ where: { id } });
  if (!siswa) return { ok: false, error: "Siswa tidak ditemukan." };
  await prisma.siswa.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath(`/siswa/${id}`);
  return { ok: true };
}

// ---------- Verifikasi catatan tatib ----------
export async function verifikasiCatatanAction(
  catatanId: string,
  aksi: "verifikasi" | "tolak"
): Promise<ActionResult> {
  const session = await requireStaff();
  const role = session.role;
  if (role !== "KESISWAAN" && role !== "KEPSEK")
    return { ok: false, error: "Hanya Waka Kesiswaan atau Kepsek yang bisa verifikasi." };

  const catatan = await prisma.catatan.findUnique({ where: { id: catatanId } });
  if (!catatan) return { ok: false, error: "Catatan tidak ditemukan." };
  if (catatan.statusVerif === "VERIFIED")
    return { ok: false, error: "Catatan sudah terverifikasi." };

  if (aksi === "tolak") {
    await prisma.catatan.update({ where: { id: catatanId }, data: { statusVerif: "REJECTED" } });
    revalidatePath("/dashboard");
    revalidatePath(`/siswa/${catatan.siswaId}`);
    return { ok: true };
  }

  // Verifikasi — tandai sesuai role
  const now = new Date();
  const data: Record<string, unknown> = {};
  if (role === "KESISWAAN") {
    data.verifikasiWaka     = now;
    data.verifikasiWakaId   = session.sub;
    data.verifikasiWakaNama = session.name;
  } else {
    data.verifikasiKepsek     = now;
    data.verifikasiKepsekId   = session.sub;
    data.verifikasiKepsekNama = session.name;
  }

  // Cek apakah setelah update ini kedua pihak sudah verifikasi
  const updated = await prisma.catatan.update({ where: { id: catatanId }, data });
  const wakaOk   = !!(role === "KESISWAAN" ? now : updated.verifikasiWaka);
  const kepsekOk = !!(role === "KEPSEK"    ? now : updated.verifikasiKepsek);
  if (wakaOk && kepsekOk) {
    await prisma.catatan.update({ where: { id: catatanId }, data: { statusVerif: "VERIFIED" } });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/siswa/${catatan.siswaId}`);
  return { ok: true };
}

// ---------- Reset password semua siswa ke NIS ----------
export async function resetPasswordSiswaAction(): Promise<ActionResult & { count?: number }> {
  const session = await requireStaff();
  if (!canVerify(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan atau Kepsek yang bisa mereset password siswa." };
  const semua = await prisma.siswa.findMany({ select: { id: true, nis: true } });
  await Promise.all(
    semua.map(async (s) => {
      const hash = await bcrypt.hash(s.nis, 10);
      return prisma.siswa.update({ where: { id: s.id }, data: { password: hash } });
    })
  );
  return { ok: true, count: semua.length };
}

// ---------- Tambah akun staff ----------
export async function addStaffAction(input: {
  nama: string;
  username: string;
  password: string;
  role: "KESISWAAN" | "KEPSEK" | "GURU" | "GURU_BK" | "GURU_EKSKUL";
}): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canVerify(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan atau Kepsek yang bisa menambah akun staff." };

  const nama     = input.nama?.trim();
  const username = input.username?.trim().toLowerCase();
  const password = input.password?.trim();

  if (!nama || !username || !password) return { ok: false, error: "Semua field wajib diisi." };
  if (password.length < 6) return { ok: false, error: "Password minimal 6 karakter." };

  const existing = await prisma.staff.findUnique({ where: { username } });
  if (existing) return { ok: false, error: "Username sudah dipakai." };

  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah belum ada." };

  const hash = await bcrypt.hash(password, 10);
  await prisma.staff.create({
    data: { nama, username, password: hash, role: input.role, sekolahId: sekolah.id },
  });

  revalidatePath("/pengaturan");
  return { ok: true };
}

// ---------- Hapus akun staff ----------
export async function deleteStaffAction(targetId: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canVerify(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan atau Kepsek yang bisa menghapus akun staff." };
  if (targetId === session.sub) return { ok: false, error: "Tidak bisa menghapus akun sendiri." };

  const staff = await prisma.staff.findUnique({ where: { id: targetId } });
  if (!staff) return { ok: false, error: "Akun tidak ditemukan." };

  await prisma.staff.delete({ where: { id: targetId } });
  revalidatePath("/pengaturan");
  return { ok: true };
}

// ---------- Update akun staff ----------
export async function updateAccountAction(input: {
  nama?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<ActionResult> {
  const session = await requireStaff();

  const staff = await prisma.staff.findUnique({ where: { id: session.sub } });
  if (!staff) return { ok: false, error: "Akun tidak ditemukan." };

  // Kalau ganti password, verifikasi dulu
  if (input.newPassword) {
    if (!input.currentPassword) return { ok: false, error: "Masukkan kata sandi saat ini." };
    const match = await bcrypt.compare(input.currentPassword, staff.password);
    if (!match) return { ok: false, error: "Kata sandi saat ini salah." };
    if (input.newPassword.length < 6) return { ok: false, error: "Kata sandi baru minimal 6 karakter." };
  }

  // Kalau ganti username, cek duplikat
  if (input.username && input.username !== staff.username) {
    const existing = await prisma.staff.findUnique({ where: { username: input.username } });
    if (existing) return { ok: false, error: "Username sudah dipakai." };
  }

  const data: Record<string, string> = {};
  if (input.nama?.trim())     data.nama     = input.nama.trim();
  if (input.username?.trim()) data.username  = input.username.trim();
  if (input.newPassword)      data.password  = await bcrypt.hash(input.newPassword, 10);

  if (Object.keys(data).length === 0) return { ok: false, error: "Tidak ada perubahan." };

  await prisma.staff.update({ where: { id: staff.id }, data });

  // Refresh session kalau nama berubah
  if (data.nama) {
    const { createSession } = await import("@/lib/auth");
    await createSession({ sub: session.sub, kind: "staff", role: session.role, name: data.nama });
  }

  return { ok: true };
}

// ---------- TahunAjaran ----------
export async function addTahunAjaranAction(nama: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (!nama?.trim()) return { ok: false, error: "Nama tahun ajaran wajib diisi." };

  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah tidak ditemukan." };

  await prisma.tahunAjaran.create({ data: { nama: nama.trim(), sekolahId: sekolah.id } });
  revalidatePath("/ekskul");
  return { ok: true };
}

export async function updateTahunAjaranStatusAction(
  id: string,
  status: "PERSIAPAN" | "BERJALAN" | "SELESAI"
): Promise<ActionResult> {
  await requireStaff();
  await prisma.tahunAjaran.update({ where: { id }, data: { status } });
  revalidatePath("/ekskul");
  return { ok: true };
}

export async function deleteTahunAjaranAction(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.tahunAjaran.delete({ where: { id } });
  revalidatePath("/ekskul");
  return { ok: true };
}

// ---------- Ekskul ----------
export async function addEkskulAction(input: {
  nama: string;
  deskripsi?: string;
  tahunAjaranId: string;
  guruIds?: string[];
}): Promise<ActionResult> {
  await requireStaff();
  if (!input.nama?.trim()) return { ok: false, error: "Nama ekskul wajib diisi." };
  const ta = await prisma.tahunAjaran.findUnique({ where: { id: input.tahunAjaranId } });
  if (!ta) return { ok: false, error: "Tahun ajaran tidak ditemukan." };
  if (ta.status !== "PERSIAPAN") return { ok: false, error: "Ekskul hanya bisa ditambah saat status PERSIAPAN." };
  const ekskul = await prisma.ekskul.create({
    data: {
      nama: input.nama.trim(),
      deskripsi: input.deskripsi?.trim() || null,
      tahunAjaranId: input.tahunAjaranId,
    },
  });
  if (input.guruIds?.length) {
    await prisma.ekskulGuru.createMany({
      data: input.guruIds.map(staffId => ({ ekskulId: ekskul.id, staffId })),
      skipDuplicates: true,
    });
  }
  revalidatePath("/ekskul");
  return { ok: true };
}

export async function deleteEkskulAction(id: string): Promise<ActionResult> {
  await requireStaff();
  const e = await prisma.ekskul.findUnique({ where: { id }, include: { tahunAjaran: true } });
  if (!e) return { ok: false, error: "Ekskul tidak ditemukan." };
  if (e.tahunAjaran.status !== "PERSIAPAN") return { ok: false, error: "Ekskul tidak bisa dihapus setelah tahun ajaran dimulai." };
  await prisma.ekskul.delete({ where: { id } });
  revalidatePath("/ekskul");
  return { ok: true };
}

// ---------- Ekskul Guru ----------
export async function addEkskulGuruAction(ekskulId: string, staffId: string): Promise<ActionResult> {
  await requireStaff();
  const e = await prisma.ekskul.findUnique({ where: { id: ekskulId }, include: { tahunAjaran: true } });
  if (!e) return { ok: false, error: "Ekskul tidak ditemukan." };
  if (e.tahunAjaran.status === "SELESAI") return { ok: false, error: "Tahun ajaran sudah selesai." };
  const exists = await prisma.ekskulGuru.findUnique({ where: { ekskulId_staffId: { ekskulId, staffId } } });
  if (exists) return { ok: false, error: "Guru sudah terdaftar di ekskul ini." };
  await prisma.ekskulGuru.create({ data: { ekskulId, staffId } });
  revalidatePath(`/ekskul/${ekskulId}`);
  return { ok: true };
}

export async function removeEkskulGuruAction(ekskulId: string, staffId: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.ekskulGuru.delete({ where: { ekskulId_staffId: { ekskulId, staffId } } });
  revalidatePath(`/ekskul/${ekskulId}`);
  return { ok: true };
}

// ---------- Ekskul Anggota ----------
export async function addEkskulAnggotaAction(ekskulId: string, siswaIds: string[]): Promise<ActionResult> {
  await requireStaff();
  const e = await prisma.ekskul.findUnique({ where: { id: ekskulId }, include: { tahunAjaran: true } });
  if (!e) return { ok: false, error: "Ekskul tidak ditemukan." };
  if (e.tahunAjaran.status === "SELESAI") return { ok: false, error: "Tahun ajaran sudah selesai." };

  await prisma.ekskulAnggota.createMany({
    data: siswaIds.map((siswaId) => ({ ekskulId, siswaId })),
    skipDuplicates: true,
  });
  revalidatePath(`/ekskul/${ekskulId}`);
  return { ok: true };
}

export async function removeEkskulAnggotaAction(ekskulId: string, siswaId: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.ekskulAnggota.delete({ where: { ekskulId_siswaId: { ekskulId, siswaId } } });
  revalidatePath(`/ekskul/${ekskulId}`);
  return { ok: true };
}

// ---------- Presensi Ekskul ----------
export async function addPresensiEkskulAction(
  ekskulId: string,
  tanggal: string,
  entries: { siswaId: string; status: "HADIR" | "IZIN" | "SAKIT" | "ALPA" }[]
): Promise<ActionResult> {
  const session = await requireStaff();
  const e = await prisma.ekskul.findUnique({ where: { id: ekskulId }, include: { tahunAjaran: true } });
  if (!e) return { ok: false, error: "Ekskul tidak ditemukan." };
  if (e.tahunAjaran.status !== "BERJALAN") return { ok: false, error: "Presensi hanya bisa diinput saat tahun ajaran BERJALAN." };

  const tgl = new Date(tanggal + "T00:00:00Z");
  await prisma.presensiEkskul.createMany({
    data: entries.map((en) => ({
      ekskulId,
      siswaId: en.siswaId,
      tanggal: tgl,
      status: en.status,
      pencatatId: session.sub,
      pencatatNama: session.name,
    })),
    skipDuplicates: true,
  });
  revalidatePath(`/ekskul/${ekskulId}`);
  return { ok: true };
}

export async function deletePresensiEkskulAction(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.presensiEkskul.delete({ where: { id } });
  revalidatePath("/ekskul");
  return { ok: true };
}

// ---------- Kategori Pelanggaran ----------
export async function addKategoriPelanggaranAction(input: {
  nama: string; tingkatan: string; poin: number;
}): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canManage(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan yang bisa mengelola kategori pelanggaran." };
  if (!input.nama?.trim()) return { ok: false, error: "Nama wajib diisi." };
  if (input.poin <= 0) return { ok: false, error: "Poin harus lebih dari 0." };
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah tidak ditemukan." };
  await prisma.kategoriPelanggaran.create({
    data: { nama: input.nama.trim(), tingkatan: input.tingkatan, poin: Math.abs(Math.round(input.poin)), sekolahId: sekolah.id },
  });
  revalidatePath("/pelanggaran");
  return { ok: true };
}

export async function deleteKategoriPelanggaranAction(id: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canManage(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan yang bisa mengelola kategori pelanggaran." };
  await prisma.kategoriPelanggaran.delete({ where: { id } });
  revalidatePath("/pelanggaran");
  return { ok: true };
}

// ---------- Kategori Prestasi ----------
export async function addKategoriPrestasiAction(input: {
  nama: string; tingkatan: string; poin: number;
}): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canManage(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan yang bisa mengelola kategori prestasi." };
  if (!input.nama?.trim()) return { ok: false, error: "Nama wajib diisi." };
  if (input.poin <= 0) return { ok: false, error: "Poin harus lebih dari 0." };
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah tidak ditemukan." };
  await prisma.kategoriPrestasi.create({
    data: { nama: input.nama.trim(), tingkatan: input.tingkatan, poin: Math.round(input.poin), sekolahId: sekolah.id },
  });
  revalidatePath("/kategori-prestasi");
  return { ok: true };
}

export async function deleteKategoriPrestasiAction(id: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canManage(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan yang bisa mengelola kategori prestasi." };
  await prisma.kategoriPrestasi.delete({ where: { id } });
  revalidatePath("/kategori-prestasi");
  return { ok: true };
}

// ---------- Import bulk kategori ----------
type KatRow = { nama: string; tingkatan: string; poin: number };
export type ImportKategoriResult = { ok: true; inserted: number; skipped: number } | { ok: false; error: string };

export async function importKategoriPelanggaranAction(rows: KatRow[]): Promise<ImportKategoriResult> {
  const session = await requireStaff();
  if (!canManage(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan yang bisa mengimpor kategori pelanggaran." };
  if (rows.length > 200) return { ok: false, error: "Maksimal 200 baris per import." };
  const VALID_TINGKAT = ["RINGAN", "SEDANG", "BERAT"];
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah tidak ditemukan." };
  let inserted = 0, skipped = 0;
  for (const r of rows) {
    const nama = r.nama?.trim();
    const tingkatan = r.tingkatan?.trim().toUpperCase();
    const poin = Math.abs(Math.round(Number(r.poin)));
    if (!nama || !VALID_TINGKAT.includes(tingkatan) || poin <= 0) { skipped++; continue; }
    const exists = await prisma.kategoriPelanggaran.findFirst({ where: { sekolahId: sekolah.id, nama } });
    if (exists) { skipped++; continue; }
    await prisma.kategoriPelanggaran.create({ data: { nama, tingkatan, poin, sekolahId: sekolah.id } });
    inserted++;
  }
  revalidatePath("/pelanggaran");
  return { ok: true, inserted, skipped };
}

export async function importKategoriPrestasiAction(rows: KatRow[]): Promise<ImportKategoriResult> {
  const session = await requireStaff();
  if (!canManage(session.role))
    return { ok: false, error: "Hanya Waka Kesiswaan yang bisa mengimpor kategori prestasi." };
  if (rows.length > 200) return { ok: false, error: "Maksimal 200 baris per import." };
  const VALID_TINGKAT = ["SEKOLAH", "KECAMATAN", "KOTA", "PROVINSI", "NASIONAL", "INTERNASIONAL"];
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) return { ok: false, error: "Data sekolah tidak ditemukan." };
  let inserted = 0, skipped = 0;
  for (const r of rows) {
    const nama = r.nama?.trim();
    const tingkatan = r.tingkatan?.trim().toUpperCase();
    const poin = Math.abs(Math.round(Number(r.poin)));
    if (!nama || !VALID_TINGKAT.includes(tingkatan) || poin <= 0) { skipped++; continue; }
    const exists = await prisma.kategoriPrestasi.findFirst({ where: { sekolahId: sekolah.id, nama } });
    if (exists) { skipped++; continue; }
    await prisma.kategoriPrestasi.create({ data: { nama, tingkatan, poin, sekolahId: sekolah.id } });
    inserted++;
  }
  revalidatePath("/kategori-prestasi");
  return { ok: true, inserted, skipped };
}

// ---------- Logout ----------
export async function logoutAction(): Promise<void> {
  destroySession();
  redirect("/login");
}
