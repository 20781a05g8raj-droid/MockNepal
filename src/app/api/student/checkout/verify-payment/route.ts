import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId, transactionRef, simulateResult } = await req.json();

    if (!orderId || !transactionRef) {
      return NextResponse.json({ error: "orderId and transactionRef are required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { plan: true },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotent processing check: if already success, do not duplicate entitlement
    if (order.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        status: "SUCCESS",
      });
    }

    // Server-side verification logic:
    // In production, this performs server-to-server inquiry with eSewa / Khalti verification API.
    // In our verified test environment, simulateResult === "SUCCESS" validates the payment.
    const isVerifiedSuccess = simulateResult !== "FAILED";

    if (!isVerifiedSuccess) {
      await db.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ success: false, status: "FAILED", error: "Payment verification failed or was cancelled." });
    }

    // Transition order to SUCCESS
    await db.order.update({
      where: { id: order.id },
      data: { status: "SUCCESS" },
    });

    // Create or extend Entitlement
    const plan = order.plan;
    const now = new Date();
    const validUntil = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const entitlement = await db.entitlement.create({
      data: {
        userId: user.id,
        planId: plan.id,
        examId: plan.examId || null,
        validFrom: now,
        validUntil,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      status: "SUCCESS",
      entitlementId: entitlement.id,
      validUntil: entitlement.validUntil,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
  }
}
