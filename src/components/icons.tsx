import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (extra: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...extra,
});

export const IconPlus = (p: P) => (
  <svg {...base(p)} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </svg>
);

export const IconBack = (p: P) => (
  <svg {...base(p)} strokeWidth={2.2}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconUp = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const IconDown = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)} strokeWidth={2.2}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const IconWarn = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const IconInfo = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const IconEmpty = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v6l9 4 9-4V7" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
);

export const IconGauge = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M12 14l4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

export const IconPen = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const IconUpload = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)} strokeWidth={2.2}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const IconTrophy = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M6 9H3.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h2.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22v-4" />
    <path d="M14 22v-4" />
    <path d="M6 4v8a6 6 0 0 0 12 0V4" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconClipboard = (p: P) => (
  <svg {...base(p)} strokeWidth={1.8}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
