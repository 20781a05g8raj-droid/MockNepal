import type { Metadata } from "next";
import "./globals.css";
import ExtensionErrorSuppressor from "@/components/ExtensionErrorSuppressor";

export const metadata: Metadata = {
  title: "Nepal Government Exam Preparation Platform | Lok Sewa, Banking & TSC",
  description: "Official-grade, distraction-free preparation platform for Lok Sewa Aayog, Banking, and Teacher Service exams in Nepal with verified MCQs, syllabus, notes, mock tests, and rule-based revision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ne">
      <body>
        <ExtensionErrorSuppressor />
        {children}
      </body>
    </html>
  );
}
