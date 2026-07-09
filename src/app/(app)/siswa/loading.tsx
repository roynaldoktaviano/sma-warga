import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk w={60} h={11} />
          <Sk w={160} h={28} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[110, 120, 120, 130].map((w, i) => <Sk key={i} w={w} h={36} r={8} />)}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <Sk h={36} r={8} />
          <Sk w={140} h={36} r={8} />
          <Sk w={110} h={36} r={8} />
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: "1px solid var(--line-soft)" }}>
            <Sk w={32} h={32} r={32} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <Sk w={150} h={13} />
              <Sk w={100} h={11} />
            </div>
            <Sk w={70} h={12} />
            <Sk w={30} h={12} />
            <Sk w={50} h={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
