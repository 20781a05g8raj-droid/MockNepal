import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    let redirectUrl = "/student/dashboard";
    if (user.role === "ADMIN" || user.role === "CONTENT_EDITOR" || user.role === "OWNER") {
      redirectUrl = "/admin/dashboard";
    }

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
  }
}
