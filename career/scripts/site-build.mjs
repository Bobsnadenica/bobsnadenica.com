import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const distDir = path.join(projectDir, "dist");
const distAssetsDir = path.join(distDir, "assets");
const rootAssetsDir = path.join(projectDir, "assets");
const sourceIndexPath = path.join(projectDir, "index.html");

const sourceIndexHtml = `<!DOCTYPE html>
<html lang="bg">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    >
    <meta
      name="description"
      content="CareerLane свързва професионалисти и кариерни консултанти с ясен профил, свободни часове и по-силно професионално позициониране."
    >
    <title>CareerLane</title>
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

async function prepareSourceIndex() {
  await writeFile(sourceIndexPath, sourceIndexHtml);
}

async function cleanDir(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
  await mkdir(dirPath, { recursive: true });
}

async function copyBuildOutput({ keepDist }) {
  await cleanDir(rootAssetsDir);
  await cp(distAssetsDir, rootAssetsDir, { recursive: true });
  await cp(path.join(distDir, "index.html"), sourceIndexPath);

  if (!keepDist) {
    await rm(distDir, { recursive: true, force: true });
  }
}

async function runBuild({ keepDist = false } = {}) {
  process.chdir(projectDir);
  await prepareSourceIndex();
  await viteBuild();
  await copyBuildOutput({ keepDist });
}

const mode = process.argv[2];

if (mode === "prepare") {
  await prepareSourceIndex();
} else if (mode === "build") {
  await runBuild();
} else if (mode === "preview") {
  await runBuild({ keepDist: true });
} else {
  throw new Error(`Unsupported mode: ${mode}`);
}
