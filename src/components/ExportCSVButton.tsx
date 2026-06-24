"use client";

import { IconDownload } from "./icons";

type Student = {
  nis: string; nisn?: string | null; nama: string;
  jenisKelamin: string; agama: string; kelas: string;
  asalSD?: string | null; statusDL?: string | null;
};

function escapeCSV(v: string | null | undefined) {
  const s = v ?? "";
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ExportCSVButton({ students }: { students: Student[] }) {
  function doExport() {
    const header = "NO,NIS,NISN,NAMA,L/P,AG,KELAS,ASAL SD,D/L";
    const rowsSorted = [...students].sort((a, b) =>
      a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)
    );
    const lines = rowsSorted.map((s, i) =>
      [
        i + 1,
        escapeCSV(s.nis),
        escapeCSV(s.nisn),
        escapeCSV(s.nama),
        s.jenisKelamin,
        escapeCSV(s.agama),
        escapeCSV(s.kelas),
        escapeCSV(s.asalSD),
        s.statusDL || "L",
      ].join(",")
    );

    const csv = [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `data-siswa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="btn" onClick={doExport}>
      <IconDownload />
      Export CSV
    </button>
  );
}
