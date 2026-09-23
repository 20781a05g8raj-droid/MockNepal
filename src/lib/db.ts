import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getPrismaClient(): PrismaClient {
  // If an external database URL is provided (e.g. PostgreSQL, Supabase, Neon)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return new PrismaClient();
  }

  // Fallback for serverless environments (e.g. Vercel) where root filesystem is read-only
  if (process.env.VERCEL) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    
    // Check multiple candidate locations where Next.js / NFT may place prisma/dev.db
    const candidatePaths = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(__dirname, "..", "..", "..", "prisma", "dev.db"),
      path.join(__dirname, "..", "..", "prisma", "dev.db"),
      path.join(__dirname, "..", "prisma", "dev.db"),
      path.join("/var/task", "prisma", "dev.db"),
    ];

    try {
      if (!fs.existsSync(tmpDbPath)) {
        for (const candidate of candidatePaths) {
          if (fs.existsSync(candidate)) {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          }
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        return new PrismaClient({
          datasources: {
            db: {
              url: `file:${tmpDbPath}`,
            },
          },
        });
      }
    } catch (e) {
      console.error("Error configuring SQLite in /tmp for Vercel:", e);
    }
  }

  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
