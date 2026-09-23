import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    // Validate type (must be PDF)
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Only PDF documents (.pdf) are allowed." }, { status: 400 });
    }

    // Size limit: 30MB
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds limit (max 30MB)." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Target directory: public/uploads/notes
    const uploadDir = path.join(process.cwd(), "public", "uploads", "notes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sanitize filename
    const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}_${cleanOriginalName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/notes/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    return NextResponse.json({ error: "Failed to upload PDF document" }, { status: 500 });
  }
}
