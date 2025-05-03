import { Kysely, sql } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("board")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("isAnonymous", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("organizationId", "text", (col) =>
      col.notNull().references("organization.id").onDelete("cascade"),
    )
    .addColumn("createdBy", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .addColumn("deletedAt", "timestamp")
    .execute();

  const documents = await db
    .selectFrom("document")
    .select([
      "isAnonymous",
      "organizationId",
      "createdBy",
      "name",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "id as documentId",
    ])
    .execute();

  type DocumentWithBoardId = (typeof documents)[0] & { boardId: string };
  const documentsWithBoardIds: DocumentWithBoardId[] = [];

  // Insert boards for each document
  for (const doc of documents) {
    const [board] = await db
      .insertInto("board")
      .values({
        id: sql`gen_random_uuid()`,
        isAnonymous: doc.isAnonymous,
        organizationId: doc.organizationId,
        createdBy: doc.createdBy,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        deletedAt: doc.deletedAt,
      })
      .returning("id")
      .execute();

    // Store the mapping
    documentsWithBoardIds.push({
      ...doc,
      boardId: board.id,
    });
  }

  // Add boardId column to document table
  await db.schema
    .alterTable("document")
    .addColumn("boardId", "uuid", (col) => col.references("board.id"))
    .execute();

  // Link documents to their newly created boards
  for (const doc of documentsWithBoardIds) {
    await db
      .updateTable("document")
      .set({ boardId: doc.boardId })
      .where("id", "=", doc.documentId)
      .execute();
  }

  // Make boardId not null after migration
  await db.schema
    .alterTable("document")
    .alterColumn("boardId", (col) => col.setNotNull())
    .execute();

  // Remove columns from document table that are now in board
  await db.schema
    .alterTable("document")
    .dropColumn("organizationId")
    .dropColumn("isAnonymous")
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // Add back the original columns
  await db.schema
    .alterTable("document")
    .addColumn("organizationId", "text")
    .addColumn("isAnonymous", "boolean", (col) => col.defaultTo(false))
    .execute();

  // Restore the original data
  const documents = await db
    .selectFrom("document")
    .innerJoin("board", "document.boardId", "board.id")
    .select([
      "document.id as documentId",
      "board.organizationId",
      "board.isAnonymous",
    ])
    .execute();

  for (const doc of documents) {
    await db
      .updateTable("document")
      .set({
        organizationId: doc.organizationId,
        isAnonymous: doc.isAnonymous,
      })
      .where("id", "=", doc.documentId)
      .execute();
  }

  // Make organizationId not null
  await db.schema
    .alterTable("document")
    .alterColumn("organizationId", (col) => col.setNotNull())
    .execute();

  // Drop the boardId column
  await db.schema.alterTable("document").dropColumn("boardId").execute();

  // Drop the board table
  await db.schema.dropTable("board").execute();
}
