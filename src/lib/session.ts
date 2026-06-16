// ============================================================
// Lentera — sesi (JWT). Modul ini AMAN untuk Edge/middleware:
// hanya memakai `jose`, tanpa next/headers.
// ============================================================
import { SignJWT, jwtVerify } from "jose";

export type SessionKind = "staff" | "siswa";
export type SessionRole = "KESISWAAN" | "BKA";

export type Session = {
  sub: string; // id user (Staff.id atau Siswa.id)
  kind: SessionKind;
  role?: SessionRole; // hanya untuk staff
  name: string; // nama tampilan
};

export const SESSION_COOKIE = "lentera_session";
const ALG = "HS256";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET belum di-set di environment (.env)");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT({ kind: payload.kind, role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      kind: payload.kind as SessionKind,
      role: payload.role as SessionRole | undefined,
      name: (payload.name as string) ?? "",
    };
  } catch {
    return null;
  }
}
