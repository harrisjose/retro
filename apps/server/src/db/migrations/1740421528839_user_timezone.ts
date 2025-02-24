import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Check if column exists
  const hasTimezone = await db
    .selectFrom("information_schema.columns")
    .select("column_name")
    .where("table_name", "=", "user")
    .where("column_name", "=", "timezone")
    .execute()
    .then((results) => results.length > 0);

  if (!hasTimezone) {
    await db.schema
      .alterTable("user")
      .addColumn("timezone", "text", (col) => col.notNull().defaultTo("UTC"))
      .execute();

    // Update existing users to Indian Standard Time
    await db.updateTable("user").set({ timezone: "Asia/Kolkata" }).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user").dropColumn("timezone").execute();
}
