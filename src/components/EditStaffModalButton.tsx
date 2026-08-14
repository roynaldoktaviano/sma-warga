"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStaffAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPen } from "./icons";

type StaffRole = "KESISWAAN" | "KEPSEK" | "GURU" | "GURU_BK" | "GURU_EKSKUL";

type Staff = { id: string; nama: string; username: string; role: StaffRole; ekskulExtra?: boolean };

export function EditStaffModalButton({ staff }: { staff: Staff }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: staff.nama, username: staff.username, role: staff.role, password: "" });
  const [isGuruEkstra, setIsGuruEkstra] = useState(!!staff.ekskulExtra);
  const [pending, start] = useTransition();
  const router = useRouter();

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function openModal() {
    setForm({ nama: staff.nama, username: staff.username, role: staff.role, password: "" });
    setIsGuruEkstra(!!staff.ekskulExtra);
    setOpen(true);
  }

  function submit() {
    start(async () => {
      const res = await updateStaffAction({
        id: staff.id,
        nama: form.nama,
        username: form.username,
        role: form.role,
        ekskulExtra: isGuruEkstra,
        password: form.password || undefined,
      });
      if (res.ok) {
        toast("Akun berhasil diperbarui.");
        setOpen(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn-icon-edit" title="Edit akun" onClick={openModal}>
        <IconPen />
      </button>

      {open && (
        <ModalShell
          title="Edit Akun Petugas"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan Perubahan"}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={form.nama}
              onChange={e => set("nama", e.target.value)}
            />
          </div>
          <div className="two">
            <div className="field">
              <label>Username Login</label>
              <input
                type="text"
                value={form.username}
                onChange={e => set("username", e.target.value.toLowerCase())}
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value as StaffRole)}>
                <option value="KESISWAAN">Waka Kesiswaan</option>
                <option value="KEPSEK">Kepala Sekolah</option>
                <option value="GURU">Guru</option>
                <option value="GURU_BK">Guru BK</option>
                <option value="GURU_EKSKUL">Guru Ekskul (khusus, tanpa akses lain)</option>
              </select>
            </div>
          </div>

          {form.role !== "GURU_EKSKUL" && (
            <label style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 8, border: `1.5px solid ${isGuruEkstra ? "var(--accent)" : "var(--line)"}`,
              background: isGuruEkstra ? "var(--accent-soft)" : "var(--surface-2)",
              cursor: "pointer", margin: "4px 0 16px", userSelect: "none",
            }}>
              <input
                type="checkbox"
                checked={isGuruEkstra}
                onChange={e => setIsGuruEkstra(e.target.checked)}
                style={{ accentColor: "var(--accent)", width: 16, height: 16 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Guru Ekstra</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                  Tambahan akses presensi ekskul, akses sesuai role di atas tetap ada
                </div>
              </div>
            </label>
          )}
          <div className="field">
            <label>Password Baru (opsional)</label>
            <input
              type="text"
              placeholder="Kosongkan jika tidak diganti"
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
