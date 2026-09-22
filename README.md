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

Set `NCBI_EMAIL` to a contact address before refreshing PubMed data.

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

GitHub Actions refreshes and validates the data each Monday at 07:17 US Eastern time. Cloudflare Pages deploys accepted commits from `main`. The refresh workflow reads its NCBI contact address from the `NCBI_EMAIL` repository secret.

The frontend is React, TypeScript, Tailwind CSS, and Vite. The data pipeline uses Python's standard library.

## License and attribution

The MIT license covers this project's code and documentation; it does not grant rights to third-party source records or linked material. This is an independent project, not affiliated with or endorsed by Johnson & Johnson or the listed data providers. See [NCBI's disclaimer and copyright guidance](https://www.ncbi.nlm.nih.gov/home/about/policies/) for PubMed content.
