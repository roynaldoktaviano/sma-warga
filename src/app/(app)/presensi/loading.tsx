import { Sk } from "@/components/Skeleton";

export default function PresensiLoading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={80} h={11} />
          <Sk w={180} h={26} />
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat">
            <Sk w={36} h={36} r={10} />
            <Sk w={90} h={11} />
            <Sk w={60} h={32} />
            <Sk w={120} h={11} />
          </div>
        ))}
      </div>

      {/* Section label */}
      <div style={{ marginBottom: 12 }}><Sk w={220} h={11} /></div>

      {/* Kelas grid */}
      <div className="kelas-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="kelas-card">
            <div className="kelas-card-top">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Sk w={80} h={17} />
                <Sk w={60} h={12} />
              </div>
              <Sk w={120} h={30} r={8} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Sk w={110} h={11} />
                <Sk w={60} h={11} />
              </div>
              <Sk h={5} r={10} />
            </div>
          </div>
        ))}
      </div>

      {/* Riwayat */}
      <div style={{ marginTop: 28 }}>
        <div style={{ marginBottom: 10 }}><Sk w={200} h={11} /></div>
        <div className="card" style={{ overflow: "hidden" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "12px 18px", borderBottom: "1px solid var(--line-soft)", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                <Sk w={130} h={14} />
                <Sk w={70} h={11} />
              </div>
              <Sk w={90} h={13} />
              <Sk w={55} h={22} r={20} />
              <Sk w={110} h={12} />
              <Sk w={28} h={28} r={8} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
