import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(__dirname, "../data/data");
const outputDir = path.join(__dirname, "data");

const CHAIN_DEFS = [
  { id: "kaufland", name: "Kaufland", color: "#E30613", aliases: ["kaufland", "кауфланд"] },
  { id: "lidl", name: "ЛИДЛ", color: "#0050AA", aliases: ["lidl", "лидл"] },
  { id: "billa", name: "BILLA", color: "#D71920", aliases: ["billa", "билла"] },
  { id: "fantastico", name: "Фантастико", color: "#E51B24", aliases: ["fantastico", "фантастико"] },
  { id: "tmarket", name: "T MARKET", color: "#008A43", aliases: ["t market", "tmarket"] },
  { id: "cba", name: "CBA Болеро", color: "#C2181E", aliases: ["cba", "cba bolero", "болеро"] },
  { id: "life", name: "Life", color: "#2E8B57", aliases: ["life", "life супермаркети"] },
  { id: "ikea", name: "IKEA", color: "#0051BA", aliases: ["ikea", "икеа"] },
  { id: "jysk", name: "JYSK", color: "#003D7C", aliases: ["jysk"] },
  { id: "technopolis", name: "Технополис", color: "#E30613", aliases: ["technopolis", "технополис"] },
  { id: "tehnomarket", name: "Техномаркет", color: "#C62828", aliases: ["tehnomarket", "техномаркет"] },
  { id: "praktiker", name: "Практикер", color: "#F58220", aliases: ["praktiker", "практикер"] },
  { id: "zora", name: "ЗОРА", color: "#D71920", aliases: ["zora", "зора"] },
  { id: "como", name: "Como", color: "#8B5E3C", aliases: ["como"] },
  { id: "kik", name: "KiK", color: "#D6001C", aliases: ["kik"] },
  { id: "tedi", name: "TEDi", color: "#F4C400", aliases: ["tedi"] },
];

const FALLBACK_CHAIN_COLOR = "#5B6A75";

const CATEGORY_DEFS = {
  Groceries: { name: "Groceries", nameBG: "Храни", icon: "🛒", meta: { hasBrand: false, hasFat: false, sizes: [] } },
  Household: { name: "Household", nameBG: "Домашни", icon: "🧴", meta: { hasBrand: false, hasFat: false, sizes: [] } },
  Home: { name: "Home", nameBG: "Дом", icon: "🛋️", meta: { hasBrand: false, hasFat: false, sizes: [] } },
  Electronics: { name: "Electronics", nameBG: "Техника", icon: "🔌", meta: { hasBrand: false, hasFat: false, sizes: [] } },
  DIY: { name: "DIY", nameBG: "Направи си сам", icon: "🧰", meta: { hasBrand: false, hasFat: false, sizes: [] } },
  Offers: { name: "Offers", nameBG: "Оферти", icon: "⭐", meta: { hasBrand: false, hasFat: false, sizes: [] } },
};

const BULGARIAN_TO_LATIN = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya",
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function transliterateBulgarian(value) {
  return String(value || "")
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      const mapped = BULGARIAN_TO_LATIN[lower];
      if (!mapped) {
        return lower;
      }
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    })
    .join("");
}

