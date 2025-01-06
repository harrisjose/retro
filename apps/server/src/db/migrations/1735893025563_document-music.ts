import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("documentMusic")
    .addColumn("documentId", "uuid", (col) =>
      col
        .primaryKey()
        .references("document.id")
        .onUpdate("cascade")
        .onDelete("cascade")
        .notNull(),
    )
    .addColumn("musicId", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) =>
      col.notNull().check(sql`status IN ('active', 'inactive')`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("documentMusic").execute();
}
