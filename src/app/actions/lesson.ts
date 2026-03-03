"use server";

import prisma from "@/app/lib/prisma";

export async function saveLessonContent(lessonId: string, contentJson: unknown) {
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { contentJson: contentJson as object },
  });
}
