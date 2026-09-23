import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { commitValidImportRows } from "@/lib/excel";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await db.importJob.findUnique({
      where: { id: jobId },
      include: { rows: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 });
    }

    if (job.status === "COMMITTED") {
      return NextResponse.json({ error: "This import job has already been committed." }, { status: 400 });
    }

    const validRows = job.rows
      .filter((r) => r.isValid)
      .map((r) => ({
        rowNumber: r.rowNumber,
        raw: JSON.parse(r.rawJson),
        isValid: true,
        errors: [],
        warnings: [],
      }));

    if (validRows.length === 0) {
      return NextResponse.json({ error: "No valid rows available to import." }, { status: 400 });
    }

    const importedCount = await commitValidImportRows(job.id, user.id, validRows);

    return NextResponse.json({
      success: true,
      importedCount,
      jobId: job.id,
    });
  } catch (error: any) {
    console.error("Excel commit error:", error);
    return NextResponse.json({ error: "Failed to commit import: " + error.message }, { status: 500 });
  }
}
