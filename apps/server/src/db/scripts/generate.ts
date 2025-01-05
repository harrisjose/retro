import { execSync } from "child_process";
import config from "../../lib/config.js";

const connectionString = `postgres://${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`;

try {
  execSync(
    `kysely-codegen --dialect postgres --runtime-enums --url "${connectionString}" --out-file ./src/db/types.ts`,
    {
      stdio: "inherit",
    },
  );
} catch (error) {
  console.error("Failed to generate types:", error);
  process.exit(1);
}
