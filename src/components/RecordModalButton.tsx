"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KATEGORI } from "@/lib/points";
import { todayISO } from "@/lib/format";
import { addRecordAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { StudentSelect } from "./StudentSelect";
import { toast } from "./Toaster";
import { IconPlus, IconUp, IconDown } from "./icons";

type StudentOpt = { id: string; nama: string; kelas: string };
type KatOpt = { id: string; nama: string; poin: number };

const FALLBACK_PEL: KatOpt[] = KATEGORI.pelanggaran
  .filter(k => k.poin > 0)
  .map(k => ({ id: k.label, nama: k.label, poin: k.poin }));
const FALLBACK_PRE: KatOpt[] = KATEGORI.prestasi
  .filter(k => k.poin > 0)
  .map(k => ({ id: k.label, nama: k.label, poin: k.poin }));

const OTHER_ID = "__other__";
const OTHER_OPT: KatOpt = { id: OTHER_ID, nama: "Lainnya (isi manual)", poin: 0 };

// ---------- Searchable combobox ----------
function KatCombo({ list, selectedId, onSelect, isUp }: {
  list: KatOpt[];
  selectedId: string;
  onSelect: (id: string, poin: number) => void;
  isUp: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allOpts = useMemo(() => [...list, OTHER_OPT], [list]);
  const filtered = useMemo(() =>
    q.trim() === ""
      ? allOpts
      : allOpts.filter(o => o.nama.toLowerCase().includes(q.toLowerCase())),
    [allOpts, q]);

  const selected = allOpts.find(o => o.id === selectedId);

  function pick(opt: KatOpt) {
    onSelect(opt.id, opt.poin);
    setQ("");
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        className="input"
        placeholder="Cari atau pilih kategori…"
        value={open ? q : (selected?.nama ?? "")}
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
            const isOtherOpt = opt.id === OTHER_ID;
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
                  color: active ? "var(--accent)" : isOtherOpt ? "var(--ink-soft)" : "var(--ink)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span>{opt.nama}</span>
                {!isOtherOpt && (
                  <span style={{
                    fontSize: 11.5, fontWeight: 600, padding: "1px 7px", borderRadius: 4, flexShrink: 0,
                    background: isUp ? "var(--good-bg)" : "var(--bad-bg)",
                    color: isUp ? "var(--good)" : "var(--bad)",
                  }}>
                    {isUp ? "+" : "−"}{opt.poin} poin
                  </span>
                )}
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

  const lists = useMemo(() => ({
    pelanggaran: kategoriPelanggaran.length > 0 ? kategoriPelanggaran : FALLBACK_PEL,
    prestasi:    kategoriPrestasi.length    > 0 ? kategoriPrestasi    : FALLBACK_PRE,
  }), [kategoriPelanggaran, kategoriPrestasi]);

  const [siswaId, setSiswaId]       = useState(presetStudentId || sorted[0]?.id || "");
  const [jenis, setJenis]           = useState<"pelanggaran" | "prestasi">("pelanggaran");
  const [selectedId, setSelectedId] = useState("");
  const [otherNama, setOtherNama]   = useState("");
  const [poin, setPoin]             = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [tanggal, setTanggal]       = useState(todayISO());

  const up      = jenis === "prestasi";
  const isOther = selectedId === OTHER_ID;
  const list    = lists[jenis];

  function reset() {
    setSiswaId(presetStudentId || sorted[0]?.id || "");
    setJenis("pelanggaran");
    setSelectedId("");
    setOtherNama("");
    setPoin("");
    setKeterangan("");
    setTanggal(todayISO());
  }

  function switchJenis(j: "pelanggaran" | "prestasi") {
    setJenis(j);
    setSelectedId("");
    setOtherNama("");
    setPoin("");
  }

  function handleKatSelect(id: string, katPoin: number) {
    setSelectedId(id);
    setPoin(id === OTHER_ID ? "" : String(katPoin));
  }

  const kategoriNama = isOther
    ? otherNama.trim()
    : list.find(k => k.id === selectedId)?.nama ?? "";

  function submit() {
    const mag = Math.abs(parseInt(poin, 10) || 0);
    if (!siswaId)        { toast("Pilih siswa terlebih dahulu.", "bad"); return; }
    if (!selectedId)     { toast("Pilih kategori terlebih dahulu.", "bad"); return; }
    if (!kategoriNama)   { toast("Masukkan nama kategori.", "bad"); return; }
    if (mag <= 0)        { toast("Isi jumlah poin lebih dari 0.", "bad"); return; }

    start(async () => {
      const res = await addRecordAction({
        siswaId, jenis: up ? "PRESTASI" : "PELANGGARAN",
        kategori: kategoriNama, poin: mag, keterangan, tanggal,
      });
      if (res.ok) {
        toast((up ? "Prestasi" : "Pelanggaran") + " tercatat · " + (up ? "+" : "−") + mag + " poin");
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
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
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
            <label>Kategori</label>
            <KatCombo
              list={list}
              selectedId={selectedId}
              onSelect={handleKatSelect}
              isUp={up}
            />
          </div>

          {isOther ? (
            <>
              <div className="field">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  placeholder={up ? "Contoh: Juara lomba sains" : "Contoh: Membolos pelajaran"}
                  value={otherNama}
                  onChange={e => setOtherNama(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Poin</label>
                <div className="poin-row">
                  <span className={"sign " + (up ? "up" : "down")}>{up ? "+" : "−"}</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={poin}
                    onChange={e => setPoin(e.target.value)}
                    style={{ flex: 1 }}
                    placeholder="0"
                  />
                </div>
              </div>
            </>
          ) : selectedId && (
            <div style={{
              padding: "9px 12px", borderRadius: 8,
              background: up ? "var(--good-bg)" : "var(--bad-bg)",
              fontSize: 13, color: up ? "var(--good)" : "var(--bad)", fontWeight: 500,
            }}>
              Poin siswa akan <b>{up ? "bertambah" : "berkurang"} {poin} poin</b>
            </div>
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
