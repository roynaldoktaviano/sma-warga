import { Sk } from "@/components/Skeleton";

export default function SiswaDetailLoading() {
  return (
    <div className="shell">
      <Sk w={100} h={30} r={8} />

      <div className="detail-grid" style={{ marginTop: 16 }}>
        {/* Profile card */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Sk w={56} h={56} r={56} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Sk w={160} h={16} />
              <Sk w={90} h={12} />
            </div>
          </div>

          {/* Info list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <Sk w={60} h={12} />
                <Sk w={100} h={12} />
              </div>
            ))}
          </div>

          {/* Score */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <Sk w={56} h={40} />
            <Sk w={120} h={13} />
          </div>
          <Sk h={10} r={10} />
          <Sk h={28} r={8} />

          {/* Minis */}
          <div className="minis">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mini">
                <Sk w={36} h={24} />
                <Sk w={64} h={11} />
              </div>
            ))}
          </div>

          <Sk h={36} r={8} />
          <Sk h={36} r={8} />
          <Sk h={36} r={8} />
        </div>

        {/* Ledger card */}
        <div className="card">
          <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between" }}>
            <Sk w={130} h={16} />
            <Sk w={70} h={13} />
          </div>
          {[...Array(5)].map((_, i) => (
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
    </div>
  );
}
