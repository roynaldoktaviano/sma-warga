"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importKategoriPelanggaranAction, importKategoriPrestasiAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconUpload, IconDownload } from "./icons";

type Mode = "pelanggaran" | "prestasi";
type Row = { nama: string; tingkatan: string; poin: number; _error?: string };

const TEMPLATES: Record<Mode, { header: string; rows: string[] }> = {
  pelanggaran: {
    header: "nama,tingkatan,poin",
    rows: [
      "Terlambat masuk sekolah,RINGAN,5",
      "Tidak memakai seragam lengkap,RINGAN,5",
      "Tidak mengerjakan PR,SEDANG,10",
      "Membawa HP saat KBM,SEDANG,10",
      "Membolos / keluar tanpa izin,BERAT,25",
      "Berkelahi,BERAT,50",
    ],
  },
  prestasi: {
    header: "nama,tingkatan,poin",
    rows: [
      "Juara kelas,SEKOLAH,10",
      "Aktif organisasi OSIS,SEKOLAH,15",
      "Juara lomba tingkat kota,KOTA,25",
      "Juara lomba tingkat provinsi,PROVINSI,35",
      "Juara olimpiade nasional,NASIONAL,50",
    ],
  },
};

const VALID_TINGKAT: Record<Mode, string[]> = {
  pelanggaran: ["RINGAN", "SEDANG", "BERAT"],
  prestasi: ["SEKOLAH", "KECAMATAN", "KOTA", "PROVINSI", "NASIONAL", "INTERNASIONAL"],
};

function downloadTemplate(mode: Mode) {
  const t = TEMPLATES[mode];
  const csv = [t.header, ...t.rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `template-kategori-${mode}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string, mode: Mode): Row[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];
  // skip header if first line looks like header
  const start = lines[0].toLowerCase().includes("nama") ? 1 : 0;
  const validTingkat = VALID_TINGKAT[mode];

  return lines.slice(start).map(line => {
    const parts = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
    const nama = parts[0] ?? "";
    const tingkatan = (parts[1] ?? "").toUpperCase();
    const poin = Math.abs(Math.round(Number(parts[2])));
    let _error: string | undefined;
    if (!nama) _error = "Nama kosong";
    else if (!validTingkat.includes(tingkatan)) _error = `Tingkatan tidak valid (${parts[1] ?? "-"})`;
    else if (!(poin > 0)) _error = "Poin harus > 0";
    return { nama, tingkatan, poin, _error };
  });
}

export function ImportKategoriButton({ mode }: { mode: Mode }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text, mode));
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  const validRows = rows.filter(r => !r._error);
  const errorRows = rows.filter(r => r._error);

  function submit() {
    if (validRows.length === 0) { toast("Tidak ada baris valid.", "bad"); return; }
    start(async () => {
      const action = mode === "pelanggaran"
        ? importKategoriPelanggaranAction
        : importKategoriPrestasiAction;
      const res = await action(validRows.map(r => ({ nama: r.nama, tingkatan: r.tingkatan, poin: r.poin })));
      if (res.ok) {
        toast(`${res.inserted} kategori ditambahkan${res.skipped > 0 ? `, ${res.skipped} dilewati` : ""}.`);
        setOpen(false);
        setRows([]);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  const isP = mode === "pelanggaran";
  const validTingkatList = VALID_TINGKAT[mode].join(", ");

  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => downloadTemplate(mode)}>
          <IconDownload /> Template
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setRows([]); setOpen(true); }}>
          <IconUpload /> Import CSV
        </button>
      </div>

      {open && (
        <ModalShell
          title={`Import Kategori ${isP ? "Pelanggaran" : "Prestasi"}`}
          onClose={() => { setOpen(false); setRows([]); }}
          wide
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => { setOpen(false); setRows([]); }}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending || validRows.length === 0}>
                {pending ? "Mengimpor…" : `Import ${validRows.length} baris`}
              </button>
            </>
          }
        >
          {/* Format hint */}
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", background: "var(--surface-2)", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Format CSV:</div>
            <code style={{ fontSize: 12, display: "block", marginBottom: 4 }}>nama,tingkatan,poin</code>
            <div>Tingkatan yang valid: <b>{validTingkatList}</b></div>
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                onClick={() => downloadTemplate(mode)}
              >
                Download template contoh
              </button>
            </div>
          </div>

          {/* File input */}
          <div className="field" style={{ marginBottom: rows.length > 0 ? 16 : 0 }}>
            <label>Pilih File CSV</label>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="input" />
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, marginBottom: 8, color: "var(--ink-soft)" }}>
                {validRows.length} baris valid
                {errorRows.length > 0 && <span style={{ color: "var(--bad)", marginLeft: 8 }}>{errorRows.length} baris error (akan dilewati)</span>}
              </div>
              <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 130px 70px",
                  padding: "7px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-faint)",
                  position: "sticky", top: 0,
                }}>
                  <span>Nama</span><span>Tingkatan</span><span>Poin</span>
                </div>
                {rows.map((r, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 130px 70px",
                    padding: "8px 14px", borderBottom: "1px solid var(--line-soft)", alignItems: "center",
                    background: r._error ? "var(--bad-bg)" : "transparent",
                  }}>
                    <span style={{ fontSize: 13, color: r._error ? "var(--bad)" : "var(--ink)" }}>
                      {r.nama || <em style={{ color: "var(--ink-faint)" }}>(kosong)</em>}
                      {r._error && <span style={{ fontSize: 11, marginLeft: 8 }}>— {r._error}</span>}
                    </span>
                    <span style={{ fontSize: 12, color: r._error ? "var(--bad)" : "var(--ink-soft)" }}>{r.tingkatan || "—"}</span>
                    <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{r.poin || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalShell>
      )}
    </>
  );
}
