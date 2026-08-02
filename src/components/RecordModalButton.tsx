"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { todayISO } from "@/lib/format";
import { addRecordAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { StudentSelect } from "./StudentSelect";
import { toast } from "./Toaster";
import { IconPlus, IconUp, IconDown, IconWarn } from "./icons";

type StudentOpt = { id: string; nama: string; kelas: string };
type KatOpt = { id: string; nama: string; poinMin: number; poinMax: number };

// ---------- Searchable combobox — kategori = range poin ----------
function KatCombo({ list, selectedId, onSelect, bg, color }: {
  list: KatOpt[];
  selectedId: string;
  onSelect: (opt: KatOpt) => void;
  bg: string;
  color: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() =>
    q.trim() === ""
      ? list
      : list.filter(o => o.nama.toLowerCase().includes(q.toLowerCase())),
    [list, q]);

  const selected = list.find(o => o.id === selectedId);

  function pick(opt: KatOpt) {
    onSelect(opt);
    setQ("");
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        className="input"
        placeholder="Cari atau pilih kategori…"
        value={open ? q : (selected ? `${selected.nama} (${selected.poinMin}–${selected.poinMax})` : "")}
        onFocus={() => { setQ(""); setOpen(true); }}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 200, background: "var(--surface)", border: "1px solid var(--line)",
          borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.1)",
          maxHeight: 220, overflowY: "auto",
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink-faint)" }}>Tidak ditemukan</div>
          )}
          {filtered.map(opt => {
            const active = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                onMouseDown={() => pick(opt)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "9px 14px", gap: 10, textAlign: "left",
                  background: active ? "var(--accent-soft)" : "transparent",
                  border: "none", borderTop: "1px solid var(--line-soft)",
                  cursor: "pointer", fontSize: 13,
                  color: active ? "var(--accent)" : "var(--ink)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span>{opt.nama}</span>
                <span style={{
                  fontSize: 11.5, fontWeight: 600, padding: "1px 7px", borderRadius: 4, flexShrink: 0,
                  background: bg, color,
                }}>
                  {opt.poinMin}–{opt.poinMax} poin
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Main component ----------
export function RecordModalButton({
  students,
  presetStudentId,
  block,
  label = "Catat Kejadian",
  kategoriPelanggaran = [],
  kategoriPrestasi = [],
}: {
  students: StudentOpt[];
  presetStudentId?: string;
  block?: boolean;
  label?: string;
  kategoriPelanggaran?: KatOpt[];
  kategoriPrestasi?: KatOpt[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [pending, start] = useTransition();

  const sorted = useMemo(() => [...students].sort((a, b) => a.nama.localeCompare(b.nama, "id")), [students]);

  const pelList = kategoriPelanggaran;
  const preList = kategoriPrestasi;

  const [siswaId, setSiswaId]       = useState(presetStudentId || sorted[0]?.id || "");
  const [jenis, setJenis]           = useState<"pelanggaran" | "prestasi">("pelanggaran");
  const [keterangan, setKeterangan] = useState("");
  const [tanggal, setTanggal]       = useState(todayISO());

  const [kat, setKat]     = useState<KatOpt | null>(null);
  const [nama, setNama]   = useState("");
  const [poin, setPoin]   = useState("");

  const up   = jenis === "prestasi";
  const list = up ? preList : pelList;

  function reset() {
    setSiswaId(presetStudentId || sorted[0]?.id || "");
    setJenis("pelanggaran");
    setKat(null); setNama(""); setPoin("");
    setKeterangan("");
    setTanggal(todayISO());
  }

  function switchJenis(j: "pelanggaran" | "prestasi") {
    setJenis(j);
    setKat(null); setNama(""); setPoin("");
  }

  function handleSelect(opt: KatOpt) {
    setKat(opt);
    setPoin(String(opt.poinMin));
  }

  const poinNum   = parseInt(poin, 10);
  const poinValid = !!kat && Number.isFinite(poinNum) && poinNum >= kat.poinMin && poinNum <= kat.poinMax;

  function submit() {
    if (!siswaId)         { toast("Pilih siswa terlebih dahulu.", "bad"); return; }
    if (!kat)             { toast(`Pilih kategori ${up ? "prestasi" : "pelanggaran"} terlebih dahulu.`, "bad"); return; }
    if (!nama.trim())     { toast(`Masukkan nama ${up ? "prestasi" : "pelanggaran"}.`, "bad"); return; }
    if (!poinValid)       { toast(`Poin harus antara ${kat.poinMin}–${kat.poinMax} untuk kategori "${kat.nama}".`, "bad"); return; }

    start(async () => {
      const res = await addRecordAction({
        siswaId,
        jenis: up ? "PRESTASI" : "PELANGGARAN",
        kategori: nama.trim(),
        kategoriPelanggaranId: up ? undefined : kat.id,
        kategoriPrestasiId: up ? kat.id : undefined,
        poin: poinNum,
        keterangan,
        tanggal,
      });
      if (res.ok) {
        toast(`${up ? "Prestasi" : "Pelanggaran"} tercatat · ${up ? "+" : "−"}${poinNum} poin`);
        setOpen(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button
        className={"btn btn-accent" + (block ? " btn-block" : "")}
        onClick={() => { reset(); setOpen(true); }}
      >
        <IconPlus />
        {label}
      </button>

      {open && (
        <ModalShell
          title="Catat Kejadian"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" onClick={submit} disabled={pending || (!!kat && !poinValid)}>
                {pending ? "Menyimpan…" : "Simpan Catatan"}
              </button>
            </>
          }
        >
          {!presetStudentId && (
            <div className="field">
              <label>Siswa</label>
              <StudentSelect students={sorted} value={siswaId} onChange={setSiswaId} />
            </div>
          )}

          <div className="field">
            <label>Jenis</label>
            <div className="seg">
              <button type="button" data-jenis="pelanggaran" className={up ? "" : "on"} onClick={() => switchJenis("pelanggaran")}>
                <IconDown /> Pelanggaran
              </button>
              <button type="button" data-jenis="prestasi" className={up ? "on" : ""} onClick={() => switchJenis("prestasi")}>
                <IconUp /> Prestasi
              </button>
            </div>
          </div>

          <div className="field">
            <label>Kategori {up ? "Prestasi" : "Pelanggaran"}</label>
            {list.length === 0 ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8,
                background: "var(--warn-bg)", color: "var(--warn)", fontSize: 12.5,
              }}>
                <IconWarn />
                <span>
                  Belum ada kategori {up ? "prestasi" : "pelanggaran"}. Tambahkan dulu di menu Master Data
                  &nbsp;→&nbsp;{up ? "Prestasi" : "Pelanggaran"}.
                </span>
              </div>
            ) : (
              <KatCombo
                list={list}
                selectedId={kat?.id ?? ""}
                onSelect={handleSelect}
                bg={up ? "var(--good-bg)" : "var(--bad-bg)"}
                color={up ? "var(--good)" : "var(--bad)"}
              />
            )}
          </div>

          {kat && (
            <>
              <div className="field">
                <label>Nama {up ? "Prestasi" : "Pelanggaran"}</label>
                <input
                  type="text"
                  placeholder={up ? "Contoh: Juara lomba sains" : "Contoh: Tidak memakai dasi"}
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Poin ({kat.poinMin}–{kat.poinMax})</label>
                <div className="poin-row">
                  <span className={"sign " + (up ? "up" : "down")}>{up ? "+" : "−"}</span>
                  <input
                    type="number"
                    min={kat.poinMin}
                    max={kat.poinMax}
                    step={1}
                    value={poin}
                    onChange={e => setPoin(e.target.value)}
                    style={{ flex: 1 }}
                    placeholder={String(kat.poinMin)}
                  />
                </div>
                {!poinValid && poin !== "" && (
                  <p style={{ fontSize: 12, color: "var(--bad)", marginTop: 6 }}>
                    Poin harus antara {kat.poinMin}–{kat.poinMax}.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="field">
            <label>Keterangan</label>
            <textarea
              placeholder="Jelaskan kejadian secara singkat…"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
          </div>
        </ModalShell>
      )}
    </>
  );
}
