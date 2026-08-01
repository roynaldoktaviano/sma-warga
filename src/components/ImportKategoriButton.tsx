"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importKategoriPelanggaranAction, importKategoriPrestasiAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconUpload, IconDownload } from "./icons";

type Mode = "pelanggaran" | "prestasi";
type Row = { nama: string; poinMin: number; poinMax: number; _error?: string };

const TEMPLATES: Record<Mode, string[]> = {
  pelanggaran: [
    "Kerapihan dan Pakaian,1,10",
    "Kedisiplinan Waktu,1,15",
    "Sikap dan Sopan Santun,5,20",
    "Ketertiban Belajar,5,20",
    "Pelanggaran Berat,20,50",
  ],
  prestasi: [
    "Kedisiplinan dan Keteladanan,5,15",
    "Organisasi dan Kepemimpinan,5,20",
    "Non-Akademik / Bakat Minat,10,25",
    "Akademik,10,30",
    "Prestasi Tingkat Nasional/Internasional,30,50",
  ],
};
const HEADER = "nama,poinMin,poinMax";

function downloadTemplate(mode: Mode) {
  const csv = [HEADER, ...TEMPLATES[mode]].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `template-kategori-${mode}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];
  const start = lines[0].toLowerCase().includes("nama") ? 1 : 0;

  return lines.slice(start).map(line => {
    const parts = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
    const nama = parts[0] ?? "";
    const poinMin = Math.abs(Math.round(Number(parts[1])));
    const poinMax = Math.abs(Math.round(Number(parts[2])));
    let _error: string | undefined;
    if (!nama) _error = "Nama kosong";
    else if (!(poinMin > 0)) _error = "Poin minimum harus > 0";
    else if (poinMax < poinMin) _error = "Poin maksimum harus ≥ poin minimum";
    return { nama, poinMin, poinMax, _error };
  });
}

export function ImportKategoriButton({ mode }: { mode: Mode }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isP = mode === "pelanggaran";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRows(parseCSV(ev.target?.result as string));
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  const validRows = rows.filter(r => !r._error);
  const errorRows = rows.filter(r => r._error);

  function submit() {
    if (validRows.length === 0) { toast("Tidak ada baris valid.", "bad"); return; }
    start(async () => {
      const action = isP ? importKategoriPelanggaranAction : importKategoriPrestasiAction;
      const res = await action(validRows.map(r => ({ nama: r.nama, poinMin: r.poinMin, poinMax: r.poinMax })));
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
            <code style={{ fontSize: 12, display: "block", marginBottom: 4 }}>{HEADER}</code>
            <div>poinMin &amp; poinMax adalah rentang poin yang bisa {isP ? "dipotong" : "ditambahkan"} untuk kategori ini.</div>
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
                  display: "grid", gridTemplateColumns: "1fr 90px 90px",
                  padding: "7px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-faint)",
                  position: "sticky", top: 0,
                }}>
                  <span>Nama</span><span>Poin Min</span><span>Poin Max</span>
                </div>
                {rows.map((r, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 90px 90px",
                    padding: "8px 14px", borderBottom: "1px solid var(--line-soft)", alignItems: "center",
                    background: r._error ? "var(--bad-bg)" : "transparent",
                  }}>
                    <span style={{ fontSize: 13, color: r._error ? "var(--bad)" : "var(--ink)" }}>
                      {r.nama || <em style={{ color: "var(--ink-faint)" }}>(kosong)</em>}
                      {r._error && <span style={{ fontSize: 11, marginLeft: 8 }}>— {r._error}</span>}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{r.poinMin || "—"}</span>
                    <span style={{ fontSize: 12, fontFamily: "var(--mono)" }}>{r.poinMax || "—"}</span>
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
