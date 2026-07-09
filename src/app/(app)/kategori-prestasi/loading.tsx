import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk w={80} h={11} />
          <Sk w={220} h={28} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Sk w={110} h={36} r={8} />
          <Sk w={120} h={36} r={8} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Sk w={150} h={36} r={8} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 80px 36px", padding: "10px 16px", borderBottom: "1px solid var(--line)", gap: 12 }}>
          {[null, 90, 50, 20].map((w, i) => <Sk key={i} w={w ?? "100%"} h={11} />)}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 80px 36px", padding: "12px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center", gap: 12 }}>
            <Sk h={14} />
            <Sk w={100} h={22} r={4} />
            <Sk w={40} h={14} />
            <Sk w={20} h={20} r={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
