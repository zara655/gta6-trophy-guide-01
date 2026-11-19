# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zara655/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zara655/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Guide & Tracker** — an offline GTA VI trophy guide and tracker covering all 55 official trophies (PlayStation trophy data, as listed 2026-11-18). Tick trophies off as you earn them (progress is saved in your browser), filter by grade, kind and status, hide story spoilers until you earn them, and follow an eight-phase roadmap to the platinum with missable trophies flagged and explained. Every trophy carries its own guidance, written for this guide, with sources cited.

Features:

- **Tracker** — all 55 trophies with grade badges (1 platinum, 2 gold, 6 silver, 46 bronze), overall and per-grade progress bars, ticks persisted in localStorage, export/import of progress as JSON, and a guarded reset.
- **Filters** — by grade, by kind (story / side activity / collectible / challenge / online / misc), by earned/missing, plus text search.
- **Spoiler mode** — story trophy names, descriptions and guidance stay hidden until you earn them.
- **Roadmap to the platinum** — eight phases from the story chapters through stranger strands, activities, partner feats, collectibles and economy goals to clean-up and the platinum.
- **Missable flags** — trophies tied to a story beat, a stranger strand, or your partner's availability are flagged with a note on when they can be missed.
- **Fully offline** — plain static files, system fonts, no network requests, no build step.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

To produce the make.fun dossier instead:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=cgsv8n01&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
