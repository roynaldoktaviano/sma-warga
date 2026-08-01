import { requireStaff, canVerify } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/AccountForm";
import { ResetPasswordSiswaButton } from "@/components/ResetPasswordSiswaButton";
import { ResetPasswordOrtuButton } from "@/components/ResetPasswordOrtuButton";
import { IzinGantiPasswordToggle } from "@/components/IzinGantiPasswordToggle";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const session = await requireStaff();
  const isAdmin = canVerify(session.role);

  const staff = await prisma.staff.findUnique({
    where: { id: session.sub },
    select: { id: true, nama: true, username: true, role: true },
  });

  if (!staff) return null;

  const sekolah = isAdmin ? await prisma.sekolah.findFirst({ select: { izinGantiPasswordSiswa: true } }) : null;

  const initials = staff.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-left">
          <div className="eyebrow">Sistem</div>
          <h1 className="page-title">Pengaturan Akun</h1>
        </div>
      </div>

      {/* Akun saya */}
      <div className="settings-grid">
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <div className="settings-avatar">{initials}</div>
          <div className="settings-name">{staff.nama}</div>
          <div className="settings-meta">@{staff.username}</div>
          <div className="settings-meta">{ROLE_LABEL[staff.role] ?? staff.role}</div>
        </div>
        <AccountForm staff={{ nama: staff.nama, username: staff.username }} />
      </div>

      {/* Khusus Waka Kesiswaan / Kepsek */}
      {isAdmin && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card card-pad">
            <div className="settings-section-title">Reset Password Siswa</div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
              Reset password semua siswa menjadi <b>NIS</b> masing-masing. Gunakan ini setelah import data baru atau jika siswa lupa password.
              Login siswa menggunakan <b>NISN</b> sebagai username dan <b>NIS</b> sebagai kata sandi default.
            </p>
            <ResetPasswordSiswaButton />
          </div>

          <div className="card card-pad">
            <div className="settings-section-title">Reset Password Orang Tua</div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
              Password akun orang tua (<code>ortu-NISN</code>) kini <b>terpisah</b> dari password siswa. Defaultnya juga <b>NIS</b> anak,
              tapi bisa diubah sendiri oleh orang tua kalau fitur di bawah diaktifkan. Gunakan tombol ini kalau orang tua lupa password.
            </p>
            <ResetPasswordOrtuButton />
          </div>

          <div className="card card-pad">
            <div className="settings-section-title">Ganti Password — Siswa &amp; Orang Tua</div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
              Kalau diaktifkan, siswa dan orang tua bisa mengubah kata sandi akun mereka <b>masing-masing</b> lewat halaman pantauan.
              Kalau nonaktif, kata sandi mereka hanya bisa direset oleh Waka Kesiswaan / Kepsek di sini.
            </p>
            <IzinGantiPasswordToggle enabled={sekolah?.izinGantiPasswordSiswa ?? false} />
          </div>
        </div>
      )}
    </div>
  );
}
