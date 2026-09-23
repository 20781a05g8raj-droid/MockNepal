import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateExcelBuffer } from "@/lib/excel";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Only .xlsx (or .csv) spreadsheets are supported." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate buffer according to PRD Section 9
    const parseResult = await validateExcelBuffer(buffer, file.name);

    // Create persistent ImportJob
    const job = await db.importJob.create({
      data: {
        filename: file.name,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRowsCount,
        invalidRows: parseResult.invalidRowsCount,
        status: "PARSED",
        uploadedBy: user.id,
      },
    });

    // Store ImportRow records
    for (const row of parseResult.rowResults) {
      await db.importRow.create({
        data: {
          jobId: job.id,
          rowNumber: row.rowNumber,
          rawJson: JSON.stringify(row.raw),
          isValid: row.isValid,
          validationErrors: row.errors.length > 0 ? JSON.stringify(row.errors) : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      filename: parseResult.filename,
      totalRows: parseResult.totalRows,
      validRowsCount: parseResult.validRowsCount,
      invalidRowsCount: parseResult.invalidRowsCount,
      rowResults: parseResult.rowResults,
    });
  } catch (error: any) {
    console.error("Excel validation error:", error);
    return NextResponse.json({ error: "Failed to parse spreadsheet: " + error.message }, { status: 500 });
  }
}
