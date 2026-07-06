import { Sk } from "@/components/Skeleton";

export default function OrtuLoading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={120} h={11} />
          <Sk w={180} h={26} />
        </div>
      </div>

      <div className="parent-hero">
        {/* Profile top */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
          <Sk w={56} h={56} r={56} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Sk w={160} h={18} />
            <Sk w={110} h={13} />
          </div>
        </div>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <Sk w={64} h={48} r={4} />
          <Sk w={90} h={13} />
        </div>
        <Sk w={100} h={26} r={20} />

        {/* Message */}
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk h={13} />
          <Sk w={"80%"} h={13} />
        </div>

        {/* Meter */}
        <Sk h={10} r={10} />

        {/* Minis */}
        <div className="minis">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mini">
              <Sk w={36} h={24} />
              <Sk w={64} h={11} />
            </div>
          ))}
        </div>
      </div>

      {/* Ledger */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between" }}>
          <Sk w={130} h={16} />
          <Sk w={70} h={13} />
        </div>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid", gridTemplateColumns: "28px 1fr auto",
              gap: 12, padding: "13px 20px", borderTop: "1px solid var(--line-soft)",
            }}
          >
            <Sk w={28} h={28} r={8} />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <Sk w={"60%"} h={13} />
              <Sk w={"40%"} h={11} />
              <Sk w={130} h={11} />
            </div>
            <Sk w={36} h={20} />
          </div>
        ))}
      </div>
    </div>
  );
}
