import { db } from "@/lib/db";
import SyllabusManagerClient from "./SyllabusManagerClient";

export default async function AdminSyllabusPage() {
  const exams = await db.exam.findMany({
    include: {
      syllabi: {
        include: {
          subjects: {
            include: {
              topics: {
                include: {
                  _count: {
                    select: { questions: true, notes: true },
                  },
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return <SyllabusManagerClient exams={exams as any} />;
}
