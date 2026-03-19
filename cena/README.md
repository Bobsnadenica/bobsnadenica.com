# Spesti — Smart Grocery Shopping for Bulgaria

<div align="center">

🛒 **Compare grocery prices across 7 major Bulgarian chains in real-time**

[**Try the Live Demo →**](#demo)

</div>

---

## What is Spesti?

Spesti (Спести = "Save" in Bulgarian) is a grocery price comparison app that helps Bulgarian families save money on their weekly shopping. It compares prices across **Kaufland, Lidl, Billa, Fantastico, T-Market, Metro, and CBA** using official government price data.

### The Problem

A typical Bulgarian family spends **400-800лв/month** on groceries. The same product can cost **30-50% more** at one store vs another — but nobody has time to check 7 different stores before shopping.

### The Solution

Spesti automatically:
- 🏆 **Recommends the best value** per category (cheapest butter per kg, cheapest milk per liter)
- 📊 **Compares the same product** across all stores you shop at
- 📋 **Builds your shopping list** and tells you which store to visit for each item
- 💰 **Shows real weekly deals** — verified discounts, not fake markups
- 🗺️ **Plans your store trips** — "buy these 5 items at Kaufland, these 3 at CBA"

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Government CSV Portal                  │
│         (kolkostruva.bg — daily price submissions)        │
└──────────────────────┬──────────────────────────────────┘
                       │ 210+ CSV files, 145 stores
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Data Pipeline (process_prices_v2.py)         │
│                                                           │
│  1. Parse & normalize 100K+ product-store pairs           │
│  2. Extract brands (1,500+ known, 2,100+ compounds)       │
│  3. Extract sizes (kg, g, ml, L, pieces)                  │
│  4. 5-pass cross-store matching algorithm                  │
│  5. Compute unit prices (price per kg/L/piece)             │
│  6. Detect subcategories (93% coverage)                    │
│  7. Generate English translations (100% coverage)          │
│  8. Price sanity filtering (remove outliers)               │
│  9. Verified deal detection (no fake discounts)            │
│                                                           │
│  Output: products.json (2.4MB), deals.json, trends.json   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend (index.html — single file)          │
│                                                           │
│  React 18 (CDN) + Babel in-browser                        │
│  No build step — just serve static files                  │
│                                                           │
│  Features:                                                │
│  • Best Value Hero Card per category                      │
│  • Subcategory filters (e.g., Пилешко/Свинско for Meat)  │
│  • Fat % filters for dairy                                │
│  • Shopping list with quantity management                 │
│  • By-Store trip planner                                  │
│  • Weekly deals with verified discounts                   │
│  • Light/dark mode                                        │
│  • Bulgarian/English language toggle                      │
│  • Smart search with 80+ synonym mappings                 │
│  • LocalStorage persistence (lists, preferences)          │
└─────────────────────────────────────────────────────────┘
```

### Data Pipeline — 5-Pass Matching Algorithm

The core challenge: the **same product** has different names at different stores.

| Store | Product Name |
|-------|-------------|
| Kaufland | "Верея Краве Масло 82% 250г" |
| Fantastico | "КР.МАСЛО ВЕРЕЯ 82% 0.250КГ" |
| CBA | "Масло краве Верея 82%, 250 гр вакуум" |

These are **the same product** but look completely different. The pipeline uses 5 matching passes:

| Pass | Method | What it catches |
|------|--------|----------------|
| 1 | **Canonical Key** | Brand + Category + Size → exact match |
| 1.5 | **No-size merge** | Products without size merged into existing groups |
| 2 | **Size Tolerance** | 570г ≈ 580г (within 3% tolerance) |
| 3 | **Sorted Token** | Word-order differences ("МАСЛО ВЕРЕЯ" = "ВЕРЕЯ МАСЛО") |
| 5 | **Jaccard Fuzzy** | >70% word overlap for remaining singles |

### Brand Extraction

```
1,500+ manual brands       — "ВЕРЕЯ", "ПРЕЗИДЕНТ", "ОЛИНЕЗА"...
2,100+ compound brands     — "КИСЕЛО МЛЯКО ВЕРЕЯ" → brand "ВЕРЕЯ"
  890+ brand stop words    — "КРАВЕ", "ПРЯСНО" (product types, not brands)
  230+ brand aliases       — "VEREJA" = "ВЕРЕЯ", "7Д" = "7 DAYS"
```

### Unit Price Computation

Every product with a parseable size gets a **price per kg/L/piece** computed per store:

```
КРАВЕ МАСЛО СИТОВО 250г → €1.99 at Fantastico → €7.96/кг
КРАВЕ МАСЛО ВЕРЕЯ 125г  → €2.39 at Billa      → €19.12/кг
```

This lets customers compare products of **different sizes** — the 250г butter is 2.4x better value than the 125г one.

---

## Key Features

### 🏆 Best Value Recommender

Click any category → see the #1 best value product with a gold hero card:

- Shows **price per kg/L** prominently
- **"X% cheaper than average"** comparison
- **5 runner-up options** below
- One-tap **"+ Add to List"**
- **"Browse all N products"** to see everything

### 📋 Quick List Building

Category cards on the list page — tap Мляко → instantly see best milk → add → tap Яйца → add → done in 30 seconds.

### 🗺️ Smart Trip Planner

"Buy these items at Kaufland (€15.20), these at CBA (€8.40)" — optimizes your shopping across 1, 2, or 3 stores.

### 💰 Verified Deals

Every deal is **verified honest**:
- Sale price must be the **cheapest across all major chains**
- Regular price uses **median of other stores** (not inflated max)
- Single-store products excluded (can't verify discount)
- Discount capped at 60% (rejects suspicious claims)

### 🔍 Smart Search

Type "гел за пране" → finds "ПЕРИЛЕН ПРЕПАРАТ" products. 80+ synonym mappings cover how real customers search vs how stores name products.

---

## Current Stats

| Metric | Value |
|--------|-------|
| Total products | 5,372 |
| Multi-store (2+ chains) | 2,565 (47%) |
| With unit prices | 4,470 (83%) |
| With subcategories | 5,037 (93%) |
| Store chains | 7 major (137 total in pipeline) |
| Categories | 19 |
| Verified deals | 63 |
| Search synonyms | 80+ mappings |
| Frontend file size | 2.4 MB (products.json) |
| Supported languages | Bulgarian, English |

---

## Data Source

All prices come from the **Bulgarian government's mandatory price reporting portal** ([kolkostruva.bg](https://kolkostruva.bg)). Every store chain in Bulgaria is legally required to submit daily prices for consumer goods. This means:

- ✅ Prices are **legally accurate** (stores face penalties for false reporting)
- ✅ Updated **daily** by stores
- ✅ Covers **145+ store chains** across Bulgaria
- ⚠️ Some stores submit more complete data than others
- ⚠️ Product names vary wildly between stores (hence the 5-pass matching)

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 (CDN), Babel in-browser, single HTML file |
| Data pipeline | Python 3, regex-heavy text processing |
| Data source | Government CSV portal (kolkostruva.bg) |
| Hosting | Static files (GitHub Pages, S3, any CDN) |
| Storage | LocalStorage (lists, preferences, theme) |
| Build step | None — just serve the files |

### Why Single-File Architecture?

- **Zero build tools** — no webpack, no npm, no node_modules
- **Instant deployment** — copy 5 files to any static host
- **Easy to audit** — everything is in one readable file
- **Fast iteration** — edit and refresh, no compile step
- **CDN-loaded React** — no bundling overhead

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/spesti.git
cd spesti/docs

# Serve with any HTTP server
python3 -m http.server 8080
# or
npx serve .
# or
php -S localhost:8080

# Open http://localhost:8080
```

> **Note:** Opening `index.html` directly as `file://` won't work because browsers block `fetch()` for local files. You need an HTTP server.

---

## Running the Data Pipeline

```bash
# From the project root (not docs/)
cd spesti

# Place CSV data in "Grocery store Data/YYYY-MM-DD/" folders
# Each folder contains one CSV per store chain

# Run the pipeline
python3 process_prices_v2.py

# Output files are generated in the current directory:
# - grocery.json (full dataset, 8MB+)
# - products.json (frontend-optimized, 2.4MB)
# - deals.json (verified weekly deals)
# - trends.json (price change indicators)
# - store_locations.json (store addresses by chain)
```

### Pipeline Stats (v2.27)

```
Total products processed:    31,020
Cross-store matches (2+):    8,045 (26%)
Branded products:            26,400 (85%)
English names (nameEN):      31,020 (100%)
With parsed size:            24,200 (78%)
With unit prices:            23,500 (76%)
With subcategories:          28,800 (93%)
Store chains processed:      152
Price outliers removed:      14
Verified deals generated:    63
```

---

## Project Structure

```
spesti/
├── docs/                          # GitHub Pages deployment
│   ├── index.html                 # Full app (197KB)
│   ├── products.json              # Product data (2.4MB)
│   ├── deals.json                 # Weekly deals (13KB)
│   ├── trends.json                # Price trends (21KB)
│   ├── store_locations.json       # Store addresses (76KB)
│   └── README.md                  # This file
│
├── process_prices_v2.py           # Data pipeline (~5,000 lines)
├── lambda_function_v2.py          # AWS Lambda version of pipeline
├── grocery.json                   # Full pipeline output
├── store_locations.json           # Store location data
│
└── Grocery store Data/            # Raw CSV data (not in repo)
    ├── 2026-03-13/
    ├── 2026-03-14/
    └── ...
```

---

## Categories

| Category | Bulgarian | Products | Subcategories |
|----------|----------|----------|---------------|
| Drinks | Напитки | 1,196 | Вино, Кафе, Чай, Ракия, Бира, Вода |
| Meat | Месо | 647 | Пилешко, Свинско, Телешко, Колбаси, Шунка |
| Household | Дом | 647 | Паста за зъби, Сапун, Кърпи, Миещ препарат |
| Pantry | Бакалия | 363 | Паста, Олио, Ориз, Брашно, Захар |
| Canned | Консерви | 346 | Домати, Бобови, Лютеница, Маслини |
| Snacks | Снаксове | 324 | Шоколад, Кроасани, Бисквити |
| Baby | Бебе | 306 | Пюре, Формула, Каша |
| Bread | Хляб | 284 | Хляб, Баница, Кори |
| White Cheese | Бяло Сирене | 264 | Краве, Овче, Козе |
| Yellow Cheese | Кашкавал | 217 | Краве, Тост/Слайс, Пушен |
| Beauty | Козметика | 195 | Шампоан |
| Tobacco | Тютюн | 154 | Цигари, Тютюн |
| Yogurt | Кисело Мляко | 128 | By fat %: 2%, 3.6%, 4.5% |
| Butter | Масло | 94 | — |
| Produce | Плод & Зелен. | 69 | Зеленчуци, Плодове, Цитруси |
| Fish | Риба | 48 | Ципура, Лаврак, Скумрия |
| Milk | Мляко | 41 | Прясно, UHT (by fat %: 2-3.6%) |
| Eggs | Яйца | 25 | — |

---

## Price Sanity Checks

The pipeline automatically removes suspicious prices:

1. **Outlier removal** — If a store's price is >3x the median price across all stores for that product, it's removed (likely a wrong product match)
2. **Sale price protection** — Legitimate sale prices are never removed, even if they're very low
3. **Deal verification** — Every "deal" must be the cheapest price across ALL major chains
4. **Bulk detection** — Products >1kg are excluded from hero card recommendations (but still shown in full browse)

---

## Future Roadmap

- [ ] 📍 GPS/zip code store selection in onboarding
- [ ] 📋 Multiple shopping lists (weekly, party, BBQ)
- [ ] 📱 PWA with offline support and install prompt
- [ ] 🔔 Price alerts ("notify me when butter < 10лв/кг")
- [ ] 📊 Price history charts (7-day, 30-day trends)
- [ ] 🔄 Automated daily data refresh from government portal
- [ ] 🌐 Store website scraping for complete product catalogs
- [ ] 📸 Product images from store websites
- [ ] 🧾 Receipt scanning to track actual spending

---

## Contributing

This is an early-stage project. If you're interested in Bulgarian grocery data, price comparison algorithms, or React frontend development, contributions are welcome!

---

## License

MIT

---

<div align="center">

**Built for Bulgarian families who want to shop smarter** 🇧🇬

*Spesti — защото всяка стотинка има значение*
*(because every stotinka matters)*

</div>
