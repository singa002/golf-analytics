# Unified Practice Screen (Ready → Live → Result)

## 1. Remove Preview as a tab/route
- `src/routes/_authenticated/route.tsx`: delete the `{ to: "/preview", label: "Preview", Icon: Eye }` entry from `GOLFER_NAV` (and its unused `Eye` import). Practice becomes the first tab.
- Delete `src/routes/_authenticated/preview.tsx`. Its content (metric rows, AI coaching card, glass layout, READY dot) is not thrown away — it moves verbatim into the new `ReadyPanel` used by Practice.
- `src/lib/previewService.ts` (`getPrePuttRead`) stays as the predicted-read source, plus a new optional randomize so each "Next Putt" gives a fresh read. Existing `START PRACTICE` link and any other `/preview` references get cleaned up.

## 2. State machine — one component, no navigation
`src/routes/_authenticated/practice.tsx` holds:

```text
phase: 'ready' | 'live' | 'result'
  ready  --[Putt Now]-->  live  --[animation ends]-->  result  --[Next Putt]-->  ready
```

- `phase` in `useState`, plus `read` (predicted values), `outcome` (chosen variant), and `revealed` (how many of the six stats have filled in).
- Ready and Live share the SAME left panel component; the only difference is that Live renders `—` for any stat whose index is >= `revealed`, so the layout never jumps and the change feels like an in-place transformation (fade/opacity transition on each value).
- Live drives a timer chain (`setTimeout`/`setInterval` cleaned up on unmount) matched to the red path's draw duration (~2.4s): six ticks at ~380ms each fill Distance → Speed → Break → Start Line → Stimp → Aim Point one at a time. Reuse the existing `RECORDING` pill styling already in Practice's live view.
- `// TODO:` comment at the reveal hook point marking where real hardware/sensor data replaces mock values.
- On completion, `phase` flips to `result`.

## 3. Randomized outcome variants
New `src/lib/puttOutcome.ts` exporting `pickPuttOutcome(read)` with 5 variants, uniformly selected by `Math.random()` each click:

| id | behaviour | made |
|----|-----------|------|
| `tracking-make` | hugs the intended line, drops | yes |
| `pure-make` | dead on the intended line | yes |
| `late-diverge` | matches partway, then peels off the lip | no |
| `early-veer` | veers off from the start, wide | no |
| `distance-miss` | on line but overshoots/undershoots (random of the two) | no |

Each variant returns: `id`, `made`, per-stat actual values derived from the predicted read with variant-appropriate error (e.g. `early-veer` gets a large start-line delta), a lateral-deviation profile used to build the red path, an end point (short/long/lipped/in), and a `feedback` string keyed to that variant — makes cite what went right (start line within X°, speed control), misses state the specific error and magnitude ("drifted 1.8° left of the intended line, 14 in wide"). Result view uses existing accent/red/gold tokens.

## 4. Shared Putt Map gains a live line
`src/components/SharedGreenView.tsx` (already shared with Analytics) gets new optional props: `livePath?: { deviation: number[]; endScale: number }`, `animateLive?: boolean`, `liveDurationMs?: number`.
- Existing rendering is untouched when the props are absent, so Analytics/AnalyticsGrid keep working exactly as today.
- When present it builds a second smooth path from the ball to (or past/short of) the hole, offset perpendicular to the intended line by the variant's deviation samples, stroked in `#EF4444` with the existing glow filter, drawn in via `stroke-dasharray`/`stroke-dashoffset` transition over `liveDurationMs`, with a red ball marker riding the path.
- The green intended dotted line and the static ball stay visible underneath as the reference in all three states.

## 5. Verification
Playwright run on `/practice`: click `PUTT NOW`, wait for Result, click `NEXT PUTT`, repeated 6+ times, capturing the chosen variant and made/miss from the DOM each round, plus screenshots of Ready, mid-Live (partially filled stats + red line drawing) and Result. I'll confirm at least 4 distinct variants appear across the runs before reporting back.

## Technical notes
- No visual restyling: same `golf-glass` / `golf-glass-inner` cards, `CoursePhotoBackdrop`, `#22C55E` / `#EF4444` tokens, fonts and spacing.
- `PuttContext` keeps supplying the ball position; `generateNewPutt()` is called on `NEXT PUTT` so the ball/read are fresh, and `getPrePuttRead` is re-rolled at the same time.
- Existing `SwipeableInfoCards` session stats/recent putts keep updating on each completed putt.

## Files touched
- edit `src/routes/_authenticated/practice.tsx` (main work)
- edit `src/routes/_authenticated/route.tsx` (nav)
- edit `src/components/SharedGreenView.tsx` (live red path props)
- edit `src/lib/previewService.ts` (fresh read per putt)
- new `src/lib/puttOutcome.ts` (variants + feedback)
- delete `src/routes/_authenticated/preview.tsx`
