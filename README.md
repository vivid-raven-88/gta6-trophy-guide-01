# Leonida Nights: GTA VI trophy guide + tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/vivid-raven-88/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/vivid-raven-88/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden). Entry for the [make.fun GTA VI trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it does

- **Checklist** — every trophy with its official name, description and grade as PlayStation publishes them, a guide in this entry's own words with its sources named, and a checkbox that saves progress in the browser (localStorage). Filters by kind (story, missable, collectibles, activities, online), by grade, and by earned/remaining, plus live search.
- **Roadmap** — five phases to the platinum, in order, built from the official descriptions: story, the people of Leonida, collectibles and exploration, activities and challenges, then odd jobs and cleanup. Each phase lists its trophies with per-phase progress.
- **Missables** — all 15 missable trophies flagged, with why each can be missed and when to take it.
- **Sources** — the sources behind every guide, and honest notes: hidden flags cannot be verified from public sources, and the guides are written from the official descriptions, not from playing the game (it has just launched).
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Export / import** — progress exports to a JSON file and imports back.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: every file the app loads is a file under `app/`. To hand it in, `MAKEFUN_OUTPUT_DIR=out node main.ts` writes `out/dossier.json` with the vendored make.fun library.

## Files

- `app/index.html`, `app/style.css` — the page and its paper-and-coral look.
- `app/src/main.js` — boot and event wiring; `app/src/store.js` — saved progress and state; `app/src/views.js` — the checklist, roadmap and missables rendering.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, PSN count where one exists, kind, missable flag, roadmap phase, guide and sources.
- `screenshots/` — four renders of the running app (the first is the cover).
- `main.ts` — the hand-in program (Node 22 standard library only).
