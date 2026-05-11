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

const serviceWorkerRegisterScript = `      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register(new URL('sw.js', window.location.href));
        });
      }`;

const serviceWorkerDevCleanupScript = `      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.getRegistrations()
            .then((registrations) => Promise.all(
              registrations
                .filter((registration) => registration.scope.includes('/career/'))
                .map((registration) => registration.unregister())
            ))
            .catch(() => {});
        });
      }

      if ('caches' in window) {
        window.addEventListener('load', () => {
          caches.keys()
            .then((keys) => Promise.all(
              keys
                .filter((key) => key.startsWith('careerlane-'))
                .map((key) => caches.delete(key))
            ))
            .catch(() => {});
        });
      }`;

function createSourceIndexHtml({ serviceWorkerMode }) {
  const serviceWorkerScript =
    serviceWorkerMode === "production"
      ? serviceWorkerRegisterScript
      : serviceWorkerDevCleanupScript;

  return `<!DOCTYPE html>
<html lang="bg">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0a66c2">
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
    <title>CareerLane | Професионална мрежа за кариерни консултации</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bobsnadenica.com/career/">
    <meta property="og:title" content="CareerLane | Твоят път към професионално израстване">
    <meta property="og:description" content="Свържи се с топ кариерни консултанти и ментори. Изгради своя професионален профил и планирай следващата си стъпка.">
    <meta property="og:image" content="https://bobsnadenica.com/career/assets/og-image.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://bobsnadenica.com/career/">
    <meta property="twitter:title" content="CareerLane | Кариерни консултации">
    <meta property="twitter:description" content="Платформа за професионално позициониране и менторство.">
    <meta property="twitter:image" content="https://bobsnadenica.com/career/assets/og-image.png">

    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <link rel="manifest" href="manifest.json">
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
${serviceWorkerScript}
    </script>
  </body>
</html>
`;
}

async function prepareSourceIndex({ serviceWorkerMode = "development" } = {}) {
  await writeFile(sourceIndexPath, createSourceIndexHtml({ serviceWorkerMode }));
}

async function cleanDir(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
  await mkdir(dirPath, { recursive: true });
}

async function copyBuildOutput({ keepDist }) {
  await cleanDir(rootAssetsDir);
  await cp(distAssetsDir, rootAssetsDir, { recursive: true });
  await cp(path.join(distDir, "index.html"), sourceIndexPath);

  // Copy PWA assets and other static files from dist root to project root
  const filesToCopy = ["manifest.json", "sw.js", "favicon.ico", "apple-touch-icon.png", "og-image.png"];
  for (const file of filesToCopy) {
    try {
      await cp(path.join(distDir, file), path.join(projectDir, file));
    } catch {
      // Ignore if file doesn't exist in build output
    }
  }

  if (!keepDist) {
    await rm(distDir, { recursive: true, force: true });
  }
}

async function runBuild({ keepDist = false } = {}) {
  process.chdir(projectDir);
  await prepareSourceIndex({ serviceWorkerMode: "production" });
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
