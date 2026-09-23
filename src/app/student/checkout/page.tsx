import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import CheckoutForm from "./CheckoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CheckoutPageProps {
  searchParams: Promise<{ planId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { planId } = await searchParams;
  if (!planId) redirect("/pricing");

  const plan = await db.packagePlan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.isActive) notFound();

  const features = JSON.parse(plan.featuresJson || "[]") as string[];

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link href="/pricing" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Pricing</span>
      </Link>

      <CheckoutForm
        plan={{
          id: plan.id,
          title: plan.title,
          durationDays: plan.durationDays,
          priceNpr: plan.priceNpr,
          coverageType: plan.coverageType,
          features,
        }}
      />
    </div>
  );
}
