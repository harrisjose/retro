import { defineConfig } from "kysely-ctl";
import { db } from "./src/db/index.js";

export default defineConfig({
  kysely: db,
  migrations: {
    allowJS: process.env.NODE_ENV === "production",
    migrationFolder: "./src/db/migrations",
  },
});
