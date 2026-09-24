import { cookies } from "next/headers";
import { db } from "./db";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "nepal_exam_auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  targetExamId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    if (!data.id) return null;

    const user = await db.user.findUnique({
      where: { id: data.id },
      include: { profile: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      targetExamId: user.profile?.targetExamId,
    };
  } catch {
    return null;
  }
}

export async function setSessionUser(user: { id: string; email: string; name: string; role: string }) {
  const cookieStore = await cookies();
  const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString("base64");
  
  // Persistent session for 1 year (365 days) so user stays logged in
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 365 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
