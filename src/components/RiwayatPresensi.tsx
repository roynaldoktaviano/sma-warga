const STATUS_LABEL: Record<string, string> = { HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa" };

export type RiwayatPresensiRow = {
  id: string;
  tanggal: Date | string;
  status: string;
  keterangan: string | null;
  ekskulNama?: string;
};

function monthLabel(d: Date): string {
  const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayLabel(d: Date): string {
  const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Daftar presensi, dikelompokkan per bulan supaya rapi walau riwayatnya panjang
// (sebelumnya semua baris ditumpuk rata tanpa pembatas apa pun).
export function RiwayatPresensi({ rows, ekskul }: { rows: RiwayatPresensiRow[]; ekskul?: boolean }) {
  const groups: { key: string; label: string; rows: RiwayatPresensiRow[] }[] = [];
  for (const r of rows) {
    const d = new Date(r.tanggal);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(r);
    else groups.push({ key, label: monthLabel(d), rows: [r] });
  }

  return (
    <>
      {groups.map((g) => (
        <div key={g.key}>
          <div className="riwayat-month-label">{g.label}</div>
          {g.rows.map((r) => (
            <div key={r.id} className={"riwayat-row" + (ekskul ? " riwayat-row--ekskul" : "")}>
              {ekskul && <span className="riwayat-ekskul-name">{r.ekskulNama}</span>}
              <span className="riwayat-date">{dayLabel(new Date(r.tanggal))}</span>
              <span className={`absen-pill absen-pill--${r.status.toLowerCase()}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
              <span className="riwayat-ket">{r.keterangan || ""}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
