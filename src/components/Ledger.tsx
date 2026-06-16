import { fmtTanggal } from "@/lib/format";
import { IconUp, IconDown, IconEmpty } from "./icons";
import { DeleteRecordButton } from "./DeleteRecordButton";

export type LedgerEntry = {
  id: string;
  poin: number;
  kategori: string;
  keterangan: string | null;
  tanggal: Date;
  pencatatNama: string;
};

export function Ledger({ catatan, canDelete }: { catatan: LedgerEntry[]; canDelete: boolean }) {
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
            const up = r.poin >= 0;
            return (
              <div className="entry" key={r.id}>
                <div
                  className="entry-ic"
                  style={
                    up
                      ? { background: "var(--good-bg)", color: "var(--good)" }
                      : { background: "var(--bad-bg)", color: "var(--bad)" }
                  }
                >
                  {up ? <IconUp /> : <IconDown />}
                </div>
                <div className="entry-main">
                  <div className="entry-cat">{r.kategori}</div>
                  {r.keterangan ? <div className="entry-desc">{r.keterangan}</div> : null}
                  <div className="entry-meta">
                    <span>{fmtTanggal(r.tanggal)}</span>
                    <i className="sep" />
                    <span>{r.pencatatNama}</span>
                  </div>
                </div>
                <div className="entry-right">
                  <span className={"delta " + (up ? "up" : "down")}>
                    {up ? "+" : "−"}
                    {Math.abs(r.poin)}
                  </span>
                  {canDelete ? <DeleteRecordButton recordId={r.id} /> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
