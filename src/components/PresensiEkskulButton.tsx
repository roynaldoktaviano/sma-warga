"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPresensiEkskulAction } from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconPlus } from "./icons";

type SiswaItem = { id: string; nama: string; kelas: string };
type StatusAbsen = "HADIR" | "IZIN" | "SAKIT" | "ALPA";

const STATUS_OPTS: { value: StatusAbsen; label: string }[] = [
  { value: "HADIR", label: "Hadir" },
  { value: "IZIN",  label: "Izin"  },
  { value: "SAKIT", label: "Sakit" },
  { value: "ALPA",  label: "Alpa"  },
];

const STATUS_COLOR: Record<StatusAbsen, { bg: string; color: string; border: string }> = {
  HADIR: { bg: "var(--good-bg)",  color: "var(--good)", border: "var(--good)"      },
  IZIN:  { bg: "var(--warn-bg)",  color: "var(--warn)", border: "var(--warn)"      },
  SAKIT: { bg: "#eff6ff",         color: "#2563eb",     border: "#2563eb"          },
  ALPA:  { bg: "var(--bad-bg)",   color: "var(--bad)",  border: "var(--bad)"       },
};

export function PresensiEkskulButton({
  ekskulId,
  anggota,
  isGuruEkskul = false,
}: {
  ekskulId: string;
  anggota: SiswaItem[];
  isGuruEkskul?: boolean;
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

  function submit() {
    start(async () => {
      const res = await addPresensiEkskulAction(
        ekskulId, tanggal,
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

  // Simplified mode for GURU_EKSKUL: only HADIR / TIDAK HADIR (mapped to ALPA)
  const shownOpts = isGuruEkskul
    ? [
        { value: "HADIR" as StatusAbsen, label: "Hadir" },
        { value: "ALPA"  as StatusAbsen, label: "Tidak Hadir" },
      ]
    : STATUS_OPTS;

  return (
    <>
      <button className="btn btn-sm btn-accent" onClick={() => setOpen(true)}>
        <IconPlus /> Input Presensi
      </button>

      {open && (
        <ModalShell
          title="Input Presensi Ekskul"
          onClose={() => setOpen(false)}
          wide
          footer={
            <>
              <span style={{ fontSize: 12, color: "var(--ink-faint)", marginRight: "auto" }}>
                {hadir}/{anggota.length} hadir
              </span>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" disabled={pending} onClick={submit}>
                {pending ? "Menyimpan…" : "Simpan Presensi"}
              </button>
            </>
          }
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 14 }}>
            <div className="field" style={{ margin: 0, flex: 1 }}>
              <label className="field-label">Tanggal</label>
              <input
                type="date"
                className="input"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
              {shownOpts.map(s => (
                <button key={s.value} type="button" className="btn btn-sm btn-ghost"
                  onClick={() => setAll(s.value)}
                  style={{ fontSize: 12 }}
                >
                  Semua {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid var(--line-soft)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto",
              padding: "7px 14px", background: "var(--surface-2)",
              fontSize: 11, fontWeight: 600, color: "var(--ink-faint)",
              textTransform: "uppercase", letterSpacing: ".05em",
              borderBottom: "1px solid var(--line-soft)",
            }}>
              <span>Nama Siswa</span>
              <span>Status Kehadiran</span>
            </div>
            {anggota.map((s, i) => (
              <div key={s.id} style={{
                display: "grid", gridTemplateColumns: "1fr auto",
                padding: "10px 14px", alignItems: "center",
                borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.nama}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{s.kelas}</div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {shownOpts.map(st => {
                    const active = entries[s.id] === st.value;
                    const c = STATUS_COLOR[st.value];
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setStatus(s.id, st.value)}
                        style={{
                          fontSize: 12, padding: "4px 10px", borderRadius: 20,
                          border: `1px solid ${active ? c.border : "var(--line)"}`,
                          background: active ? c.bg : "transparent",
                          color: active ? c.color : "var(--ink-faint)",
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer", transition: "all .1s",
                        }}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ModalShell>
      )}
    </>
  );
}
