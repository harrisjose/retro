import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("board")
    .addColumn("workspaceId", "uuid", (col) =>
      col
        .references("workspace.id")
        .onUpdate("cascade")
        .onDelete("cascade")
        .notNull()
    )
    .addColumn("createdBy", "text", (col) =>
      col.references("user.id").onUpdate("cascade").notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("deletedAt", "timestamp")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("board")
    .dropColumn("workspaceId")
    .dropColumn("createdBy")
    .dropColumn("createdAt")
    .dropColumn("updatedAt")
    .dropColumn("deletedAt")
    .execute();
}
