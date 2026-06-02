# PLOT — Plant Matchup

A native-plant "character select" for Central Indiana. Answer three things about
a spot in your yard — sun, moisture, and how tidy you want it — and get a single
best-match native plant with full stats, a special ability, a weakness, and
backup picks you can compare head-to-head.

Built with Vite + React. Single-file app in `src/App.jsx`, fully inline-styled
(no Tailwind required). Deploys to GitHub Pages via GitHub Actions.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Deploy to GitHub Pages

1. **Set the base path.** Open `vite.config.js` and make `base` match your repo:
   - Project site `github.com/<you>/plot-matchup` → `base: "/plot-matchup/"`
   - User/org root site `<you>.github.io` → `base: "/"`
   If `base` is wrong, the page loads blank with 404s on the JS/CSS — it is the
   single most common Pages mistake.

2. **Push to GitHub** on the `main` branch.

3. **Enable Pages from Actions.** In the repo: Settings → Pages → "Build and
   deployment" → Source → **GitHub Actions**. (Not "Deploy from a branch.")

4. The workflow in `.github/workflows/deploy.yml` builds and publishes on every
   push to `main`. The live URL appears in the Actions run and under Settings →
   Pages.

## Project structure

```
plot-matchup/
├── index.html              # app shell
├── package.json
├── vite.config.js          # <-- set `base` here
├── .github/workflows/
│   └── deploy.yml           # auto-deploy on push to main
└── src/
    ├── main.jsx             # React entry
    ├── index.css            # reset + body background
    └── App.jsx              # the entire app: data, scoring, screens, cards
```

## Where things live in App.jsx

- **`PLANTS`** — the roster (29 plants). Each has condition tags, 8 stats, an
  ability, a weakness, a role, and a height tag (`h`) that drives the tidy↔wild
  slider.
- **`DEEP_SHADE` / `STANDING`** — small sets marking which shade plants take deep
  shade and which wet plants take standing water.
- **`scorePlant` / `rankPlants`** — the matching engine. Sun and moisture are hard
  constraints; the yard zone is a soft bonus; the style slider tunes by plant size.
- **Screens** — `RegionScreen`, `ZoneScreen`, `ConditionsScreen`, `ResultScreen`.
- **`HeroCard`** — the full plant card. **`VersusPanel`** — the head-to-head compare.

## Notes / next steps

- Locked regions (Northern/Southern Indiana, etc.) are decorative for now.
- Known coverage gap: deep shade + standing water has no exact match (no plant
  tolerates a shady bog); the engine returns the closest fit.
- Roadmap: grow the roster toward 80+, add the "what to remove" invasives side,
  and a full browse/compare page once the roster is large enough.
