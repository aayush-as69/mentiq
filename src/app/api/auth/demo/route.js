import { randomBytes } from "node:crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded, DEMO_PASSWORD } from "@/db/seed";
import { createSession, homeFor } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";
import { hashPassword } from "@/lib/password";

const EMAILS = { student: "student@mentiq.demo", teacher: "teacher@mentiq.demo", admin: "admin@mentiq.demo" };
const schema = z.object({ role: z.enum(["student", "teacher", "admin", "new"]) });

/** One-click demo access: seeded accounts, or a brand-new student for the full diagnostic walkthrough. */
export const POST = route(async ({ body }) => {
  const { role } = schema.parse(body);
  await ensureSeeded();
  if (role === "new") {
    const [user] = await db.insert(users).values({
      name: "New Student", email: `guest-${randomBytes(4).toString("hex")}@mentiq.demo`, passwordHash: hashPassword(DEMO_PASSWORD), role: "student",
    }).returning({ id: users.id });
    await createSession(user.id);
    return { redirect: "/onboarding" };
  }
  const [user] = await db.select().from(users).where(eq(users.email, EMAILS[role])).limit(1);
  if (!user) throw new ApiError(404, "Demo account not found.");
  await createSession(user.id);
  return { redirect: homeFor(user.role) };
}, { limit: { name: "demo", max: 20, windowMs: 60_000 } });
