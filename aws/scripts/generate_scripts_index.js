
/**
 * Auto-generate scripts_index.json grouped by folder.
 * Run from aws/ directory:
 *    node scripts/generate_scripts_index.js
 */

import { promises as fs } from "fs";
import path from "path";

const scriptsRoot = path.resolve("../scripts");
const outputFile = path.join(scriptsRoot, "scripts_index.json");

async function generate() {
  const groups = {};
  const folders = await fs.readdir(scriptsRoot, { withFileTypes: true });

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const folderPath = path.join(scriptsRoot, folder.name);
    const files = await fs.readdir(folderPath);
    const shFiles = files.filter(f => f.endsWith(".sh") || f.endsWith(".json"));
    if (shFiles.length > 0) {
      groups[folder.name.toUpperCase()] = shFiles.map(f => `${folder.name}/${f}`);
    }
  }

  const json = JSON.stringify(groups, null, 2);
  await fs.writeFile(outputFile, json, "utf8");
  console.log(`✅ Generated ${outputFile}`);
  console.log(json);
}

generate().catch(err => {
  console.error("❌ Failed to generate scripts_index.json", err);
});