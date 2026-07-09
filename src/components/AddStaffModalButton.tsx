"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStaffAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

type StaffRole = "KESISWAAN" | "KEPSEK" | "GURU" | "GURU_BK" | "GURU_EKSKUL";
const empty = { nama: "", username: "", password: "", role: "GURU" as StaffRole };

export function AddStaffModalButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [isGuruEkstra, setIsGuruEkstra] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function set<K extends keyof typeof empty>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function toggleGuruEkstra(checked: boolean) {
    setIsGuruEkstra(checked);
    if (checked) setForm(f => ({ ...f, role: "GURU_EKSKUL" }));
    else setForm(f => ({ ...f, role: "GURU" }));
  }

  function submit() {
    start(async () => {
      const role = isGuruEkstra ? "GURU_EKSKUL" : form.role;
      const res = await addStaffAction({ ...form, role });
      if (res.ok) {
        toast("Akun berhasil ditambahkan.");
        setOpen(false);
        setForm({ ...empty });
        setIsGuruEkstra(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-accent" onClick={() => { setForm({ ...empty }); setIsGuruEkstra(false); setOpen(true); }}>
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
          {/* Guru Ekstra toggle */}
          <label style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            borderRadius: 8, border: `1.5px solid ${isGuruEkstra ? "var(--accent)" : "var(--line)"}`,
            background: isGuruEkstra ? "var(--accent-soft)" : "var(--surface-2)",
            cursor: "pointer", marginBottom: 16, userSelect: "none",
          }}>
            <input
              type="checkbox"
              checked={isGuruEkstra}
              onChange={e => toggleGuruEkstra(e.target.checked)}
              style={{ accentColor: "var(--accent)", width: 16, height: 16 }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Guru Ekstra</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                Hanya bisa melakukan presensi ekskul — tidak dapat mengakses fitur lain
              </div>
            </div>
          </label>

          <div className="field">
            <label>Nama Lengkap</label>
            <input
              type="text"
              placeholder={isGuruEkstra ? "mis. Pak Budi (Pramuka)" : "mis. Pak Budi (Kesiswaan)"}
              value={form.nama}
              onChange={e => set("nama", e.target.value)}
            />
          </div>
          <div className="two">
            <div className="field">
              <label>Username Login</label>
              <input
                type="text"
                placeholder="mis. budi"
                value={form.username}
                onChange={e => set("username", e.target.value.toLowerCase())}
                autoComplete="off"
              />
            </div>
            {isGuruEkstra ? (
              <div className="field">
                <label>Role</label>
                <div style={{
                  padding: "8px 12px", borderRadius: 8, background: "var(--accent-soft)",
                  color: "var(--accent)", fontSize: 13, fontWeight: 600, border: "1px solid var(--accent)",
                }}>
                  Guru Ekskul
                </div>
              </div>
            ) : (
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={e => set("role", e.target.value)}>
                  <option value="KESISWAAN">Waka Kesiswaan</option>
                  <option value="KEPSEK">Kepala Sekolah</option>
                  <option value="GURU">Guru</option>
                  <option value="GURU_BK">Guru BK</option>
                </select>
              </div>
            )}
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="text"
              placeholder="min. 6 karakter"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              autoComplete="off"
            />
          </div>
        </ModalShell>
      )}
    </>
  );
}
