# Myeloma Landscape Radar

A source-linked public intelligence application for tracking multiple myeloma trials, assets, sponsors, targets and indication-level regulatory milestones.

The frontend uses React, TypeScript, React Router, Tailwind CSS, and Vite. All production data is precomputed so the deployed application remains a static Cloudflare Worker asset bundle.

## What is included

- Live ClinicalTrials.gov API v2 ingestion
- PubMed publication momentum and recent citation explorer
- NIH RePORTER funding signals for disease-titled projects
- Automated FDA oncology approval-notification ingestion
- DailyMed label-version monitoring, EMA medicine status, and FDA oncology supply watch
- Version-controlled myeloma asset, target and modality ontology
- Change events computed between accepted snapshots
- Executive overview, paginated trial explorer, integrated pipeline/asset map, evidence intelligence and regulatory timeline
- Deterministic strategic signals for target crowding, research-to-pipeline gaps, sponsor concentration, catalysts, global execution and supply intersections
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

## Frontend structure

```text
src/
  app/          navigation and app-level configuration
  components/   reusable layout, intelligence, trial, and UI components
  context/      shared validated application data
  layouts/      route layouts
  lib/          formatting and shared utilities
  pages/        isolated route-level product surfaces
  App.tsx       route assembly only
```

Component styling uses colocated Tailwind utility classes. `src/index.css` contains only the Tailwind import; there is no project-specific global CSS layer.

## Quality checks

```bash
npm run data:check
npm test
npm run typecheck
npm run build
```

## Free deployment and automated refresh

The production setup uses two free services with a clean separation of responsibilities:

1. GitHub Actions runs the source-data pipeline every day at 07:17 UTC, validates the complete snapshot, and commits accepted files under `public/data/` to `main`.
2. Cloudflare Workers Builds watches `main`. Every application or data commit is built and deployed as a new static-asset Worker version.

Connect the `rnepal2/myeloma-landscape` repository in Cloudflare Workers & Pages and use these build settings:

```text
Project name: myeloma-landscape
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
```

The Worker configuration serves `dist/` and falls back to `index.html` for client-side routes. No runtime database, paid scheduler, Cloudflare API token, or GitHub deployment secret is required with the native Git integration.

To deploy manually from an authenticated local Wrangler session, run:

```bash
npm run deploy
```

The refresh workflow can also be started from GitHub's **Actions → Refresh landscape data → Run workflow** screen. A failed upstream request or failed data-quality check stops the refresh before anything is committed, so the last accepted production snapshot remains available.

## Data method

The registry query is `query.cond="Multiple Myeloma"`. Headline “active” counts include interventional studies that are recruiting, active-not-recruiting, not-yet-recruiting or enrolling-by-invitation. Interventions are classified using `config/ontology.json`. Unmatched interventions remain unclassified rather than being inferred without evidence.

The evidence layer uses PubMed E-utilities for citations with multiple myeloma in the title and NIH RePORTER for recent awards with the disease phrase in the project title. These are activity signals—not measures of evidence quality, clinical benefit or commercial attractiveness.

The regulatory and market-context layer retrieves reviewed therapy labels from DailyMed, centrally managed European medicine records from EMA, and current oncology shortage records from FDA. Supply records remain presentation-specific and are never generalized to an entire molecule.

`public/data/strategic.json` combines comparable fields across sources into transparent executive screening metrics. These outputs are not forecasts, clinical rankings, market-share estimates or investment recommendations.

Current regulatory records are retrieved from FDA oncology approval notifications. `config/regulatory_events.json` provides older or fallback milestones. Events are kept at the indication/regimen level and are deliberately not inferred from the existence of a product record.
