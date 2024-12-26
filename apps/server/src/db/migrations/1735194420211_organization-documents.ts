import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("document")
    .dropColumn("workspaceId")
    .addColumn("organizationId", "text", (col) =>
      col.notNull().references("organization.id")
    )
    .execute();

  await db.schema.dropTable("workspaceUser").execute();
  await db.schema.dropTable("workspace").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Down migration skipped since we are going to use the tables
  // from better-auth. Anyway this migration is not reversible.
}
