"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "./icons";

export function ModalShell({
  title,
  onClose,
  children,
  footer,
  ariaLabel,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  ariaLabel?: string;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={"modal" + (wide ? " modal--wide" : "")} role="dialog" aria-modal="true" aria-label={ariaLabel || title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-x" onClick={onClose} aria-label="Tutup">
            <IconX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  );
}
