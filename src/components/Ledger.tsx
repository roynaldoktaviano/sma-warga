import { fmtTanggal } from "@/lib/format";
import { IconUp, IconDown, IconEmpty, IconCheck, IconX } from "./icons";
import { DeleteRecordButton } from "./DeleteRecordButton";
import { VerifikasiButton } from "./VerifikasiButton";

export type LedgerEntry = {
  id: string;
  poin: number;
  kategori: string;
  keterangan: string | null;
  tanggal: Date;
  pencatatNama: string;
  statusVerif: string;
  verifikasiWakaNama?: string | null;
  verifikasiKepsekNama?: string | null;
};

const VERIF_LABEL: Record<string, string> = {
  PENDING:  "Menunggu verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};

export function Ledger({
  catatan,
  canDelete,
  canVerify,
  role,
}: {
  catatan: LedgerEntry[];
  canDelete: boolean;
  canVerify?: boolean;
  role?: string;
}) {
  return (
    <div className="card">
      <div className="ledger-head">
        <div className="ledger-title">Riwayat Catatan</div>
        <div className="ledger-count">{catatan.length} catatan</div>
      </div>

      {catatan.length === 0 ? (
        <div className="empty">
          <IconEmpty />
          <b>Belum ada catatan</b>
          <p>Riwayat poin akan muncul di sini.</p>
        </div>
      ) : (
        <div className="ledger">
          {catatan.map((r) => {
            const up       = r.poin >= 0;
            const pending  = r.statusVerif === "PENDING";
            const rejected = r.statusVerif === "REJECTED";
            const verified = r.statusVerif === "VERIFIED";

            // Apakah role ini sudah verifikasi?
            const wakaVerified   = !!r.verifikasiWakaNama;
            const kepsekVerified = !!r.verifikasiKepsekNama;
            const thisRoleVerified =
              (role === "KESISWAAN" && wakaVerified) ||
              (role === "KEPSEK"    && kepsekVerified);

            return (
              <div className={"entry" + (rejected ? " entry--rejected" : "")} key={r.id}>
                <div
                  className="entry-ic"
                  style={
                    rejected ? { background: "var(--bad-bg)", color: "var(--bad)" }
                    : up ? { background: "var(--good-bg)", color: "var(--good)" }
                    : { background: "var(--bad-bg)", color: "var(--bad)" }
                  }
                >
                  {rejected ? <IconX /> : up ? <IconUp /> : <IconDown />}
                </div>
                <div className="entry-main">
                  <div className="entry-cat">{r.kategori}</div>
                  {r.keterangan ? <div className="entry-desc">{r.keterangan}</div> : null}
                  <div className="entry-meta">
                    <span>{fmtTanggal(r.tanggal)}</span>
                    <i className="sep" />
                    <span>{r.pencatatNama}</span>
                  </div>
                  {/* Status verifikasi */}
                  <div className="verif-row">
                    <span className={
                      "verif-badge " +
                      (verified ? "verif-badge--verified" : rejected ? "verif-badge--rejected" : "verif-badge--pending")
                    }>
                      {VERIF_LABEL[r.statusVerif] ?? r.statusVerif}
                    </span>
                    {(pending || verified) && (
                      <>
                        <span className={"verif-check" + (wakaVerified ? " verif-check--done" : "")}>
                          {wakaVerified ? "✓" : "○"} Waka{wakaVerified ? ` (${r.verifikasiWakaNama})` : ""}
                        </span>
                        <span className={"verif-check" + (kepsekVerified ? " verif-check--done" : "")}>
                          {kepsekVerified ? "✓" : "○"} Kepsek{kepsekVerified ? ` (${r.verifikasiKepsekNama})` : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="entry-right">
                  {!rejected && (
                    <span className={"delta " + (pending ? "pending" : up ? "up" : "down")}>
                      {pending ? "?" : up ? "+" : "−"}
                      {pending ? "" : Math.abs(r.poin)}
                    </span>
                  )}
                  {canVerify && pending && !thisRoleVerified && (
                    <VerifikasiButton catatanId={r.id} role={role!} />
                  )}
                  {canDelete && !verified && <DeleteRecordButton recordId={r.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
