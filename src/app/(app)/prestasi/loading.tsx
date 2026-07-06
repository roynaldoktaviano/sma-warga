import { Sk } from "@/components/Skeleton";

export default function PrestasiLoading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={80} h={11} />
          <Sk w={160} h={26} />
        </div>
        <Sk w={130} h={34} r={8} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", gap: 16 }}>
          {[90, 150, 80, 80, 120].map((w, i) => <Sk key={i} w={w} h={11} />)}
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "11px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center" }}>
            <Sk w={80} h={13} />
            <Sk w={150} h={13} />
            <Sk w={70} h={13} />
            <Sk w={70} h={13} />
            <Sk w={110} h={13} />
            <div style={{ marginLeft: "auto" }}><Sk w={28} h={28} r={8} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
