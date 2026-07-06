import { Sk } from "@/components/Skeleton";

export default function PengaturanLoading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={60} h={11} />
          <Sk w={180} h={26} />
        </div>
      </div>

      {/* Account section */}
      <div className="settings-grid">
        {/* Avatar card */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Sk w={72} h={72} r={72} />
          <Sk w={140} h={16} />
          <Sk w={100} h={13} />
          <Sk w={110} h={13} />
        </div>

        {/* Form card */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Sk w={80} h={11} />
              <Sk h={38} r={8} />
            </div>
          ))}
          <Sk h={36} r={8} />
        </div>
      </div>

      {/* Staff list */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <Sk w={160} h={18} />
          <Sk w={120} h={34} r={8} />
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "11px 16px", borderBottom: "1px solid var(--line-soft)", alignItems: "center" }}>
              <Sk w={140} h={14} />
              <Sk w={110} h={13} />
              <Sk w={90} h={20} r={4} />
              <div style={{ marginLeft: "auto" }}><Sk w={28} h={28} r={8} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset password section */}
      <div style={{ marginTop: 24 }}>
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Sk w={180} h={16} />
          <Sk h={13} />
          <Sk w={"70%"} h={13} />
          <Sk w={160} h={36} r={8} />
        </div>
      </div>
    </div>
  );
}
