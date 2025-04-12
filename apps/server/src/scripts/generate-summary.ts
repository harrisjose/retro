import { aiService, serializeDocForLlm } from "@retro/ai";
import * as Y from "yjs";
import { db, dbUtil } from "../db/index.js";

async function generateSummary(documentId: string) {
  try {
    // Get document from DB
    const document = await db
      .selectFrom("document")
      .select(["yDoc", "yDocUpdatedAt"])
      .where("id", "=", dbUtil.asUuid(documentId))
      .executeTakeFirstOrThrow();

    if (!document.yDoc) {
      throw new Error("Document binary not found");
    }

    // Create and populate YDoc
    const yDoc = new Y.Doc();
    Y.applyUpdate(yDoc, new Uint8Array(document.yDoc));

    // Serialize document for LLM
    const serializedDocument = serializeDocForLlm(yDoc);

    // Generate summary
    console.log("Generating summary...");
    const result = await aiService.generateSummary(serializedDocument);

    if (!result.ok) {
      throw new Error(result.error);
    }

    // Print results
    console.log("\nSummary generated successfully:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error generating summary:", error);
    process.exit(1);
  }
}

// Get document ID from command line arguments
const documentId = process.argv[2];

if (!documentId) {
  console.error("Please provide a document ID");
  console.error("Usage: npm run generate-summary <documentId>");
  process.exit(1);
}

generateSummary(documentId);
