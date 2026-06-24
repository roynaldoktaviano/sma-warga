"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPrestasiAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { StudentSelect } from "./StudentSelect";
import { toast } from "./Toaster";
import { IconTrophy } from "./icons";

type Student = { id: string; nama: string; kelas: string };
type Tingkat = "SEKOLAH" | "KOTA" | "PROVINSI" | "NASIONAL" | "INTERNASIONAL";

const today = new Date().toISOString().slice(0, 10);

export function AddPrestasiModalButton({ students }: { students: Student[] }) {
  const [open, setOpen] = useState(false);
  const [siswaId, setSiswaId] = useState("");
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [tingkat, setTingkat] = useState<Tingkat>("KOTA");
  const [peringkat, setPeringkat] = useState("");
  const [tanggal, setTanggal] = useState(today);
  const [keterangan, setKeterangan] = useState("");
  const router = useRouter();
  const [pending, start] = useTransition();

  function reset() {
    setSiswaId(""); setJudul(""); setKategori(""); setTingkat("KOTA");
    setPeringkat(""); setTanggal(today); setKeterangan("");
  }

  function submit() {
    if (!siswaId || !judul || !kategori) { toast("Siswa, judul, dan kategori wajib diisi.", "bad"); return; }
    start(async () => {
      const res = await addPrestasiAction({ siswaId, judul, kategori, tingkat, peringkat, tanggal, keterangan });
      if (res.ok) {
        toast("Prestasi berhasil dicatat.");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-accent" onClick={() => { reset(); setOpen(true); }}>
        <IconTrophy />
        Tambah Prestasi
      </button>

      {open && (
        <ModalShell
          title="Tambah Prestasi"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Siswa</label>
            <StudentSelect students={students} value={siswaId} onChange={setSiswaId} />
          </div>

          <div className="field">
            <label>Judul / Nama Lomba</label>
            <input type="text" placeholder="mis. Olimpiade Matematika Tingkat Kota" value={judul} onChange={(e) => setJudul(e.target.value)} />
          </div>

          <div className="two">
            <div className="field">
              <label>Kategori</label>
              <input type="text" placeholder="mis. Akademik, Olahraga, Seni" value={kategori} onChange={(e) => setKategori(e.target.value)} />
            </div>
            <div className="field">
              <label>Tingkat</label>
              <select value={tingkat} onChange={(e) => setTingkat(e.target.value as Tingkat)}>
                <option value="SEKOLAH">Sekolah</option>
                <option value="KOTA">Kota</option>
                <option value="PROVINSI">Provinsi</option>
                <option value="NASIONAL">Nasional</option>
                <option value="INTERNASIONAL">Internasional</option>
              </select>
            </div>
          </div>

          <div className="two">
            <div className="field">
              <label>Peringkat <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opsional)</span></label>
              <input type="text" placeholder="mis. Juara 1, Medali Emas" value={peringkat} onChange={(e) => setPeringkat(e.target.value)} />
            </div>
            <div className="field">
              <label>Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Keterangan <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opsional)</span></label>
            <textarea placeholder="Catatan tambahan…" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>
        </ModalShell>
      )}
    </>
  );
}
