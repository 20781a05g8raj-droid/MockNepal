import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExcelImportWizard from "./ExcelImportWizard";

export default function AdminImportPage() {
  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link href="/admin/questions" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Question Bank</span>
      </Link>

      <ExcelImportWizard />
    </div>
  );
}
