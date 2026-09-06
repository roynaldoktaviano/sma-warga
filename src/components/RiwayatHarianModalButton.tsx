"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ModalShell } from "./ModalShell";
import { IconSearch } from "./icons";

type Status = "HADIR" | "IZIN" | "SAKIT" | "ALPA";
type Siswa = { id: string; nama: string; nisn: string | null; status: Status };

const STATUS_LABEL: Record<Status, string> = { HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa" };
const STATUS_BG: Record<Status, string>    = { HADIR: "var(--good-bg)", IZIN: "var(--info-bg)", SAKIT: "var(--warn-bg)", ALPA: "var(--bad-bg)" };
const STATUS_COLOR: Record<Status, string> = { HADIR: "var(--good)", IZIN: "var(--info)", SAKIT: "var(--warn)", ALPA: "var(--bad)" };

export function RiwayatHarianModalButton({ kelas, siswa }: { kelas: string; siswa: Siswa[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tidakHadir = siswa.filter((s) => s.status !== "HADIR").length;

  const filtered = useMemo(() => {
    if (!q.trim()) return siswa;
    const k = q.trim().toLowerCase();
    return siswa.filter((s) => s.nama.toLowerCase().includes(k) || (s.nisn ?? "").toLowerCase().includes(k));
  }, [siswa, q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  return (
    <>
      <button type="button" className="kelas-card kelas-card--clickable" onClick={() => setOpen(true)}>
        <div className="kelas-card-top">
          <div>
            <div className="kelas-card-name">{kelas}</div>
            <div className="kelas-card-count">{siswa.length} siswa</div>
          </div>
        </div>
        <div className="kelas-card-hint" style={{ color: tidakHadir > 0 ? "var(--warn)" : "var(--ink-faint)" }}>
          {tidakHadir > 0 ? `${tidakHadir} tidak hadir` : "Semua hadir"}
        </div>
      </button>

      {open && (
        <ModalShell
          title={`Riwayat Harian — ${kelas}`}
          ariaLabel={`Riwayat harian kelas ${kelas}`}
          onClose={() => setOpen(false)}
          footer={null}
        >
          <div className="modal-search">
            <IconSearch />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari nama atau NISN…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="harian-list harian-list--modal">
            {filtered.length === 0 ? (
              <div className="riwayat-empty">Tidak ada siswa ditemukan.</div>
            ) : (
              filtered.map((s) => (
                <div key={s.id} className="harian-row">
                  <span className="harian-nama-wrap">
                    <span className="harian-nama">{s.nama}</span>
                    <span className="harian-nisn">{s.nisn || "—"}</span>
                  </span>
                  <span className="harian-status" style={{ background: STATUS_BG[s.status], color: STATUS_COLOR[s.status] }}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </ModalShell>
      )}
    </>
  );
}
