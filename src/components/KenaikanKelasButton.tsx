"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getKenaikanPreviewAction, prosesKenaikanKelasAction, type KenaikanPreview } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";

const PREVIEW_LIMIT = 5;

function KenaikanList({
  items,
  renderItem,
}: {
  items: { id: string }[];
  renderItem: (item: { id: string } & Record<string, string>) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, PREVIEW_LIMIT);
  const rest = items.length - PREVIEW_LIMIT;

  return (
    <div className="kenaikan-list">
      {(visible as ({ id: string } & Record<string, string>)[]).map(item => renderItem(item))}
      {!expanded && rest > 0 && (
        <button className="kenaikan-more kenaikan-more--btn" onClick={() => setExpanded(true)}>
          +{rest} lainnya — klik untuk lihat semua
        </button>
      )}
      {expanded && items.length > PREVIEW_LIMIT && (
        <button className="kenaikan-more kenaikan-more--btn" onClick={() => setExpanded(false)}>
          Sembunyikan
        </button>
      )}
    </div>
  );
}

export function KenaikanKelasButton() {
  const [open, setOpen]           = useState(false);
  const [preview, setPreview]     = useState<KenaikanPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, start]          = useTransition();
  const router                    = useRouter();

  function openModal() {
    setPreview(null);
    setConfirmed(false);
    setOpen(true);
    start(async () => {
      const p = await getKenaikanPreviewAction();
      setPreview(p);
    });
  }

  function proses() {
    start(async () => {
      const res = await prosesKenaikanKelasAction();
      if (res.ok) {
        toast("Kenaikan kelas berhasil diproses.");
        setOpen(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn" onClick={openModal}>Kenaikan Kelas</button>

      {open && (
        <ModalShell
          title="Proses Kenaikan Kelas"
          onClose={() => setOpen(false)}
          wide
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button
                className="btn btn-accent"
                onClick={proses}
                disabled={pending || !preview || !confirmed}
              >
                {pending ? "Memproses…" : "Proses Sekarang"}
              </button>
            </>
          }
        >
          {!preview ? (
            <div className="kenaikan-loading">Menganalisis data siswa…</div>
          ) : (
            <div className="kenaikan-body">

              <div className="kenaikan-cols">
                {/* Lulus */}
                <div className="kenaikan-section">
                  <div className="kenaikan-section-head">
                    <span className="kenaikan-badge kenaikan-badge--lulus">Lulus</span>
                    <span>{preview.lulus.length} siswa kelas 9</span>
                  </div>
                  {preview.lulus.length > 0 && (
                    <KenaikanList
                      items={preview.lulus}
                      renderItem={(s) => (
                        <div key={s.id} className="kenaikan-item">
                          <span>{s.nama}</span>
                          <span className="kenaikan-kelas">{s.kelas}</span>
                        </div>
                      )}
                    />
                  )}
                </div>

                {/* Naik kelas */}
                <div className="kenaikan-section">
                  <div className="kenaikan-section-head">
                    <span className="kenaikan-badge kenaikan-badge--naik">Naik Kelas</span>
                    <span>{preview.naik.length} siswa kelas 7 &amp; 8</span>
                  </div>
                  {preview.naik.length > 0 && (
                    <KenaikanList
                      items={preview.naik}
                      renderItem={(s) => (
                        <div key={s.id} className="kenaikan-item">
                          <span>{s.nama}</span>
                          <span className="kenaikan-kelas">{s.dari} → {s.ke}</span>
                        </div>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Dilewati (full width, hanya kalau ada) */}
              {preview.skip.length > 0 && (
                <div className="kenaikan-section">
                  <div className="kenaikan-section-head">
                    <span className="kenaikan-badge kenaikan-badge--skip">Dilewati</span>
                    <span>{preview.skip.length} siswa (format kelas tidak dikenali)</span>
                  </div>
                  <KenaikanList
                    items={preview.skip}
                    renderItem={(s) => (
                      <div key={s.id} className="kenaikan-item">
                        <span>{s.nama}</span>
                        <span className="kenaikan-kelas">{s.kelas}</span>
                      </div>
                    )}
                  />
                </div>
              )}

              <label className="kenaikan-confirm">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                <span>Saya sudah memeriksa dan yakin ingin memproses kenaikan kelas ini. Tindakan ini tidak bisa dibatalkan.</span>
              </label>
            </div>
          )}
        </ModalShell>
      )}
    </>
  );
}
