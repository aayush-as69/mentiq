import "dotenv/config";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.js",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/mentiq",
  },
};
