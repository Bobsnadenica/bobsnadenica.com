# MyCompany

Bilingual static company website for a senior-led IT solutions business.

## Structure

- `index.html` is the English homepage.
- `bg/index.html` is the Bulgarian homepage.
- `styles.css` contains the shared visual system and responsive layout.
- `experience.css` contains the contextual preview scenes, depth effects, and animation-specific styling.
- `pages.css` contains the shared styles for subpages such as contact, FAQ, and privacy.
- `showcase.css` contains the dedicated art direction for the showcase experience.
- `script.js` contains the general site behavior such as navigation, reveals, and language preference storage.
- `experience.js` contains the hero depth and pointer-based experience motion.
- `forms.js` powers the guided project intake form and the email-draft flow.
- `showcase.js` powers the contextual scroll and pointer interactions on the showcase page.
- `contact/`, `faq/`, `privacy/`, and `showcase/` are the English subpages.
- `bg/contact/`, `bg/faq/`, `bg/privacy/`, and `bg/showcase/` are the Bulgarian subpages.
- `robots.txt` and `sitemap.xml` support search engine discovery.

## GitHub Pages

1. Push these files to the repository root.
2. In GitHub, open `Settings > Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose your main branch and the `/ (root)` folder.

## Before publishing

- Replace `hello@mycompany.com` with the real contact address you want to use.
- This version assumes the production domain is `https://mycompany.com/` for canonical and sitemap URLs.
- If you publish under a different GitHub Pages or custom domain, update canonical URLs, `robots.txt`, `sitemap.xml`, and structured data.
