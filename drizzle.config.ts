import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const url = new URL(process.env.DATABASE_URL);

console.log("DB host:", url.hostname);
console.log("DB port:", url.port);
console.log("DB user:", url.username);
console.log("DB database:", url.pathname);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
