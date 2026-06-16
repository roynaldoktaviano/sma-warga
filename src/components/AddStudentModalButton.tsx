"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POIN_AWAL } from "@/lib/points";
import { addStudentAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconUsers } from "./icons";

const empty = { nama: "", kelas: "", nis: "", poinAwal: String(POIN_AWAL), password: "siswa123" };

export function AddStudentModalButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const router = useRouter();
  const [pending, start] = useTransition();

  function set<K extends keyof typeof empty>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit() {
    if (!form.nama.trim() || !form.kelas.trim() || !form.nis.trim()) {
      toast("Nama, kelas, dan NIS wajib diisi.", "bad");
      return;
    }
    start(async () => {
      const res = await addStudentAction({
        nama: form.nama,
        kelas: form.kelas,
        nis: form.nis,
        poinAwal: parseInt(form.poinAwal, 10),
        password: form.password || undefined,
      });
      if (res.ok) {
        toast("Siswa baru ditambahkan.");
        setOpen(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn" onClick={() => { setForm({ ...empty }); setOpen(true); }}>
        <IconUsers />
        Tambah Siswa
      </button>

      {open && (
        <ModalShell
          title="Tambah Siswa"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
                {pending ? "Menyimpan…" : "Tambah Siswa"}
              </button>
            </>
          }
        >
          <div className="two">
            <div className="field">
              <label htmlFor="sNama">Nama lengkap</label>
              <input id="sNama" type="text" placeholder="mis. Rangga Putra" value={form.nama} onChange={(e) => set("nama", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sKelas">Kelas</label>
              <input id="sKelas" type="text" placeholder="mis. XI IPA 3" value={form.kelas} onChange={(e) => set("kelas", e.target.value)} />
            </div>
          </div>
          <div className="two">
            <div className="field">
              <label htmlFor="sNis">NIS / NISN</label>
              <input id="sNis" type="text" placeholder="mis. 24009" value={form.nis} onChange={(e) => set("nis", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sPoin">Poin awal</label>
              <input id="sPoin" type="number" min={0} value={form.poinAwal} onChange={(e) => set("poinAwal", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="sPass">Kata sandi</label>
            <input id="sPass" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div className="field-hint">Username login siswa otomatis = NIS/NISN</div>
        </ModalShell>
      )}
    </>
  );
}
