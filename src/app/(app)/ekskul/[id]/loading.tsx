import { Sk } from "@/components/Skeleton";

export default function EkskulDetailLoading() {
  return (
    <div className="shell">
      <Sk w={100} h={30} r={8} />

      <div className="page-head" style={{ marginTop: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Sk w={80} h={11} />
          <Sk w={200} h={28} />
          <Sk w={160} h={13} />
        </div>
        <Sk w={100} h={22} r={4} />
      </div>

      <div className="detail-grid">
        {/* Left: guru + anggota */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Guru card */}
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Sk w={100} h={15} />
              <Sk w={60} h={28} r={8} />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Sk w={28} h={28} r={28} />
                <Sk w={130} h={13} />
              </div>
            ))}
          </div>

          {/* Anggota card */}
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Sk w={120} h={15} />
              <Sk w={80} h={28} r={8} />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="ekskul-anggota-row">
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <Sk w={140} h={13} />
                  <Sk w={90} h={11} />
                </div>
                <Sk w={28} h={28} r={8} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: presensi */}
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <Sk w={80} h={15} />
            <Sk w={130} h={30} r={8} />
          </div>
          {[...Array(3)].map((_, gi) => (
            <div key={gi} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Sk w={110} h={14} />
                <Sk w={60} h={12} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[...Array(6)].map((_, i) => (
                  <Sk key={i} w={80} h={22} r={20} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
