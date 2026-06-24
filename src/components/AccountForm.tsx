"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAccountAction } from "@/app/actions";
import { toast } from "./Toaster";

type Props = { staff: { nama: string; username: string } };

export function AccountForm({ staff }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Profil
  const [nama, setNama]         = useState(staff.nama);
  const [username, setUsername] = useState(staff.username);

  // Password
  const [curPass, setCurPass]   = useState("");
  const [newPass, setNewPass]   = useState("");
  const [confPass, setConfPass] = useState("");

  function saveProfile() {
    start(async () => {
      const res = await updateAccountAction({ nama, username });
      if (res.ok) { toast("Profil diperbarui."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  function savePassword() {
    if (newPass !== confPass) { toast("Konfirmasi kata sandi tidak cocok.", "bad"); return; }
    start(async () => {
      const res = await updateAccountAction({ currentPassword: curPass, newPassword: newPass });
      if (res.ok) { toast("Kata sandi berhasil diubah."); setCurPass(""); setNewPass(""); setConfPass(""); }
      else toast(res.error, "bad");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Profil */}
      <div className="card card-pad">
        <div className="settings-section-title">Informasi Profil</div>
        <div className="field">
          <label>Nama Tampilan</label>
          <input type="text" value={nama} onChange={e => setNama(e.target.value)} />
        </div>
        <div className="field">
          <label>Username Login</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <button className="btn btn-accent" onClick={saveProfile} disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>

      {/* Password */}
      <div className="card card-pad">
        <div className="settings-section-title">Ubah Kata Sandi</div>
        <div className="field">
          <label>Kata Sandi Saat Ini</label>
          <input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="two">
          <div className="field">
            <label>Kata Sandi Baru</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} autoComplete="new-password" placeholder="min. 6 karakter" />
          </div>
          <div className="field">
            <label>Konfirmasi</label>
            <input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} autoComplete="new-password" placeholder="ulangi kata sandi baru" />
          </div>
        </div>
        <button className="btn btn-accent" onClick={savePassword} disabled={pending || !curPass || !newPass}>
          {pending ? "Menyimpan…" : "Ubah Kata Sandi"}
        </button>
      </div>

    </div>
  );
}
