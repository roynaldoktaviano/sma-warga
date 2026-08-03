"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPresensiKelasAction } from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconCalendar } from "./icons";

type SiswaItem = { id: string; nama: string };
type Status = "HADIR" | "IZIN" | "SAKIT" | "ALPA";

const OPTS: { value: Status; label: string; bg: string; color: string }[] = [
  { value: "HADIR", label: "Hadir", bg: "var(--good-bg)",  color: "var(--good)"  },
  { value: "IZIN",  label: "Izin",  bg: "var(--warn-bg)",  color: "var(--warn)"  },
  { value: "SAKIT", label: "Sakit", bg: "#eff6ff",         color: "#2563eb"      },
  { value: "ALPA",  label: "Alpa",  bg: "var(--bad-bg)",   color: "var(--bad)"   },
];

export function PresensiKelasButton({
  kelas,
  siswa,
  existing,
}: {
  kelas: string;
  siswa: SiswaItem[];
  existing: Record<string, Status>;  // siswaId → status hari ini (sudah dicatat)
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [tanggal, setTanggal] = useState(today);
  const [entries, setEntries] = useState<Record<string, Status>>(() => {
    const init: Record<string, Status> = {};
    for (const s of siswa) init[s.id] = existing[s.id] ?? "HADIR";
    return init;
  });
  const [pending, start] = useTransition();
  const router = useRouter();

  function setStatus(id: string, st: Status) {
    setEntries(p => ({ ...p, [id]: st }));
  }

  function setAll(st: Status) {
    setEntries(Object.fromEntries(siswa.map(s => [s.id, st])));
  }

  function handleOpen() {
    // reset ke existing saat buka modal
    const init: Record<string, Status> = {};
    for (const s of siswa) init[s.id] = existing[s.id] ?? "HADIR";
    setEntries(init);
    setTanggal(today);
    setOpen(true);
  }

  function submit() {
    start(async () => {
      const res = await addPresensiKelasAction(
        kelas,
        tanggal,
        siswa.map(s => ({ siswaId: s.id, status: entries[s.id] ?? "HADIR" }))
      );
      if (res.ok) {
        const tidakHadir = siswa.filter(s => entries[s.id] !== "HADIR").length;
        toast(`Presensi ${kelas} disimpan. ${tidakHadir} siswa tidak hadir.`);
        setOpen(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  const hadir    = siswa.filter(s => entries[s.id] === "HADIR").length;
  const tidakHadir = siswa.length - hadir;

  return (
    <>
      <button className="btn btn-sm btn-accent" onClick={handleOpen}>
        <IconCalendar /> Input Presensi
      </button>

      {open && (
        <ModalShell
          title={`Presensi ${kelas}`}
          onClose={() => setOpen(false)}
          wide
          footer={
            <>
              <span style={{ fontSize: 12, color: "var(--ink-faint)", marginRight: "auto" }}>
                {hadir} hadir · {tidakHadir} tidak hadir
              </span>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" disabled={pending} onClick={submit}>
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          }
        >
          {/* Tanggal + set-all */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
            <div className="field" style={{ margin: 0, minWidth: 160 }}>
              <label className="field-label">Tanggal</label>
              <input type="date" className="input" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
              {OPTS.map(o => (
                <button key={o.value} type="button" className="btn btn-sm btn-ghost"
                  onClick={() => setAll(o.value)}
                  style={{ fontSize: 12 }}
                >
                  Semua {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daftar siswa */}
          <div style={{ border: "1px solid var(--line-soft)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "28px 1fr auto",
              padding: "7px 14px", background: "var(--surface-2)",
              fontSize: 11, fontWeight: 600, color: "var(--ink-faint)",
              textTransform: "uppercase", letterSpacing: ".05em",
              borderBottom: "1px solid var(--line-soft)",
            }}>
              <span>#</span>
              <span>Nama Siswa</span>
              <span>Status</span>
            </div>
            {siswa.map((s, i) => {
              const cur = entries[s.id] ?? "HADIR";
              return (
                <div key={s.id} style={{
                  display: "grid", gridTemplateColumns: "28px 1fr auto",
                  padding: "9px 14px", alignItems: "center",
                  borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
                  background: cur !== "HADIR" ? "var(--bad-bg)" : "transparent",
                  transition: "background .1s",
                }}>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: cur !== "HADIR" ? 600 : 400 }}>{s.nama}</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {OPTS.map(o => {
                      const active = cur === o.value;
                      return (
                        <button key={o.value} type="button" onClick={() => setStatus(s.id, o.value)}
                          style={{
                            fontSize: 12, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                            border: `1px solid ${active ? o.color : "var(--line)"}`,
                            background: active ? o.bg : "transparent",
                            color: active ? o.color : "var(--ink-faint)",
                            fontWeight: active ? 600 : 400, transition: "all .1s",
                          }}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ModalShell>
      )}
    </>
  );
}
