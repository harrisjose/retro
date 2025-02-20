import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("integration")
    .addColumn("organizationId", "text", (col) => col.notNull())
    .addColumn("integration", "text", (col) => col.notNull())
    .addColumn("teamId", "text", (col) => col.notNull())
    .addColumn("teamName", "text", (col) => col.notNull())
    .addColumn("channelId", "text", (col) => col.notNull())
    .addColumn("channelName", "text", (col) => col.notNull())
    .addColumn("botToken", "text", (col) => col.notNull())
    .addColumn("createdBy", "text", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .addPrimaryKeyConstraint("integration_pkey", [
      "organizationId",
      "integration",
    ])
    .addForeignKeyConstraint(
      "integration_organization_id_fkey",
      ["organizationId"],
      "organization",
      ["id"],
    )
    .addForeignKeyConstraint(
      "integration_created_by_fkey",
      ["createdBy"],
      "user",
      ["id"],
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("integration").execute();
}
