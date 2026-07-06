"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPresensiEkskulAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

type SiswaItem = { id: string; nama: string; kelas: string };
type StatusAbsen = "HADIR" | "IZIN" | "SAKIT" | "ALPA";

const STATUS_OPTS: StatusAbsen[] = ["HADIR", "IZIN", "SAKIT", "ALPA"];
const STATUS_LABEL: Record<StatusAbsen, string> = {
  HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpha",
};

export function PresensiEkskulButton({
  ekskulId,
  anggota,
}: {
  ekskulId: string;
  anggota: SiswaItem[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [tanggal, setTanggal] = useState(today);
  const [entries, setEntries] = useState<Record<string, StatusAbsen>>(() =>
    Object.fromEntries(anggota.map(s => [s.id, "HADIR"]))
  );
  const [pending, start] = useTransition();
  const router = useRouter();

  function setStatus(siswaId: string, status: StatusAbsen) {
    setEntries(prev => ({ ...prev, [siswaId]: status }));
  }

  function setAll(status: StatusAbsen) {
    setEntries(Object.fromEntries(anggota.map(s => [s.id, status])));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addPresensiEkskulAction(
        ekskulId,
        tanggal,
        anggota.map(s => ({ siswaId: s.id, status: entries[s.id] ?? "HADIR" }))
      );
      if (res.ok) {
        toast("Presensi berhasil disimpan.");
        setOpen(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  const hadir = Object.values(entries).filter(s => s === "HADIR").length;

  return (
    <>
      <button className="btn btn-sm btn-accent" onClick={() => setOpen(true)}>
        <IconPlus /> Input Presensi
      </button>

      {open && (
        <div className="modal-mask" onClick={() => setOpen(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Input Presensi Ekskul</span>
              <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="field">
                  <label className="field-label">Tanggal</label>
                  <input
                    type="date"
                    className="input"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)", alignSelf: "center" }}>Set semua:</span>
                  {STATUS_OPTS.map(s => (
                    <button type="button" key={s} className="btn btn-sm btn-ghost" onClick={() => setAll(s)}>
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 10, border: "1px solid var(--line-soft)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr auto",
                    padding: "6px 14px", background: "var(--surface-raised)",
                    fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", textTransform: "uppercase",
                  }}>
                    <span>Nama</span>
                    <span>Status</span>
                  </div>
                  {anggota.map(s => (
                    <div key={s.id} style={{
                      display: "grid", gridTemplateColumns: "1fr auto",
                      padding: "8px 14px", alignItems: "center",
                      borderTop: "1px solid var(--line-soft)",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{s.nama}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{s.kelas}</div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {STATUS_OPTS.map(st => (
                          <button
                            type="button"
                            key={st}
                            onClick={() => setStatus(s.id, st)}
                            style={{
                              fontSize: 11, padding: "3px 8px", borderRadius: 20, border: "1px solid",
                              cursor: "pointer",
                              background: entries[s.id] === st ? (st === "HADIR" ? "var(--good-bg)" : "var(--warn-bg)") : "transparent",
                              borderColor: entries[s.id] === st ? (st === "HADIR" ? "var(--good)" : "var(--warn)") : "var(--line)",
                              color: entries[s.id] === st ? (st === "HADIR" ? "var(--good)" : "var(--warn)") : "var(--ink-soft)",
                              fontWeight: entries[s.id] === st ? 600 : 400,
                            }}
                          >
                            {STATUS_LABEL[st]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-soft)" }}>
                  {hadir} dari {anggota.length} siswa hadir
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-accent" disabled={pending}>
                  {pending ? "Menyimpan…" : "Simpan Presensi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
