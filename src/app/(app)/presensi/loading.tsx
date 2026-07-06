import { Sk } from "@/components/Skeleton";

export default function PresensiLoading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={80} h={11} />
          <Sk w={160} h={26} />
        </div>
        <Sk w={140} h={34} r={8} />
      </div>

      {/* Stats */}
      <div className="stats">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="stat">
            <Sk w={36} h={36} r={10} />
            <Sk w={90} h={11} />
            <Sk w={60} h={32} />
            <Sk w={120} h={11} />
          </div>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", gap: 16 }}>
          {[100, 80, 70, 80, 100].map((w, i) => <Sk key={i} w={w} h={11} />)}
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "11px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center" }}>
            <Sk w={90} h={13} />
            <Sk w={130} h={13} />
            <Sk w={70} h={13} />
            <Sk w={55} h={20} r={20} />
            <div style={{ marginLeft: "auto" }}><Sk w={28} h={28} r={8} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
