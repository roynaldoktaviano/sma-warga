"use client";

import { useState, useTransition } from "react";
import { updateSiswaPasswordAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconLock } from "./icons";

export function GantiPasswordSiswaButton() {
  const [open, setOpen] = useState(false);
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [pending, start] = useTransition();

  function reset() {
    setCurPass(""); setNewPass(""); setConfPass("");
  }

  function submit() {
    if (newPass !== confPass) { toast("Konfirmasi kata sandi tidak cocok.", "bad"); return; }
    start(async () => {
      const res = await updateSiswaPasswordAction({ currentPassword: curPass, newPassword: newPass });
      if (res.ok) {
        toast("Kata sandi berhasil diubah.");
        reset();
        setOpen(false);
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button type="button" className="topbar-logout" title="Ganti Password" onClick={() => { reset(); setOpen(true); }}>
        <IconLock />
        <span>Ganti Password</span>
      </button>

      {open && (
        <ModalShell
          title="Ganti Password"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending || !curPass || !newPass}>
                {pending ? "Menyimpan…" : "Ubah Kata Sandi"}
              </button>
            </>
          }
        >
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
        </ModalShell>
      )}
    </>
  );
}
