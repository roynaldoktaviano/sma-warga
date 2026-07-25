export default function Loading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="sk" style={{ width: 80, height: 11, marginBottom: 6 }} />
          <div className="sk" style={{ width: 180, height: 26 }} />
        </div>
        <div className="sk" style={{ width: 130, height: 34, borderRadius: 6 }} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 80px 100px", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--line-soft)" }}>
            <div className="sk" style={{ width: "60%", height: 16 }} />
            <div className="sk" style={{ width: 70, height: 22, borderRadius: 4 }} />
            <div className="sk" style={{ width: 50, height: 16 }} />
            <div className="sk" style={{ width: 50, height: 16 }} />
            <div className="sk" style={{ width: 60, height: 24, borderRadius: 4 }} />
            <div className="sk" style={{ width: 80, height: 28, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
