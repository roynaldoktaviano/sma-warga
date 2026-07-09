import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk w={60} h={11} />
          <Sk w={180} h={28} />
        </div>
        <Sk w={140} h={36} r={8} />
      </div>

      <div className="stats">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat">
            <Sk w={38} h={38} r={10} />
            <Sk w={100} h={12} />
            <Sk w={56} h={34} />
            <Sk w={130} h={11} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Sk w={130} h={12} r={4} />
        <div className="card" style={{ overflow: "hidden", marginTop: 10 }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: "1px solid var(--line-soft)" }}>
              <Sk w={32} h={32} r={32} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <Sk w={140} h={13} />
                <Sk w={90} h={11} />
              </div>
              <Sk w={80} h={12} />
              <Sk w={50} h={12} />
              <Sk w={66} h={22} r={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
