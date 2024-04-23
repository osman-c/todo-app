import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "src/server/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: "postgres://postgres:123456@localhost:5432/db",
  },
  verbose: true,
  strict: true,
});
