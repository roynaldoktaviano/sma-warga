"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POIN_AWAL } from "@/lib/points";
import { addStudentAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconUsers } from "./icons";

const empty = {
  nama: "", kelas: "", nis: "", nisn: "",
  jenisKelamin: "L", agama: "", asalSD: "", statusDL: "L",
  poinAwal: String(POIN_AWAL), password: "siswa123",
};

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
        nisn: form.nisn || undefined,
        jenisKelamin: form.jenisKelamin,
        agama: form.agama,
        asalSD: form.asalSD || undefined,
        statusDL: form.statusDL || undefined,
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
          <div className="field">
            <label htmlFor="sNama">Nama lengkap</label>
            <input id="sNama" type="text" placeholder="mis. Rangga Putra" value={form.nama} onChange={(e) => set("nama", e.target.value)} />
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="sNis">NIS</label>
              <input id="sNis" type="text" placeholder="mis. 10507" value={form.nis} onChange={(e) => set("nis", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sNisn">NISN <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opsional)</span></label>
              <input id="sNisn" type="text" placeholder="mis. 0121836315" value={form.nisn} onChange={(e) => set("nisn", e.target.value)} />
            </div>
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="sKelas">Kelas</label>
              <input id="sKelas" type="text" placeholder="mis. VII A" value={form.kelas} onChange={(e) => set("kelas", e.target.value)} />
            </div>
            <div className="field">
              <label>L/P</label>
              <select value={form.jenisKelamin} onChange={(e) => set("jenisKelamin", e.target.value)}>
                <option value="L">L — Laki-laki</option>
                <option value="P">P — Perempuan</option>
              </select>
            </div>
          </div>

          <div className="two">
            <div className="field">
              <label>Agama</label>
              <select value={form.agama} onChange={(e) => set("agama", e.target.value)}>
                <option value="">— Pilih —</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div className="field">
              <label>D/L</label>
              <select value={form.statusDL} onChange={(e) => set("statusDL", e.target.value)}>
                <option value="D">D — Dalam kota</option>
                <option value="L">L — Luar kota</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="sAsalSD">Asal SD <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opsional)</span></label>
            <input id="sAsalSD" type="text" placeholder="mis. SD Negeri 01 Banyumanik" value={form.asalSD} onChange={(e) => set("asalSD", e.target.value)} />
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="sPoin">Poin awal</label>
              <input id="sPoin" type="number" min={0} value={form.poinAwal} onChange={(e) => set("poinAwal", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sPass">Kata sandi</label>
              <input id="sPass" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
          </div>

          <div className="field-hint">Username login siswa otomatis = NIS</div>
        </ModalShell>
      )}
    </>
  );
}
