"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStaffAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

const empty = { nama: "", username: "", password: "", role: "KESISWAAN" as "KESISWAAN" | "BKA" };

export function AddStaffModalButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [pending, start] = useTransition();
  const router = useRouter();

  function set<K extends keyof typeof empty>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function submit() {
    start(async () => {
      const res = await addStaffAction({ ...form, role: form.role as "KESISWAAN" | "BKA" });
      if (res.ok) {
        toast("Akun berhasil ditambahkan.");
        setOpen(false);
        setForm({ ...empty });
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-accent" onClick={() => { setForm({ ...empty }); setOpen(true); }}>
        <IconPlus />
        Tambah Akun
      </button>

      {open && (
        <ModalShell
          title="Tambah Akun Petugas"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
                {pending ? "Menyimpan…" : "Buat Akun"}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Nama Lengkap</label>
            <input type="text" placeholder="mis. Pak Budi (Kesiswaan)" value={form.nama} onChange={e => set("nama", e.target.value)} />
          </div>
          <div className="two">
            <div className="field">
              <label>Username Login</label>
              <input type="text" placeholder="mis. budi" value={form.username} onChange={e => set("username", e.target.value.toLowerCase())} autoComplete="off" />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="KESISWAAN">Kesiswaan</option>
                <option value="BKA">BKA</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="text" placeholder="min. 6 karakter" value={form.password} onChange={e => set("password", e.target.value)} autoComplete="off" />
          </div>
        </ModalShell>
      )}
    </>
  );
}
