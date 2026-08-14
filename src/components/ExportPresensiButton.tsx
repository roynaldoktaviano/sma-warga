"use client";

import { useState, useTransition } from "react";
import { getRekapPresensiAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconDownload } from "./icons";

const STATUS_LABEL: Record<string, string> = { HADIR: "H", IZIN: "I", SAKIT: "S", ALPA: "A" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonthISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function fmtHeaderTgl(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function listDatesInRange(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const cur = new Date(startISO + "T00:00:00Z");
  const end = new Date(endISO + "T00:00:00Z");
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function ExportPresensiButton() {
  const [open, setOpen] = useState(false);
  const [mulai, setMulai] = useState(firstOfMonthISO());
  const [selesai, setSelesai] = useState(todayISO());
  const [pending, start] = useTransition();

  function submit() {
    if (selesai < mulai) { toast("Tanggal selesai harus setelah tanggal mulai.", "bad"); return; }

    start(async () => {
      const res = await getRekapPresensiAction(mulai, selesai);
      if (!res.ok) { toast(res.error, "bad"); return; }

      const XLSX = await import("xlsx");
      const dates = listDatesInRange(mulai, selesai);

      // siswaId -> tanggal -> status
      const byStudent = new Map<string, Map<string, string>>();
      for (const p of res.presensi) {
        if (!byStudent.has(p.siswaId)) byStudent.set(p.siswaId, new Map());
        byStudent.get(p.siswaId)!.set(p.tanggal, p.status);
      }

      // Kelompokkan siswa per kelas
      const kelasMap = new Map<string, typeof res.siswa>();
      for (const s of res.siswa) {
        if (!kelasMap.has(s.kelas)) kelasMap.set(s.kelas, []);
        kelasMap.get(s.kelas)!.push(s);
      }
      const kelasList = Array.from(kelasMap.entries()).sort(([a], [b]) => a.localeCompare(b));

      if (kelasList.length === 0) { toast("Tidak ada data siswa aktif.", "bad"); return; }

      const wb = XLSX.utils.book_new();

      for (const [kelas, siswaList] of kelasList) {
        const header = ["No", "NIS", "Nama", ...dates.map(fmtHeaderTgl), "Hadir", "Izin", "Sakit", "Alpa"];
        const rows: (string | number)[][] = [header];

        siswaList.forEach((s, i) => {
          const perTanggal = byStudent.get(s.id);
          let hadir = 0, izin = 0, sakit = 0, alpa = 0;
          const statusCols = dates.map(tgl => {
            const st = perTanggal?.get(tgl) ?? "HADIR";
            if (st === "HADIR") hadir++;
            else if (st === "IZIN") izin++;
            else if (st === "SAKIT") sakit++;
            else if (st === "ALPA") alpa++;
            return STATUS_LABEL[st] ?? st;
          });
          rows.push([i + 1, s.nis, s.nama, ...statusCols, hadir, izin, sakit, alpa]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws["!cols"] = [
          { wch: 4 }, { wch: 10 }, { wch: 28 },
          ...dates.map(() => ({ wch: 6 })),
          { wch: 7 }, { wch: 7 }, { wch: 7 }, { wch: 7 },
        ];
        // Nama sheet Excel maks 31 karakter & tidak boleh karakter tertentu
        const sheetName = kelas.replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Kelas";
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      const fname = `rekap-presensi_${mulai}_sd_${selesai}.xlsx`;
      XLSX.writeFile(wb, fname);
      toast("Rekap presensi berhasil diunduh.");
      setOpen(false);
    });
  }

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        <IconDownload />
        Export Rekap Presensi
      </button>

      {open && (
        <ModalShell
          title="Export Rekap Presensi"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
                {pending ? "Menyiapkan…" : "Download Excel"}
              </button>
            </>
          }
        >
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
            Rekap mencakup seluruh siswa aktif, satu sheet per kelas. Setiap tanggal jadi kolom
            (H = Hadir, I = Izin, S = Sakit, A = Alpa), plus ringkasan total per siswa.
          </p>
          <div className="two">
            <div className="field">
              <label>Tanggal Mulai</label>
              <input type="date" value={mulai} onChange={e => setMulai(e.target.value)} />
            </div>
            <div className="field">
              <label>Tanggal Selesai</label>
              <input type="date" value={selesai} onChange={e => setSelesai(e.target.value)} />
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}
