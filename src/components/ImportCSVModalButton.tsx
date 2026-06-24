"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importStudentsAction, ImportRow, ImportResult } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconUpload, IconCheck, IconX, IconWarn } from "./icons";

type ParsedRow = ImportRow & { _line: number };

// Format: NO*, NIS, NISN, NAMA, L/P, AG, KELAS, ASAL SD, D/L
function parseCSV(text: string): { rows: ParsedRow[]; error?: string } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], error: "File CSV kosong atau hanya berisi header." };

  const firstLow = lines[0].toLowerCase();
  const dataLines = (firstLow.includes("nama") || firstLow.includes("nis") || firstLow.includes("no"))
    ? lines.slice(1)
    : lines;

  const rows: ParsedRow[] = [];
  for (let i = 0; i < dataLines.length; i++) {
    const cols = dataLines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.every((c) => !c)) continue;

    const offset = /^\d{1,3}$/.test(cols[0] || "") ? 1 : 0;

    const nis    = cols[offset + 0] || "";
    const nisn   = cols[offset + 1] || "";
    const nama   = cols[offset + 2] || "";
    const jk     = (cols[offset + 3] || "L").toUpperCase() === "P" ? "P" : "L";
    const agama  = cols[offset + 4] || "";
    const kelas  = cols[offset + 5] || "";
    const asalSD = cols[offset + 6] || "";
    const dl     = (cols[offset + 7] || "L").toUpperCase() === "D" ? "D" : "L";

    rows.push({
      _line: i + 2,
      nis, nisn: nisn || undefined, nama, kelas,
      jenisKelamin: jk, agama,
      asalSD: asalSD || undefined,
      statusDL: dl,
      poinAwal: 100,
    });
  }
  return { rows };
}

type Step = "idle" | "preview" | "result";

export function ImportCSVModalButton() {
  const [open, setOpen]         = useState(false);
  const [step, setStep]         = useState<Step>("idle");
  const [rows, setRows]         = useState<ParsedRow[]>([]);
  const [results, setResults]   = useState<ImportResult[]>([]);
  const [parseError, setPErr]   = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef  = useRef<HTMLInputElement>(null);
  const router   = useRouter();
  const [pending, start] = useTransition();

  function reset() { setStep("idle"); setRows([]); setResults([]); setPErr(""); }
  function close() { setOpen(false); reset(); }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) { setPErr("Hanya file .csv yang didukung."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows: parsed, error } = parseCSV(text);
      if (error) { setPErr(error); return; }
      if (parsed.length === 0) { setPErr("Tidak ada data siswa ditemukan."); return; }
      setPErr(""); setRows(parsed); setStep("preview");
    };
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function doImport() {
    start(async () => {
      const res = await importStudentsAction(rows.map(({ _line: _, ...r }) => r));
      setResults(res); setStep("result");
      const ok = res.filter((r) => r.ok).length;
      if (ok > 0) { toast(`${ok} siswa berhasil diimport.`); router.refresh(); }
    });
  }

  const successCount = results.filter((r) => r.ok).length;
  const failCount    = results.filter((r) => !r.ok).length;

  return (
    <>
      <button className="btn" onClick={() => { reset(); setOpen(true); }}>
        <IconUpload />
        Import CSV
      </button>

      {open && (
        <ModalShell
          title="Import Siswa dari CSV"
          onClose={close}
          footer={
            step === "preview" ? (
              <>
                <button className="btn" onClick={reset}>Ganti File</button>
                <button className="btn btn-accent" onClick={doImport} disabled={pending || rows.length === 0}>
                  {pending ? "Mengimport…" : `Import ${rows.length} Siswa`}
                </button>
              </>
            ) : step === "result" ? (
              <button className="btn btn-accent" onClick={close}>Selesai</button>
            ) : (
              <button className="btn" onClick={close}>Batal</button>
            )
          }
        >
          {step === "idle" && (
            <div>
              <div
                className={"csv-drop" + (dragging ? " csv-drop-over" : "")}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <IconUpload style={{ width: 32, height: 32, color: "var(--accent)" }} />
                <b>Drag &amp; drop file CSV di sini</b>
                <span>atau klik untuk memilih file</span>
                <input
                  ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {parseError && (
                <div className="csv-alert"><IconWarn style={{ width: 15, height: 15 }} /> {parseError}</div>
              )}

              <div className="csv-format">
                <div className="csv-format-label">Format kolom CSV:</div>
                <code>NO, NIS, NISN, NAMA, L/P, AG, KELAS, ASAL SD, D/L</code>
                <div className="csv-format-hint">
                  Kolom <b>NO</b> opsional (dilewati otomatis). Kolom kosong = default (password: <b>siswa123</b>, poin: 100).
                </div>
                <div className="csv-format-example">
                  <div className="csv-format-label">Contoh:</div>
                  <code>
                    NO,NIS,NISN,NAMA,L/P,AG,KELAS,ASAL SD,D/L<br />
                    1,10507,0121836315,Abed Schot Tandilangi,L,Kristen,VII A,SD N 01 Bandardawung,L<br />
                    2,10508,3139923934,Aldan Abhyaksa Firmansyah,L,Islam,VII A,SD Negeri Kudu 01,L
                  </code>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div>
              <div className="csv-info">
                <IconCheck style={{ width: 14, height: 14, color: "var(--good)" }} />
                <b>{rows.length} siswa</b> siap diimport. Periksa sebelum melanjutkan.
              </div>
              <div className="csv-table-wrap">
                <table className="csv-table">
                  <thead>
                    <tr>
                      <th>#</th><th>NIS</th><th>NISN</th><th>Nama</th>
                      <th>L/P</th><th>Agama</th><th>Kelas</th><th>Asal SD</th><th>D/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r._line}>
                        <td className="muted">{r._line}</td>
                        <td className="mono">{r.nis || <span className="csv-missing">kosong</span>}</td>
                        <td className="mono">{r.nisn || <span className="muted">—</span>}</td>
                        <td>{r.nama || <span className="csv-missing">kosong</span>}</td>
                        <td>{r.jenisKelamin}</td>
                        <td>{r.agama || <span className="muted">—</span>}</td>
                        <td>{r.kelas || <span className="csv-missing">kosong</span>}</td>
                        <td>{r.asalSD || <span className="muted">—</span>}</td>
                        <td>{r.statusDL}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === "result" && (
            <div>
              <div className="csv-result-summary">
                <span className="csv-result-ok"><IconCheck style={{ width: 14, height: 14 }} />{successCount} berhasil</span>
                {failCount > 0 && <span className="csv-result-fail"><IconX style={{ width: 14, height: 14 }} />{failCount} gagal</span>}
              </div>
              <div className="csv-table-wrap">
                <table className="csv-table">
                  <thead>
                    <tr><th>#</th><th>NIS</th><th>Nama</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.row} className={r.ok ? "csv-row-ok" : "csv-row-fail"}>
                        <td className="muted">{r.row}</td>
                        <td className="mono">{r.nis}</td>
                        <td>{r.nama}</td>
                        <td>
                          {r.ok
                            ? <span className="csv-badge-ok"><IconCheck style={{ width: 12, height: 12 }} />Berhasil</span>
                            : <span className="csv-badge-fail"><IconX style={{ width: 12, height: 12 }} />{r.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ModalShell>
      )}
    </>
  );
}
