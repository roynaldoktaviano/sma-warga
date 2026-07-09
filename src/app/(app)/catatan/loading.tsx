import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk w={80} h={11} />
          <Sk w={240} h={28} />
        </div>
        <Sk w={130} h={36} r={8} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 70px 110px 90px", padding: "10px 16px", borderBottom: "1px solid var(--line)", gap: 12 }}>
          {[null, 80, 40, 70, 60].map((w, i) => <Sk key={i} w={w ?? "100%"} h={11} />)}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px 70px 110px 90px", padding: "12px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Sk w={150} h={13} />
              <Sk w={100} h={11} />
            </div>
            <Sk w={90} h={13} />
            <Sk w={36} h={14} />
            <Sk w={90} h={13} />
            <Sk w={66} h={22} r={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
