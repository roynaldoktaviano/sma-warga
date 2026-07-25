export default function Loading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="sk" style={{ width: 100, height: 11, marginBottom: 6 }} />
          <div className="sk" style={{ width: 120, height: 26 }} />
        </div>
        <div className="sk" style={{ width: 120, height: 34, borderRadius: 6 }} />
      </div>
      <div className="kelas-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card kelas-card-full">
            <div className="kelas-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="sk" style={{ width: 40, height: 40, borderRadius: 8 }} />
                <div>
                  <div className="sk" style={{ width: 60, height: 16, marginBottom: 5 }} />
                  <div className="sk" style={{ width: 50, height: 12 }} />
                </div>
              </div>
            </div>
            <div className="kelas-wali">
              <div className="sk" style={{ width: 60, height: 11 }} />
              <div className="sk" style={{ width: 120, height: 14 }} />
            </div>
            {[1, 2, 3].map(j => (
              <div key={j} className="kelas-anggota-row" style={{ pointerEvents: "none" }}>
                <div className="sk" style={{ width: 20, height: 14 }} />
                <div className="sk" style={{ width: "60%", height: 14 }} />
                <div className="sk" style={{ width: 40, height: 12 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
