import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { planId, paymentProvider } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const plan = await db.packagePlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Invalid plan or inactive offering" }, { status: 404 });
    }

    const transactionRef = `NEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await db.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amountNpr: plan.priceNpr,
        paymentProvider: paymentProvider || "ESEWA",
        transactionRef,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      transactionRef: order.transactionRef,
      amountNpr: order.amountNpr,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create pending order" }, { status: 500 });
  }
}
