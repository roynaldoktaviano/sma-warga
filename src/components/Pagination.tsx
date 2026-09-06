import Link from "next/link";
import { IconChevron } from "./icons";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  noun: string;
  basePath?: string;
};

export function Pagination({ page, totalPages, total, noun, basePath = "" }: Props) {
  if (totalPages <= 1) return null;

  const prevHref = `${basePath}?page=${page - 1}`;
  const nextHref = `${basePath}?page=${page + 1}`;

  return (
    <nav className="pagination" aria-label="Navigasi halaman">
      <span className="pagination-info">
        Halaman {page} dari {totalPages} · {total} {noun}
      </span>
      <div className="pagination-nav">
        {page > 1 ? (
          <Link href={prevHref} className="btn btn-sm pagination-btn pagination-btn--prev" aria-label="Halaman sebelumnya">
            <IconChevron className="pagination-chevron pagination-chevron--prev" />
            Sebelumnya
          </Link>
        ) : (
          <span className="btn btn-sm pagination-btn pagination-btn--disabled" aria-disabled="true">
            <IconChevron className="pagination-chevron pagination-chevron--prev" />
            Sebelumnya
          </span>
        )}
        {page < totalPages ? (
          <Link href={nextHref} className="btn btn-sm pagination-btn pagination-btn--next" aria-label="Halaman berikutnya">
            Berikutnya
            <IconChevron className="pagination-chevron pagination-chevron--next" />
          </Link>
        ) : (
          <span className="btn btn-sm pagination-btn pagination-btn--disabled" aria-disabled="true">
            Berikutnya
            <IconChevron className="pagination-chevron pagination-chevron--next" />
          </span>
        )}
      </div>
    </nav>
  );
}
