import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { createSession, homeFor } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";
import { verifyPassword } from "@/lib/password";

const schema = z.object({ email: z.string().trim().toLowerCase().email("enter a valid email"), password: z.string().min(1, "enter your password") });

export const POST = route(async ({ body }) => {
  const input = schema.parse(body);
  await ensureSeeded();
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user || !verifyPassword(input.password, user.passwordHash)) throw new ApiError(401, "Email or password is incorrect.");
  await createSession(user.id);
  return { redirect: homeFor(user.role) };
}, { limit: { name: "login", max: 10, windowMs: 60_000 } });
