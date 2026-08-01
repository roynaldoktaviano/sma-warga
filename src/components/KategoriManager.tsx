"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addKategoriPelanggaranAction,
  deleteKategoriPelanggaranAction,
  addKategoriPrestasiAction,
  deleteKategoriPrestasiAction,
} from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconPlus, IconX } from "./icons";

type KatItem = { id: string; nama: string; poinMin: number; poinMax: number };

function AddRangeModal({
  namaPlaceholder,
  onSave,
  onClose,
}: {
  namaPlaceholder: string;
  onSave: (nama: string, poinMin: number, poinMax: number) => void;
  onClose: () => void;
}) {
  const [nama, setNama] = useState("");
  const [poinMin, setPoinMin] = useState(1);
  const [poinMax, setPoinMax] = useState(10);
  const valid = nama.trim() && poinMin > 0 && poinMax >= poinMin;

  return (
    <ModalShell
      title="Tambah Kategori"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button
            className="btn btn-accent"
            onClick={() => { if (valid) onSave(nama.trim(), poinMin, poinMax); }}
            disabled={!valid}
          >
            Simpan
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field-label">Nama Kategori</label>
        <input className="input" value={nama} onChange={e => setNama(e.target.value)} placeholder={namaPlaceholder} autoFocus />
      </div>
      <div className="two">
        <div className="field">
          <label className="field-label">Poin Minimum</label>
          <input className="input" type="number" min={1} value={poinMin} onChange={e => setPoinMin(Number(e.target.value))} />
        </div>
        <div className="field">
          <label className="field-label">Poin Maksimum</label>
          <input className="input" type="number" min={poinMin} value={poinMax} onChange={e => setPoinMax(Number(e.target.value))} />
        </div>
      </div>
      {poinMax < poinMin && (
        <p style={{ fontSize: 12, color: "var(--bad)", marginTop: -8 }}>Poin maksimum harus ≥ poin minimum.</p>
      )}
      <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4 }}>
        Guru akan memilih kategori ini lalu mengisi sendiri nama kejadian spesifik dan poinnya (dibatasi rentang di atas).
      </p>
    </ModalShell>
  );
}

// ---------- Generic table (dipakai Pelanggaran & Prestasi — sama-sama kategori = range poin) ----------
function RangeKategoriTable({
  items,
  namaPlaceholder,
  poinColor,
  onAdd,
  onDelete,
}: {
  items: KatItem[];
  namaPlaceholder: string;
  poinColor: string;
  onAdd: (nama: string, poinMin: number, poinMax: number) => void;
  onDelete: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <IconPlus /> Tambah Kategori
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {items.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--ink-faint)" }}>
            Belum ada kategori. Tambahkan dengan tombol di atas.
          </div>
        ) : (
          <>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 140px 36px",
              padding: "8px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-faint)",
            }}>
              <span>Nama Kategori</span><span>Rentang Poin</span><span />
            </div>
            {items.map(item => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "1fr 140px 36px",
                padding: "11px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.nama}</span>
                <span style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600, color: poinColor }}>
                  {item.poinMin}–{item.poinMax}
                </span>
                <button
                  onClick={() => onDelete(item.id)}
                  style={{ background: "transparent", border: "none", color: "var(--ink-faint)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                  title="Hapus"
                >
                  <IconX />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <AddRangeModal
          namaPlaceholder={namaPlaceholder}
          onClose={() => setShowModal(false)}
          onSave={(nama, poinMin, poinMax) => { onAdd(nama, poinMin, poinMax); setShowModal(false); }}
        />
      )}
    </div>
  );
}

// ---------- Pelanggaran ----------
export function PelanggaranManager({ items }: { items: KatItem[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  void pending;

  function add(nama: string, poinMin: number, poinMax: number) {
    start(async () => {
      const res = await addKategoriPelanggaranAction({ nama, poinMin, poinMax });
      if (res.ok) { toast("Kategori ditambahkan."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }
  function del(id: string) {
    start(async () => {
      const res = await deleteKategoriPelanggaranAction(id);
      if (res.ok) { toast("Kategori dihapus."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  return (
    <RangeKategoriTable
      items={items}
      namaPlaceholder="mis. Kerapihan dan Pakaian"
      poinColor="var(--bad)"
      onAdd={add}
      onDelete={del}
    />
  );
}

// ---------- Prestasi ----------
export function PrestasiManager({ items }: { items: KatItem[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  void pending;

  function add(nama: string, poinMin: number, poinMax: number) {
    start(async () => {
      const res = await addKategoriPrestasiAction({ nama, poinMin, poinMax });
      if (res.ok) { toast("Kategori ditambahkan."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }
  function del(id: string) {
    start(async () => {
      const res = await deleteKategoriPrestasiAction(id);
      if (res.ok) { toast("Kategori dihapus."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  return (
    <RangeKategoriTable
      items={items}
      namaPlaceholder="mis. Akademik"
      poinColor="var(--good)"
      onAdd={add}
      onDelete={del}
    />
  );
}
