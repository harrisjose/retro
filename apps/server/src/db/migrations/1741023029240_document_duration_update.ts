import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("document")
    .addColumn("endDateTime", "timestamp")
    .addColumn("duration", "integer")
    .execute();

  const documents = await db
    .selectFrom("document")
    .select(["id", "startDate", "endDate"])
    .execute();

  for (const doc of documents) {
    if (doc.startDate && doc.endDate) {
      const startDate = new Date(doc.startDate);
      const endDate = new Date(doc.endDate);

      // Calculate duration in minutes
      const duration = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60),
      );

      await db
        .updateTable("document")
        .set({ endDateTime: endDate, duration })
        .where("id", "=", doc.id)
        .execute();
    }
  }

  await db.schema
    .alterTable("document")
    .alterColumn("endDateTime", (col) => col.setNotNull())
    .alterColumn("duration", (col) => col.setNotNull())
    .execute();

  await db.schema
    .alterTable("document")
    .dropColumn("startDate")
    .dropColumn("endDate")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("document")
    .addColumn("startDate", "timestamp")
    .addColumn("endDate", "timestamp")
    .execute();

  const documents = await db
    .selectFrom("document")
    .select(["id", "endDateTime", "duration"])
    .execute();

  for (const doc of documents) {
    if (doc.endDateTime && doc.duration) {
      const endDate = new Date(doc.endDateTime);
      const startDate = new Date(endDate.getTime() - doc.duration * 60000);

      await db
        .updateTable("document")
        .set({ startDate, endDate })
        .where("id", "=", doc.id)
        .execute();
    }
  }

  await db.schema
    .alterTable("document")
    .dropColumn("endDateTime")
    .dropColumn("duration")
    .execute();
}
