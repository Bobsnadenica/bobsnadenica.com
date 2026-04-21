# Useful Links Archive

This folder is a self-updating static archive that reads directly from
`Links.txt`.

## How it works

1. Edit `Links.txt`.
2. Push the repo to GitHub.
3. The published `Archive/index.html` fetches the latest `Links.txt` and turns
   each entry into a button automatically.

You do not need to hand-edit the HTML when adding links.

## Supported formats

```txt
Category:
https://example.com/
Label | https://example.com/
Label | https://example.com/ | Optional note
```

Notes:

- Empty lines are ignored.
- Lines starting with `#`, `//`, or `--` are ignored.
- If a link appears before any category heading, it goes into `Unsorted`.
- Category headings must be unique.

## Local validation

```bash
node scripts/validate-links.mjs
```

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/` from inside the `Archive` folder.
