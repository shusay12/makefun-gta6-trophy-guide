# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shusay12/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shusay12/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

<sub>Entered on [make.fun](https://make.fun/?ref=susay21&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

---

# Leonida Legend — GTA VI Trophy Guide & Tracker

An offline, single-page trophy guide and progress tracker for Grand Theft Auto VI, covering all **55 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze) from the official list, each with a how-to guide written in our own words and the sources it draws on named on the trophy itself.

## Features

- **Checklist with progress** — tick trophies off as you earn them; progress is saved in your browser (localStorage), with counters toward PlayStation trophy targets and automatic earned-state when a target is met.
- **Filters and search** — filter by grade (platinum/gold/silver/bronze), earned state, or free-text search across names and guides.
- **Spoiler shield** — story trophy names and guides stay hidden until you choose to reveal them.
- **7-stage roadmap** — the trophies ordered into a completion route, from the story run to the platinum clean-up.
- **Next Up planner** — a short, focused list of what to chase next based on what you have already earned.
- **Missable flags** — the 5 trophies that can be missed are flagged, each with its justification.
- **Export / import** — back up or move your checklist as a file.

## Running it

The app is fully static and offline: open `app/index.html` in a desktop browser. `main.ts` / `serve.ts` are the entry points used by the make.fun hand-in (they copy `app/` and `screenshots/` and write the dossier).

## Data

`app/data/trophies.json` holds the trophy list and guides. Trophy names, grades and descriptions follow the official list published with the bounty; every guide is written in our own words.

## License

MIT — see `LICENSE`.
