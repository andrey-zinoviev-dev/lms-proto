import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient, Prisma } from "../src/app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});

interface SeedData {
  courses: Prisma.CourseUncheckedCreateInput[];
  lessons: Prisma.LessonUncheckedCreateInput[];
  annotations: Prisma.AnnotationUncheckedCreateInput[];
}

function loadSeedData() {
  const path = join(__dirname, "seed-data.json");
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as SeedData;
}

async function main() {
  const data = loadSeedData();

  for (const course of data.courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      create: course,
      update: { title: course.title, authorId: course.authorId },
    });
  }

  for (const lesson of data.lessons) {
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      create: {
        id: lesson.id,
        title: lesson.title,
        courseId: lesson.courseId,
        contentJson: lesson.contentJson,
      },
      update: {
        title: lesson.title,
        courseId: lesson.courseId,
        contentJson: lesson.contentJson,
      },
    });
  }

  for (const ann of data.annotations) {
    await prisma.annotation.upsert({
      where: {
        blockId_userId_type: {
          blockId: ann.blockId,
          userId: ann.userId,
          type: ann.type,
        },
      },
      create: {
        blockId: ann.blockId,
        userId: ann.userId,
        type: ann.type,
        lessonId: ann.lessonId,
      },
      update: { lessonId: ann.lessonId },
    });
  }

  console.log(
    `Seed completed: ${data.courses.length} courses, ${data.lessons.length} lessons, ${data.annotations.length} annotations.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });