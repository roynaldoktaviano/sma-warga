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

type KatItem = { id: string; nama: string; tingkatan: string; poin: number };
type TingkatOpt = { value: string; label: string };

const TINGKAT_PELANGGARAN: TingkatOpt[] = [
  { value: "RINGAN", label: "Ringan" },
  { value: "SEDANG", label: "Sedang" },
  { value: "BERAT",  label: "Berat"  },
];
const TINGKAT_PRESTASI: TingkatOpt[] = [
  { value: "SEKOLAH",      label: "Sekolah"      },
  { value: "KECAMATAN",    label: "Kecamatan"    },
  { value: "KOTA",         label: "Kota"         },
  { value: "PROVINSI",     label: "Provinsi"     },
  { value: "NASIONAL",     label: "Nasional"     },
  { value: "INTERNASIONAL",label: "Internasional"},
];

const TINGKAT_COLOR: Record<string, { bg: string; color: string }> = {
  RINGAN:       { bg: "var(--warn-bg)",      color: "var(--warn)"     },
  SEDANG:       { bg: "#fff0f0",             color: "#e05252"         },
  BERAT:        { bg: "var(--bad-bg)",       color: "var(--bad)"      },
  SEKOLAH:      { bg: "var(--line-soft)",    color: "var(--ink-soft)" },
  KECAMATAN:    { bg: "var(--accent-soft)",  color: "var(--accent)"   },
  KOTA:         { bg: "var(--accent-soft)",  color: "var(--accent)"   },
  PROVINSI:     { bg: "var(--good-bg)",      color: "var(--good)"     },
  NASIONAL:     { bg: "var(--good-bg)",      color: "var(--good)"     },
  INTERNASIONAL:{ bg: "#f3f0ff",             color: "#7c3aed"         },
};

function TingkatBadge({ t }: { t: string }) {
  const c = TINGKAT_COLOR[t] ?? { bg: "var(--line-soft)", color: "var(--ink-soft)" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.color }}>
      {t.charAt(0) + t.slice(1).toLowerCase()}
    </span>
  );
}

function AddModal({
  title,
  tingkatanOpts,
  onSave,
  onClose,
}: {
  title: string;
  tingkatanOpts: TingkatOpt[];
  onSave: (nama: string, tingkatan: string, poin: number) => void;
  onClose: () => void;
}) {
  const [nama, setNama]         = useState("");
  const [tingkatan, setTingkatan] = useState(tingkatanOpts[0].value);
  const [poin, setPoin]         = useState(10);

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button
            className="btn btn-accent"
            onClick={() => { if (nama.trim() && poin > 0) onSave(nama.trim(), tingkatan, poin); }}
            disabled={!nama.trim() || poin <= 0}
          >
            Simpan
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field-label">Nama</label>
        <input className="input" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama kategori" autoFocus />
      </div>
      <div className="two">
        <div className="field">
          <label className="field-label">Tingkatan</label>
          <select className="input" value={tingkatan} onChange={e => setTingkatan(e.target.value)}>
            {tingkatanOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Poin</label>
          <input className="input" type="number" min={1} value={poin} onChange={e => setPoin(Number(e.target.value))} />
        </div>
      </div>
    </ModalShell>
  );
}

// ---------- Generic table ----------
function KategoriTable({
  items,
  tingkatanOpts,
  addLabel,
  onAdd,
  onDelete,
}: {
  items: KatItem[];
  tingkatanOpts: TingkatOpt[];
  addLabel: string;
  onAdd: (nama: string, tingkatan: string, poin: number) => void;
  onDelete: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          <IconPlus /> {addLabel}
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
              display: "grid", gridTemplateColumns: "1fr 130px 80px 36px",
              padding: "8px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-faint)",
            }}>
              <span>Nama</span><span>Tingkatan</span><span>Poin</span><span />
            </div>
            {items.map(item => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "1fr 130px 80px 36px",
                padding: "11px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.nama}</span>
                <TingkatBadge t={item.tingkatan} />
                <span style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600 }}>{item.poin}</span>
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
        <AddModal
          title={addLabel}
          tingkatanOpts={tingkatanOpts}
          onClose={() => setShowModal(false)}
          onSave={(nama, tingkatan, poin) => { onAdd(nama, tingkatan, poin); setShowModal(false); }}
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

  function add(nama: string, tingkatan: string, poin: number) {
    start(async () => {
      const res = await addKategoriPelanggaranAction({ nama, tingkatan, poin });
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
    <KategoriTable
      items={items}
      tingkatanOpts={TINGKAT_PELANGGARAN}
      addLabel="Tambah Kategori"
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

  function add(nama: string, tingkatan: string, poin: number) {
    start(async () => {
      const res = await addKategoriPrestasiAction({ nama, tingkatan, poin });
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
    <KategoriTable
      items={items}
      tingkatanOpts={TINGKAT_PRESTASI}
      addLabel="Tambah Kategori"
      onAdd={add}
      onDelete={del}
    />
  );
}
