import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const labelAliases = new Map([
  ["youtube", "YouTube"],
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tik tok", "TikTok"],
  ["tiktok", "TikTok"],
  ["linkedin", "LinkedIn"],
  ["viber", "Viber"],
  ["website", "Уебсайт"],
  ["links", "Уебсайт"],
]);

function toTitleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normaliseLabel(value) {
  const lowered = value
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
  return labelAliases.get(lowered) || toTitleCase(value);
}

function labelFromUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname.includes("facebook.com")) {
      return "Facebook";
    }

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "YouTube";
    }

    if (hostname.includes("instagram.com")) {
      return "Instagram";
    }

    if (hostname.includes("tiktok.com")) {
      return "TikTok";
    }

    if (hostname.includes("linkedin.com")) {
      return "LinkedIn";
    }

    if (hostname.includes("viber.com")) {
      return "Viber";
    }

    return "Уебсайт";
  } catch {
    return "Уебсайт";
  }
}

function normaliseUrl(label, rawValue) {
  const value = rawValue.trim();
  const cleanedLabel = normaliseLabel(label || value);

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return { label: label ? cleanedLabel : labelFromUrl(value), url: value };
  }

  if (label && label.toLowerCase() === "instagram" && value.startsWith("@")) {
    return {
      label: "Instagram",
      url: `https://www.instagram.com/${value.slice(1)}/`,
    };
  }

  if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(value)) {
    return {
      label: cleanedLabel,
      url: `https://${value}`,
    };
  }

  if (value.startsWith("@")) {
    return {
      label: cleanedLabel,
      url: `https://www.instagram.com/${value.slice(1)}/`,
    };
  }

  return null;
}

function parseLinks(rawText) {
  const links = [];
  const channels = new Set();
  const labelCounts = new Map();
  let description = "";

  for (const rawLine of rawText.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (/^description\s*:/i.test(line)) {
      description = line.replace(/^description\s*:/i, "").trim();
      continue;
    }

    const isFullUrl = /^https?:\/\//i.test(line);
    const colonIndex = isFullUrl ? -1 : line.indexOf(":");
    const hasLabel = colonIndex > -1;
    const label = hasLabel ? line.slice(0, colonIndex).trim() : "";
    const value = hasLabel ? line.slice(colonIndex + 1).trim() : line;
    const parsed = normaliseUrl(label, value);

    if (!parsed) {
      continue;
    }

    const baseLabel = parsed.label;
    const count = (labelCounts.get(baseLabel) || 0) + 1;
    labelCounts.set(baseLabel, count);

    links.push({
      ...parsed,
      label: count === 1 ? baseLabel : `${baseLabel} ${count}`,
    });
    channels.add(baseLabel);
  }

  return {
    description,
    links,
    channels: Array.from(channels),
  };
}

async function detectOrientation(filePath) {
  try {
    const { stdout } = await execFileAsync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath]);
    const widthMatch = stdout.match(/pixelWidth:\s+(\d+)/);
    const heightMatch = stdout.match(/pixelHeight:\s+(\d+)/);

    if (!widthMatch || !heightMatch) {
      return "portrait";
    }

    return Number(widthMatch[1]) >= Number(heightMatch[1]) ? "landscape" : "portrait";
  } catch {
    return "portrait";
  }
}

export async function readProfiles(rootDir = process.cwd()) {
  const assetsDir = path.join(rootDir, "assets");

  try {
    await fs.access(assetsDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(assetsDir, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  const profiles = [];

  for (const folder of folders) {
    const folderPath = path.join(assetsDir, folder.name);
    const displayName = folder.name.normalize("NFC");
    const files = await fs.readdir(folderPath, { withFileTypes: true });
    const imageFile = files.find((entry) => imageExtensions.has(path.extname(entry.name).toLowerCase()));
    const textFile = files.find((entry) => path.extname(entry.name).toLowerCase() === ".txt");

    if (!imageFile || !textFile) {
      continue;
    }

    const imagePath = path.join(folderPath, imageFile.name);
    const rawText = await fs.readFile(path.join(folderPath, textFile.name), "utf8");
    const { description, links, channels } = parseLinks(rawText);
    const orientation = await detectOrientation(imagePath);

    profiles.push({
      name: displayName,
      image: path.posix.join("assets", folder.name, imageFile.name),
      alt: `Профилно изображение за ${displayName}`,
      imageNote:
        orientation === "landscape"
          ? "Широкоформатна промо енергия с уверен фронтален поглед."
          : "Портретен режим с повишена гравитация на личния бранд.",
      orientation,
      description,
      channels,
      links,
    });
  }

  return profiles;
}

export async function writeSiteData(rootDir = process.cwd()) {
  const profiles = await readProfiles(rootDir);
  const outputFile = path.join(rootDir, "site-data.js");
  const fileContent = `window.__GURU_PROFILES__ = ${JSON.stringify(profiles, null, 2)};\n`;

  await fs.writeFile(outputFile, fileContent, "utf8");

  return profiles;
}
