import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="shell">
      <Sk w={100} h={32} r={8} />
      <div className="detail-grid" style={{ marginTop: 16 }}>
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Sk w={48} h={48} r={48} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Sk w={140} h={15} />
              <Sk w={80} h={12} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <Sk w={70} h={12} /><Sk w={100} h={12} />
              </div>
            ))}
          </div>
          <Sk w={56} h={38} />
          <Sk h={8} r={4} />
          <div className="minis">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mini">
                <Sk w={36} h={22} /><Sk w={64} h={11} />
              </div>
            ))}
          </div>
          <Sk h={36} r={8} />
        </div>
        <div className="card">
          <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between" }}>
            <Sk w={130} h={16} /><Sk w={60} h={13} />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, padding: "13px 20px", borderTop: "1px solid var(--line-soft)" }}>
              <Sk w={28} h={28} r={6} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Sk w="60%" h={13} /><Sk w="40%" h={11} />
              </div>
              <Sk w={36} h={22} r={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
