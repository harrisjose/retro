import { join } from "path";
import envsub from "envsub";
import { readFile, writeFile } from "fs/promises";

async function main() {
  try {
    const distDir = process.argv[2] || "build/client";
    const distPath = join(process.cwd(), distDir);

    // Read and process env.reference file
    const envRefPath = join(distPath, "env.reference");

    // Use envsub to replace environment variables
    const { outputContents } = await envsub({
      templateFile: envRefPath,
      syntax: "dollar-basic",
      options: {
        all: true,
      },
    });

    // Read the index.html file
    const indexPath = join(distPath, "index.html");
    let indexContent = await readFile(indexPath, "utf-8");

    // Create the script tag with environment variables
    const envScript = `<script>window.env = ${outputContents};</script>`;

    // Insert the script tag right after the opening head tag
    indexContent = indexContent.replace(/<head>/, `<head>\n    ${envScript}`);

    // Write the modified index.html back
    await writeFile(indexPath, indexContent, "utf-8");

    console.log(
      "✅ Successfully injected environment variables into index.html",
    );
  } catch (error) {
    console.error("❌ Error processing environment variables:", error);
    process.exit(1);
  }
}

main();
