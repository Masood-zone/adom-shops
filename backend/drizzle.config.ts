import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const requiredDatabaseVariables = [
  "DB_HOST",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_DATABASE",
] as const;

for (const variable of requiredDatabaseVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is not defined`);
  }
}

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",

  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 4000),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  },

  strict: true,
  verbose: true,
});
