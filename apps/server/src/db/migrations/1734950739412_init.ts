import { type Kysely, sql } from "kysely";

// For more info, see: https://kysely.dev/docs/migrations

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("board")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("board").execute();
}
