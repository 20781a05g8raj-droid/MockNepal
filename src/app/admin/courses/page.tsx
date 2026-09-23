import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminCoursesClient from "./AdminCoursesClient";

export default async function AdminCoursesPage() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    redirect("/login");
  }

  const exams = await db.exam.findMany({
    include: {
      category: true,
      syllabi: {
        include: {
          subjects: {
            include: {
              _count: { select: { topics: true, questions: true } },
            },
          },
        },
      },
      _count: {
        select: {
          questionExams: true,
          mockTests: true,
          profiles: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const categories = await db.examCategory.findMany({
    orderBy: { order: "asc" },
  });

  const formattedExams = exams.map((ex) => {
    const subjects = ex.syllabi[0]?.subjects || [];
    const topicsCount = subjects.reduce((acc, s) => acc + s._count.topics, 0);

    return {
      id: ex.id,
      title: ex.title,
      code: ex.code,
      description: ex.description,
      categoryId: ex.categoryId,
      categoryName: ex.category?.name || "General",
      categoryCode: ex.category?.code || "GENERAL",
      isActive: ex.isActive,
      order: ex.order,
      subjectsCount: subjects.length,
      topicsCount,
      questionsCount: ex._count.questionExams,
      mockTestsCount: ex._count.mockTests,
      studentsCount: ex._count.profiles,
    };
  });

  return (
    <AdminCoursesClient
      initialCourses={formattedExams}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
