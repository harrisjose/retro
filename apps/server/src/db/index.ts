import { Kysely, PostgresDialect } from "kysely";
import { isEmpty } from "lodash-es";
import pg from "pg";
import config from "../lib/config.js";
import type { DB } from "./types.js";

export const dialect = new PostgresDialect({
  pool: new pg.Pool({
    database: config.db.database,
    host: config.db.host,
    user: config.db.user,
    port: config.db.port,
    max: config.db.max,
    ...(!isEmpty(config.db.password) ? { password: config.db.password } : {}),
  }),
});

export const db = new Kysely<DB>({
  dialect,
});

export * as dbUtil from "./utils.js";
