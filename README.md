# Myeloma Landscape Radar

A source-linked public intelligence application for tracking multiple myeloma trials, assets, sponsors, targets and indication-level regulatory milestones.

## What is included

- Live ClinicalTrials.gov API v2 ingestion
- PubMed publication momentum and recent citation explorer
- NIH RePORTER funding signals for disease-titled projects
- Automated FDA oncology approval-notification ingestion
- Version-controlled myeloma asset, target and modality ontology
- Change events computed between accepted snapshots
- Executive overview, paginated trial explorer, integrated pipeline/asset map, evidence intelligence and regulatory timeline
- Data-quality gates that fail closed
- Cloudflare Worker Static Assets configuration
- Scheduled GitHub Actions refresh and deployment workflows

This project supports research and landscape exploration. It is not medical advice, clinical decision support, regulatory advice or investment advice.

## Local development

```bash
npm install
npm run data:refresh
npm run data:check
npm run dev
```

The Python pipeline uses only the standard library. Generated application data lives in `public/data/`; each refresh compares against the currently accepted file before replacing it.

## Quality checks

```bash
npm run data:check
npm test
npm run typecheck
npm run build
```

## Cloudflare deployment

The project deploys as static assets on a Cloudflare Worker. After creating a Cloudflare API token and account, run:

```bash
npm run deploy
```

For GitHub deployment, configure repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The deployment workflow runs on pushes to `main`; the refresh workflow runs Monday, Wednesday and Friday at 07:17 UTC.

## Data method

The registry query is `query.cond="Multiple Myeloma"`. Headline “active” counts include interventional studies that are recruiting, active-not-recruiting, not-yet-recruiting or enrolling-by-invitation. Interventions are classified using `config/ontology.json`. Unmatched interventions remain unclassified rather than being inferred without evidence.

The evidence layer uses PubMed E-utilities for citations with multiple myeloma in the title and NIH RePORTER for recent awards with the disease phrase in the project title. These are activity signals—not measures of evidence quality, clinical benefit or commercial attractiveness.

Current regulatory records are retrieved from FDA oncology approval notifications. `config/regulatory_events.json` provides older or fallback milestones. Events are kept at the indication/regimen level and are deliberately not inferred from the existence of a product record.
