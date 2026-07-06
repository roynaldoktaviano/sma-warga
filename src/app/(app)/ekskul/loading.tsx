import { Sk } from "@/components/Skeleton";

export default function EkskulLoading() {
  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk w={120} h={11} />
          <Sk w={180} h={26} />
        </div>
        <Sk w={130} h={34} r={8} />
      </div>

      {[...Array(2)].map((_, gi) => (
        <div key={gi} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sk w={120} h={16} />
              <Sk w={70} h={20} r={4} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Sk w={80} h={30} r={8} />
              <Sk w={70} h={30} r={8} />
            </div>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="ekskul-head">
              {[null, null, null, null].map((_, i) => (
                <Sk key={i} w={"70%"} h={11} />
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="ekskul-row">
                <Sk w={"70%"} h={14} />
                <Sk w={"60%"} h={13} />
                <Sk w={60} h={13} />
                <Sk w={64} h={20} r={4} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
