import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("documentTimer")
    .addColumn("documentId", "uuid", (col) =>
      col
        .primaryKey()
        .references("document.id")
        .onUpdate("cascade")
        .onDelete("cascade")
        .notNull()
    )
    .addColumn("startTime", "timestamp")
    .addColumn("endTime", "timestamp")
    .addColumn("pausedAt", "timestamp")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("documentTimer").execute();
}
