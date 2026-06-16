// ============================================================
// Lentera — helper sesi sisi server (cookie httpOnly) + guard role.
// Hanya dipakai di Server Components / Server Actions / Route Handlers.
// ============================================================
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Session,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySessionToken,
} from "./session";

export type { Session } from "./session";

export async function createSession(payload: Session): Promise<void> {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}

// Wajib login — kalau tidak, ke /login
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

// Wajib staff (Kesiswaan/BKA)
export async function requireStaff(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.kind !== "staff") redirect("/ortu");
  return s;
}

// Wajib siswa (untuk halaman pantauan)
export async function requireSiswa(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.kind !== "siswa") redirect("/dashboard");
  return s;
}
