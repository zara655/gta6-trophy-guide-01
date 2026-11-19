# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zara655/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zara655/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Guide & Tracker** — an offline GTA 6 trophy guide and tracker covering all 55 official trophies: a checklist with progress saved in your browser, an 8-phase roadmap to the platinum with missable trophies flagged, a spoiler-free mode that hides story trophies until you earn them, and own-words guidance with sources for every trophy.

## Features

- **Checklist** — all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with grade badges, checkboxes persisted in `localStorage`, overall + per-grade progress bars, and JSON export/import of your progress.
- **Roadmap to platinum** — eight phases in play order: story chapters, partner/choice moments before the finale, stranger strands, activities, crime & challenges, then the collectible sweep into 100%.
- **Missables flagged** — 15 trophies carry a Missable badge with a note on when they can be missed (partner availability, story moments, stranger strands, one-off encounters).
- **Spoiler-free mode** — story trophies show as "Story trophy #n — hidden until earned" until you tick them off.
- **Filters** — by grade, kind (story / stranger strand / activity / collectible / challenge / moment), earned/missing/missable, plus text search.
- **Guidance with sources** — every trophy has an expandable guide written for this tracker, citing the official trophy list it is based on.
- **Fully offline** — plain static files, system fonts, no network requests, no build step.

## Run it

```sh
node serve.ts        # preview at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the entry dossier into out/
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=cgsv8n01&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
