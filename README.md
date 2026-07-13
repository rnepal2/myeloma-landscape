# Myeloma Landscape

[Open the website](https://myeloma-landscape.pages.dev/)

A public view of the multiple myeloma development landscape: registered trials, therapies, sponsors, literature, funding, regulatory actions, labels, and supply records.

## Sources

- ClinicalTrials.gov
- PubMed
- NIH RePORTER
- FDA
- DailyMed
- European Medicines Agency

## Local development

```bash
npm install
npm run data:refresh
npm run data:check
npm run dev
```

## Checks

```bash
npm run data:check
npm test
npm run typecheck
npm run build
```

## Deployment

GitHub Actions refreshes and validates the data each day at 07:17 US Eastern time. Cloudflare Pages deploys accepted commits from `main`.

The frontend is React, TypeScript, Tailwind CSS, and Vite. The data pipeline uses Python's standard library.
