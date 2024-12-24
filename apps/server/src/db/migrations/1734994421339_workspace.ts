import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create workspace table
  await db.schema
    .createTable("workspace")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("name", "text", (col) => col.notNull())
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

  // Create workspaceUser junction table
  await db.schema
    .createTable("workspaceUser")
    .addColumn("workspaceId", "uuid", (col) =>
      col
        .references("workspace.id")
        .onUpdate("cascade")
        .onDelete("cascade")
        .notNull()
    )
    .addColumn("userId", "text", (col) =>
      col
        .references("user.id")
        .onUpdate("cascade")
        .onDelete("cascade")
        .notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint("workspaceUserPk", ["workspaceId", "userId"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order to handle foreign key constraints
  await db.schema.dropTable("workspaceUser").execute();
  await db.schema.dropTable("workspace").execute();
}
