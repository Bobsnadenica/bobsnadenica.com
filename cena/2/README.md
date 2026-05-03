# Spesti — Brochure Offers Website

This folder contains the static website that rebuilds a browseable offers app from the scraper output in `../data/data`.

## How It Works

1. The browser extension scrapes Broshura-style sites and writes raw exports into `../data/data`.
2. `build-data.mjs` reshapes that raw export into website-friendly files inside `website/data/`.
3. `index.html` loads the generated catalog and products directly with no build step.

## Current Website Data Flow

- Source of truth: `../data/data/index.json`, `products.json`, `stores.json`
- Generated website files: `data/catalog.json`, `data/products.json`
- Deals are generated in the browser from product discount data
- Store locations come from `data/catalog.json`

## Rebuild After A New Scrape

Run this from the project root:

```bash
node website/build-data.mjs
```

That will overwrite the website's generated data files in `website/data/` with the latest scraper output.

## Tech Stack

- Single-file React app in `index.html`
- Static JSON data
- No bundler or build system for the frontend itself
- PWA manifest for installable mobile use

## Deploy

Static site — serve the `website/` folder from any web server or GitHub Pages.

If you publish this folder directly, make sure `data/catalog.json` and `data/products.json` are regenerated after each scrape.

## Files

| File | Description |
|------|-------------|
| `index.html` | Full application UI and logic |
| `build-data.mjs` | Converts scraper exports into website-ready JSON |
| `data/catalog.json` | Generated retailer, category, and store-location catalog |
| `data/products.json` | Generated offer list with normalized prices and discounts |
| `manifest.json` | PWA manifest |
