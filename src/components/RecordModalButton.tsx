"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KATEGORI } from "@/lib/points";
import { todayISO } from "@/lib/format";
import { addRecordAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPlus, IconUp, IconDown } from "./icons";

type StudentOpt = { id: string; nama: string; kelas: string };

export function RecordModalButton({
  students,
  presetStudentId,
  block,
  label = "Catat Kejadian",
}: {
  students: StudentOpt[];
  presetStudentId?: string;
  block?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [pending, start] = useTransition();

  const sorted = useMemo(() => [...students].sort((a, b) => (a.nama < b.nama ? -1 : 1)), [students]);

  const [siswaId, setSiswaId] = useState(presetStudentId || sorted[0]?.id || "");
  const [jenis, setJenis] = useState<"pelanggaran" | "prestasi">("pelanggaran");
  const [katIdx, setKatIdx] = useState(0);
  const [poin, setPoin] = useState<string>(String(KATEGORI.pelanggaran[0].poin));
  const [keterangan, setKeterangan] = useState("");
  const [tanggal, setTanggal] = useState(todayISO());

  const list = KATEGORI[jenis];
  const up = jenis === "prestasi";
  const lockSel = !!presetStudentId;

  function reset() {
    setSiswaId(presetStudentId || sorted[0]?.id || "");
    setJenis("pelanggaran");
    setKatIdx(0);
    setPoin(String(KATEGORI.pelanggaran[0].poin));
    setKeterangan("");
    setTanggal(todayISO());
  }

  function switchJenis(j: "pelanggaran" | "prestasi") {
    setJenis(j);
    setKatIdx(0);
    setPoin(String(KATEGORI[j][0].poin));
  }

  function selectKat(i: number) {
    setKatIdx(i);
    setPoin(String(KATEGORI[jenis][i].poin));
  }

  function submit() {
    const mag = Math.abs(parseInt(poin, 10) || 0);
    if (!siswaId) {
      toast("Pilih siswa terlebih dahulu.", "bad");
      return;
    }
    if (mag <= 0) {
      toast("Isi jumlah poin lebih dari 0.", "bad");
      return;
    }
    start(async () => {
      const res = await addRecordAction({
        siswaId,
        jenis: up ? "PRESTASI" : "PELANGGARAN",
        kategori: list[katIdx].label,
        poin: mag,
        keterangan,
        tanggal,
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
        onClick={() => {
          reset();
          setOpen(true);
        }}
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
              <button className="btn" onClick={() => setOpen(false)}>
                Batal
              </button>
              <button className="btn btn-accent" onClick={submit} disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan Catatan"}
              </button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="mStudent">Siswa</label>
            <select
              id="mStudent"
              value={siswaId}
              disabled={lockSel}
              onChange={(e) => setSiswaId(e.target.value)}
            >
              {sorted.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} — {s.kelas}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Jenis</label>
            <div className="seg">
              <button type="button" className={up ? "" : "on"} onClick={() => switchJenis("pelanggaran")}>
                <IconDown />
                Pelanggaran
              </button>
              <button type="button" className={up ? "on" : ""} onClick={() => switchJenis("prestasi")}>
                <IconUp />
                Prestasi
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="mKat">Kategori</label>
            <select id="mKat" value={katIdx} onChange={(e) => selectKat(parseInt(e.target.value, 10))}>
              {list.map((k, i) => (
                <option key={i} value={i}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="mPoin">Poin</label>
            <div className="poin-row">
              <span className={"sign " + (up ? "up" : "down")}>{up ? "+" : "−"}</span>
              <input
                id="mPoin"
                type="number"
                min={0}
                step={1}
                value={poin}
                onChange={(e) => setPoin(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div className="field-hint">
              Poin akan <b>{up ? "ditambahkan ke" : "dikurangi dari"}</b> total siswa.
            </div>
          </div>

          <div className="field">
            <label htmlFor="mDesc">Keterangan</label>
            <textarea
              id="mDesc"
              placeholder="Jelaskan kejadian secara singkat…"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="mDate">Tanggal</label>
            <input id="mDate" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
        </ModalShell>
      )}
    </>
  );
}
