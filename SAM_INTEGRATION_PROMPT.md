# Prompt for Sam's Claude — Integrate Zain's Editor Tracker into Sam's Dashboard

Copy everything below the `---` line and paste it into a fresh Claude conversation
on whatever machine hosts Sam's main dashboard. The prompt is self-contained:
Claude won't need to ask follow-up questions, and it picks the path of least
resistance so the integration goes in clean on the first try.

---

I have a dashboard at `<INSERT PATH TO SAM'S DASHBOARD HERE — e.g. ~/dashboard/index.html>`
and I want to embed a live "Editor Ops Tracker" panel into it. The data is
already exposed publicly. Pick the approach that fits my dashboard's stack with
the smallest possible diff, and ship it without asking me a bunch of questions.

## What the data is

It's the live status of my video editing team: how many shorts each editor
delivered this week, weekly pace vs. target, runway (USD owed to editors so
far this week), QC queue, leaderboard, and 4-week trends. It rebuilds every
~5 minutes off Trello.

## Endpoints (CORS is wide open — `access-control-allow-origin: *`)

- **Full dashboard (HTML, dark theme):** `https://axbpyrc.github.io/sam-editor-dashboard/index.html`
- **Public "Shared Ops" page with Tracker tab (HTML, dark theme):** `https://axbpyrc.github.io/sam-editor-dashboard/shared.html#tracker`
- **Raw JSON feed (the single source of truth):** `https://axbpyrc.github.io/sam-editor-dashboard/tracker.json`

## `tracker.json` schema (top-level keys)

```
generatedAt      string  ISO timestamp
buildEpoch       number  unix seconds (use this to show "updated X min ago")
rebuildInterval  number  seconds between rebuilds (currently 300)
boardUrl         string  link to the Trello board
team             object  { weekTotal, prevWeek, pctLast, target, pctTarget, projWeek }
daily            array   per-day bars for this week (label, date, count, isToday, future)
leaderboard      array   ranked editors this week
pipeline         object  { approved, posted, ongoing } card counts
qc               object  current QC queue
runway           object  pay/owed numbers
reportCard       array   per-editor stats (submitted, fpRate, avgRev, stuck, qscore)
trends           object  { weeks, team, perEditor } 4-week history
alerts           array   urgent items (stuck cards, low pace, etc.)
```

## How to integrate — pick the one that's lowest effort for my stack

### Path A — Static HTML / plain JS dashboard (easiest, do this first if it fits)

Add a single iframe to my dashboard's "Team" or "Ops" section. One line:

```html
<iframe
  src="https://axbpyrc.github.io/sam-editor-dashboard/shared.html#tracker"
  style="width:100%;height:900px;border:0;border-radius:12px;background:#0f1116"
  loading="lazy"
  title="Editor Ops Tracker">
</iframe>
```

That's it. The page inside the iframe already has the dark styling, the
auto-refresh, and the "↻ Refresh" / "↗ Open full dashboard" buttons.

### Path B — Native render (use only if my dashboard styling clashes with the iframe, or if I'm on a framework like React/Vue/Svelte)

Don't iframe. Instead, fetch `tracker.json` and render it in my dashboard's
own components. Lazy-load on tab open. Show "Updated X min ago" using
`Date.now()/1000 - buildEpoch`. Refresh every 60s. Match my existing card
and table styles — don't introduce a new design language.

Minimal fetch pattern:

```js
async function loadEditorTracker() {
  const r = await fetch('https://axbpyrc.github.io/sam-editor-dashboard/tracker.json', { cache: 'no-store' });
  const t = await r.json();
  // t.team, t.daily, t.leaderboard, t.runway, t.qc, t.reportCard, t.trends, t.alerts
  return t;
}
```

## Hard constraints — don't violate these

1. **Don't rebuild the styling.** Match whatever my dashboard already uses. No new fonts, no new color palette.
2. **Don't add a new build step, package manager, or framework.** If my dashboard is a single HTML file, the integration must also be a single HTML edit.
3. **Don't move my existing files around or rename anything.** Only add to the file I tell you to edit.
4. **Don't write a server.** All data is fetched client-side from the URL above.
5. **Don't put any of my credentials, tokens, or auth in the embed.** The endpoints are public.
6. **Don't hardcode editor names, pay rates, or targets.** Read them from the JSON.
7. **Don't suggest "alternative architectures."** Just integrate.

## What I want when you're done

- One clear diff showing the file(s) you changed.
- A short note (≤3 lines) on which path you took and why.
- Either a screenshot or a working local preview I can open.

Begin.
