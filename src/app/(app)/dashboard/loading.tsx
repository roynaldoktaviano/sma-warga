import { Sk } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="shell">
      {/* Page head */}
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={80} h={11} />
          <Sk w={160} h={26} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[100, 110, 100, 100, 120].map((w, i) => (
            <Sk key={i} w={w} h={34} r={8} />
          ))}
        </div>
      </div>

      {/* Stat cards */}
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

      {/* Roster */}
      <div className="card" style={{ overflow: "hidden", marginTop: 0 }}>
        {/* Header row */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", gap: 16 }}>
          {[160, 80, 60, 80, 60, 80].map((w, i) => (
            <Sk key={i} w={w} h={11} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "12px 16px", borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <Sk w={28} h={28} r={28} />
            <Sk w={160} h={13} />
            <Sk w={70} h={13} />
            <Sk w={50} h={13} />
            <Sk w={70} h={13} />
            <Sk w={50} h={22} r={20} />
            <div style={{ marginLeft: "auto" }}><Sk w={60} h={24} r={20} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