function slugify(value) {
  return transliterateBulgarian(String(value || ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeChainName(value) {
  return cleanRetailerSuffix(String(value || ""))
    .replace(/\s+-\s+всички магазини.*$/iu, "")
    .replace(/\s+⭐\s+broshura\.bg$/iu, "")
    .trim();
}

function cleanRetailerSuffix(value) {
  return String(value || "")
    .replace(/\s+оферти,\s+актуални брошури и продукти$/iu, "")
    .replace(/\s+-\s+всички магазини и работно време$/iu, "")
    .trim();
}

function resolveChain(value) {
  const normalized = normalizeText(normalizeChainName(value));
  if (!normalized) {
    return null;
  }
  return CHAIN_DEFS.find((chain) =>
    chain.aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))
  ) || null;
}

function inferChain(value) {
  const known = resolveChain(value);
  if (known) {
    return known;
  }

  const normalizedName = normalizeChainName(value);
  if (!normalizedName) {
    return null;
  }

  return {
    id: slugify(normalizedName),
    name: normalizedName,
    color: FALLBACK_CHAIN_COLOR,
    aliases: [normalizeText(normalizedName)]
  };
}

function readJson(fileName) {
  return readFile(path.join(sourceDir, fileName), "utf8").then((raw) => JSON.parse(raw));
}

function parseLocaleNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number.parseFloat(String(value).replace(/\s+/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBgnPrice(text) {
  const matches = [...String(text || "").matchAll(/(\d+(?:[.,]\d+)?)\s*лв\.?/giu)];
  if (!matches.length) {
    return null;
  }
  return parseLocaleNumber(matches[matches.length - 1][1]);
}

function extractCurrentPrice(product) {
  return parseBgnPrice(product.priceText) ?? parseLocaleNumber(product.price);
}

function extractRegularPrice(product) {
  return parseBgnPrice(product.discountText);
}

function extractSize(name) {
  const match = String(name || "").match(/(\d+(?:[.,]\d+)?\s?(?:мл|ml|л|l|гр|g|kg|кг|бр|см|cm|мм|mm|m))/i);
  return match ? match[1].replace(/\s+/g, "") : null;
}

function classifyCategory(chainId, productName) {
  if (["kaufland", "billa", "lidl", "fantastico", "tmarket", "cba", "life"].includes(chainId)) {
    const name = normalizeText(productName);
    if (/(шампоан|паста|препарат|омекотител|перилен|козмет|тоалетна хартия|кърпички|пелени|почист)/.test(name)) {
      return "Household";
    }
    return "Groceries";
  }
  if (chainId === "ikea" || chainId === "jysk" || chainId === "como") {
    return "Home";
  }
  if (chainId === "technopolis" || chainId === "zora") {
    return "Electronics";
  }
  if (chainId === "praktiker") {
    return "DIY";
  }
  return "Offers";
}

function cleanImage(url) {
  if (!url || /image-fallback\.svg/i.test(url)) {
    return null;
  }
  return url;
}

function buildAddress(address) {
  const parts = [
    address?.streetAddress,
    address?.postalCode,
    address?.locality,
  ].filter(Boolean);
  return parts.join(", ");
}

function displayCity(rawCity) {
  if (!rawCity) {
    return "Unknown";
  }
  return titleCase(transliterateBulgarian(String(rawCity).trim()));
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function main() {
  const [rawProducts, rawStores, rawBrochures, rawRetailers, rawIndex] = await Promise.all([
    readJson("products.json"),
    readJson("stores.json"),
    readJson("brochures.json"),
    readJson("retailers.json"),
    readJson("index.json"),
  ]);

  const productStoreIdsByChain = new Map();
  const transformedProducts = [];
  const chainMetaById = new Map();

  function rememberChain(chain) {
    if (!chain?.id) {
      return null;
    }
    if (!chainMetaById.has(chain.id)) {
      chainMetaById.set(chain.id, chain);
    }
    return chain;
  }

  function resolveOrInferChain(...values) {
    for (const value of values) {
      const chain = inferChain(value);
      if (chain) {
        return rememberChain(chain);
      }
    }
    return null;
  }

  for (const product of rawProducts) {
    const chain =
      resolveOrInferChain(product.sellerName, product.stores?.[0]?.name) ||
      resolveChain(product.name);

    const currentPrice = extractCurrentPrice(product);
    if (!chain || !currentPrice || currentPrice <= 0) {
      continue;
    }

    const regularPrice = extractRegularPrice(product);
    const category = classifyCategory(chain.id, product.name);
    const chainStoreIds = new Set((product.stores || []).map((store) => store.id).filter(Boolean));
    if (!productStoreIdsByChain.has(chain.id)) {
      productStoreIdsByChain.set(chain.id, new Set());
    }
    chainStoreIds.forEach((storeId) => productStoreIdsByChain.get(chain.id).add(storeId));

    const prices = {};
    const sale = {};
    if (regularPrice && regularPrice > currentPrice) {
      prices[chain.id] = regularPrice;
      sale[chain.id] = currentPrice;
    } else {
      prices[chain.id] = currentPrice;
    }

    transformedProducts.push({
      id: String(product.id || slugify(`${chain.id}-${product.name}`)),
      name: product.name || chain.name,
      nameBG: product.name || chain.name,
      nameEN: product.name || chain.name,
      category,
      brand: null,
      size: extractSize(product.name),
      img: cleanImage(product.image),
      prices,
      sale,
      stores: chainStoreIds.size || product.stores?.length || 0,
      type: "brochure-offer",
      sc: chain.name,
      sc2: null,
      up: null,
      ut: null,
      sourceUrl: product.url || null,
      externalUrl: product.externalUrl || null,
      availability: product.availability || null,
      priceText: product.priceText || null,
      discountText: product.discountText || null,
    });
  }

  transformedProducts.sort((a, b) =>
    a.category.localeCompare(b.category, "bg") ||
    a.sc.localeCompare(b.sc, "bg") ||
    a.nameBG.localeCompare(b.nameBG, "bg")
  );

  const transformedLocations = dedupeBy(
    rawStores
      .map((store) => {
        const chain = resolveOrInferChain(store.retailerName, store.name);
        if (!chain || !store.geo?.latitude || !store.geo?.longitude) {
          return null;
        }
        return {
          id: store.id,
          chain: chain.id,
          lat: store.geo.latitude,
          lon: store.geo.longitude,
          city: displayCity(store.address?.locality),
          address: buildAddress(store.address),
          name: store.name || chain.name,
        };
      })
      .filter(Boolean),
    (store) => `${store.chain}|${store.lat}|${store.lon}|${store.address}`
  ).sort((a, b) =>
    a.chain.localeCompare(b.chain, "bg") ||
    a.city.localeCompare(b.city, "bg") ||
    a.address.localeCompare(b.address, "bg")
  );

  const categoryCounts = transformedProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(categoryCounts)
    .sort((a, b) => (categoryCounts[b] - categoryCounts[a]) || a.localeCompare(b, "bg"))
    .map((id) => ({
      id,
      ...CATEGORY_DEFS[id],
    }));

  const onboardingCategories = categories
    .map((category) => category.id)
    .filter((id) => id !== "Offers")
    .slice(0, 4);

  const productCountsByChain = transformedProducts.reduce((acc, product) => {
    const chainId = Object.keys(product.prices)[0];
    acc[chainId] = (acc[chainId] || 0) + 1;
    return acc;
  }, {});

  const rawStoreCountsByChain = rawStores.reduce((acc, store) => {
    const chain = resolveOrInferChain(store.retailerName, store.name);
    if (!chain) {
      return acc;
    }
    acc[chain.id] = (acc[chain.id] || 0) + 1;
    return acc;
  }, {});

  const brochureCountsByChain = rawBrochures.reduce((acc, brochure) => {
    const chain = resolveOrInferChain(brochure.retailerName, brochure.title);
    if (!chain) {
      return acc;
    }
    acc[chain.id] = (acc[chain.id] || 0) + 1;
    return acc;
  }, {});

  const retailerCountsByChain = rawRetailers.reduce((acc, retailer) => {
    const chain = resolveOrInferChain(retailer.name);
    if (!chain) {
      return acc;
    }
    acc[chain.id] = (acc[chain.id] || 0) + 1;
    return acc;
  }, {});

  const geoCountsByChain = transformedLocations.reduce((acc, store) => {
    acc[store.chain] = (acc[store.chain] || 0) + 1;
    return acc;
  }, {});

  const activeChainIds = new Set([
    ...Object.keys(productCountsByChain),
    ...Object.keys(rawStoreCountsByChain),
    ...Object.keys(brochureCountsByChain),
    ...Object.keys(retailerCountsByChain),
  ]);

  const chains = [...activeChainIds]
    .map((chainId) => {
      const chain = chainMetaById.get(chainId) || CHAIN_DEFS.find((item) => item.id === chainId);
      if (!chain) {
        return null;
      }

      const offerCount = productCountsByChain[chain.id] || 0;
      const brochureCount = brochureCountsByChain[chain.id] || 0;
      const geoCount = geoCountsByChain[chain.id] || 0;
      const rawStoreCount = rawStoreCountsByChain[chain.id] || 0;
      const productStoreCount = productStoreIdsByChain.get(chain.id)?.size || 0;
      const knownStoreCount = Math.max(rawStoreCount, geoCount, productStoreCount);
      const retailerCount = retailerCountsByChain[chain.id] || 0;
      const coverageParts = [];

      if (offerCount > 0) {
        coverageParts.push(`${offerCount} brochure offers`);
      } else if (brochureCount > 0) {
        coverageParts.push(`${brochureCount} live brochure${brochureCount === 1 ? "" : "s"}`);
      } else if (retailerCount > 0) {
        coverageParts.push("retailer page discovered");
      }

      if (knownStoreCount > 0) {
        coverageParts.push(`${knownStoreCount} stores`);
      }

      if (geoCount > 0) {
        coverageParts.push(`${geoCount} mapped locations`);
      }

      return {
        id: chain.id,
        name: chain.name,
        color: chain.color,
        country: "BG",
        stores: knownStoreCount,
        offers: offerCount,
        hasOffers: offerCount > 0,
        selectable: offerCount > 0,
        brochureCount,
        status: brochureCount > 0 || knownStoreCount > 0 || offerCount > 0 ? "live" : "soon",
        desc: coverageParts.join(" · ") || "retailer discovered",
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      (b.offers - a.offers) ||
      (b.stores - a.stores) ||
      a.name.localeCompare(b.name, "bg")
    );

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: rawIndex?.source || "https://www.broshura.bg",
    sourceCounts: rawIndex?.counts || null,
    currency: "BGN",
    chains,
    categories,
    onboardingCategories,
    storeLocations: transformedLocations,
  };

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n", "utf8"),
    writeFile(path.join(outputDir, "products.json"), JSON.stringify(transformedProducts, null, 2) + "\n", "utf8"),
  ]);

  console.log(
    JSON.stringify(
      {
        generatedProducts: transformedProducts.length,
        generatedChains: chains.length,
        generatedStoreLocations: transformedLocations.length,
        categories: categories.map((category) => category.id),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
