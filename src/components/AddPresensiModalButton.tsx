"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPresensiAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { StudentSelect } from "./StudentSelect";
import { toast } from "./Toaster";
import { IconCalendar } from "./icons";

type Student = { id: string; nama: string; kelas: string };

export function AddPresensiModalButton({ students, today }: { students: Student[]; today: string }) {
  const [open, setOpen] = useState(false);
  const [siswaId, setSiswaId] = useState("");
  const [tanggal, setTanggal] = useState(today);
  const [status, setStatus] = useState<"IZIN" | "SAKIT" | "ALPA">("ALPA");
  const [keterangan, setKeterangan] = useState("");
  const router = useRouter();
  const [pending, start] = useTransition();

  function reset() { setSiswaId(""); setTanggal(today); setStatus("ALPA"); setKeterangan(""); }

  function submit() {
    if (!siswaId) { toast("Pilih siswa terlebih dahulu.", "bad"); return; }
    start(async () => {
      const res = await addPresensiAction({ siswaId, tanggal, status, keterangan });
      if (res.ok) {
        toast("Presensi berhasil dicatat.");
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
        <IconCalendar />
        Catat Ketidakhadiran
      </button>

      {open && (
        <ModalShell
          title="Catat Ketidakhadiran"
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

          <div className="two">
            <div className="field">
              <label>Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "IZIN" | "SAKIT" | "ALPA")}>
                <option value="ALPA">Alpa</option>
                <option value="SAKIT">Sakit</option>
                <option value="IZIN">Izin</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Keterangan <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>(opsional)</span></label>
            <textarea placeholder="mis. demam, keperluan keluarga…" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>
        </ModalShell>
      )}
    </>
  );
}
