import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { createSession } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  name: z.string().trim().min(2, "enter your name").max(80),
  email: z.string().trim().toLowerCase().email("enter a valid email"),
  password: z.string().min(8, "use at least 8 characters").max(100),
});

export const POST = route(async ({ body }) => {
  const input = schema.parse(body);
  await ensureSeeded();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) throw new ApiError(409, "An account with this email already exists. Try signing in.");
  const [user] = await db.insert(users).values({ name: input.name, email: input.email, passwordHash: hashPassword(input.password), role: "student" }).returning({ id: users.id });
  await createSession(user.id);
  return { redirect: "/onboarding" };
}, { limit: { name: "signup", max: 8, windowMs: 60_000 } });
