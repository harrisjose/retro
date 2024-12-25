import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // First rename the table from board to document
  await db.schema.alterTable("board").renameTo("document").execute();

  // Then add the new columns
  await db.schema
    .alterTable("document")
    .addColumn("yDoc", "bytea") // bytea is PostgreSQL's binary data type
    .addColumn("yDocUpdatedAt", "timestamp")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the new columns first
  await db.schema
    .alterTable("document")
    .dropColumn("yDoc")
    .dropColumn("yDocUpdatedAt")
    .execute();

  // Then rename the table back to board
  await db.schema.alterTable("document").renameTo("board").execute();
}
