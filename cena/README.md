## ✨ Features

- **48 real Bulgarian grocery products** across 11 categories
- **4 stores compared:** Kaufland · Lidl · Billa · Fantastico
- **Weekly List** — check off items, set quantities, see live savings total
- **Find Item** — search any product, tap to see 4-store price comparison bar chart
- **By Store** — see exactly which items to buy at each store this week
- **Savings Report** — weekly savings, annual projection, store-by-store breakdown
- **Preference Profile** — personalize by brand, fat %, and size preferences
- **Price Watchlist** — flag items you want to monitor
- **🔥 Sale Spotlight** — see all this week's sale items at a glance
- **EN / БГ** bilingual (English / Bulgarian)
- **Mobile responsive**

---

## 🛠 Tech Stack

- React 18 (via CDN)
- Babel Standalone (JSX compilation in browser)
- Google Fonts (Playfair Display + Source Sans 3)
- Zero build step — works directly from `index.html`

---

## 📝 Customizing Data

All product data lives inside `index.html` in the `PRODUCTS` array.  
Each product follows this pattern:

```js
P("unique-id", "Category", "English Name", "Bulgarian Name",
  "Brand", "Size", IMG.category,
  { kaufland: 1.99, lidl: 1.89, billa: 2.09, fantastico: 2.04 },
  { lidl: true },   // sale flags (optional)
  3.7               // fat % (optional, dairy only)
)
```

To add a store: add it to the `STORES` array and create a matching SVG logo component.

---

Made with ❤️ for smart Bulgarian shoppers.
