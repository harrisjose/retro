import { Hono } from "hono";
import { db, dbUtil } from "../db/index.js";

const app = new Hono();

app.get(":id/binary", async (c) => {
  try {
    const document = await db
      .selectFrom("document")
      .select(["yDoc", "yDocUpdatedAt"])
      .where("id", "=", dbUtil.asUuid(c.req.param("id")))
      .executeTakeFirstOrThrow();

    if (!document.yDoc) {
      throw new Error("Document binary not found");
    }

    return c.body(document.yDoc as unknown as ArrayBuffer, 200, {
      "Content-Type": "application/octet-stream",
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch yDoc" });
  }
});

export default app;
