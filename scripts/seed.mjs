// Seeds the syllabus and demo classroom. The app also does this automatically on first sign-in.
import "dotenv/config";

const { ensureSeeded } = await import("../src/db/seed/index.js");
const seeded = await ensureSeeded();
console.log(seeded ? "Seeded syllabus and demo classroom." : "Database already seeded.");
process.exit(0);
