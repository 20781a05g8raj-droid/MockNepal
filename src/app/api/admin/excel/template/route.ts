import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generateExcelTemplate } from "@/lib/excel";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buffer = await generateExcelTemplate();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="Lok_Sewa_Question_Import_Template.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Template generation error:", error);
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
  }
}
