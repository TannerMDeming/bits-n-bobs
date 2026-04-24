# Bits & Bobs — Claude Memory

## What this is
A daily word puzzle game. Players use word fragment tiles to solve 5 clues per day.
Live at: **bits-n-bobs.io** (also bits-n-bobs.vercel.app)
GitHub: https://github.com/TannerMDeming/bits-n-bobs

## Stack
- Vite + React + TypeScript
- Puzzles stored in `public/puzzles.json` (served as static JSON, loaded at runtime)
- Deployed on Vercel, auto-deploys from GitHub main branch
- Correct repo path: `/Users/tannerdeming/Desktop/Bits-n-Bobs/App/`
- Node lives at `~/.local/node/bin`
- Push changes: `git add`, `git commit`, `git push` from the repo root above

## Project structure
```
src/
  App.tsx              — game state, phase management, archive/today routing
  types.ts             — TypeScript types (GamePhase includes 'archive')
  index.css            — global styles, CSS vars, keyframe animations
  assets/
    logo.png
    lock.png           — used in ArchiveScreen for locked puzzles
  components/
    StartScreen.tsx    — splash; has Play, How to Play, Archive links
    GameScreen.tsx     — tile grid, answer tray, reveal animation, shake
    ResultsScreen.tsx  — results, share logic; shows "Back to Archive" when fromArchive=true
    ArchiveScreen.tsx  — 5-col grid of all puzzles; locks future dates; green ✓ for completed
    HowToPlayModal.tsx

public/
  puzzles.json         — all puzzle data (id, date, tileset, rounds[])
  build/
    index.html         — THE STUDIO (puzzle generator tool, live at bits-n-bobs.io/build/)
  generator.html       — standalone generator page (secondary, same logic as Studio)
  logo.png
  lock.png
```

## THE STUDIO — critical
When Tanner says "the generator" or "the studio", he means:
- **File**: `public/build/index.html` ← always edit this file
- **Live URL**: https://www.bits-n-bobs.io/build/
- Password-gated (`bnb2026`). After login, sessionStorage key `bnb_auth = '1'`.
- `public/generator.html` is a secondary standalone page — keep in sync with Studio but it is NOT what the user uses day-to-day.

## Studio features (public/build/index.html)
- **Generate** — runs up to 15k attempts for a balanced tile set
- **🎲 Wild** — runs 60k attempts for unusual combinations
- **✂️ Split** — finds sets where long words cluster into two distinct root families (scored by `splitScore()`)
- **-ation magnet fix**: suffix diversity check (no suffix in 3+ of top-4 long words) + root diversity check (top-3 long words each use different root)
- **VOCAB** categories: vowels, prefixes, suffixes, roots, onsets, cv, bodies
  - Roots (~60): log, bio, geo, eco, tech, phon, form, port, vis, cap, fin, gen, dict, cal, sol, nov, man, mot, loc, nat, mor, corp, rupt, struct, grad, cred, duc, flu, graph, hab, mem, spir, stat, tang, temp, val, voc, vol, etc.
  - Prefixes (~45): re, un, in, bi, co, de, ex, mis, pre, pro, out, be, en, con, com, per, uni, dis, im, over, sub, super, trans, inter, anti, auto, semi, non, poly, hyper, micro, macro, ultra, post, fore, mid, mono, multi, etc.
  - Suffixes (~43): er, or, al, ly, ic, ed, en, ful, less, ness, ment, tion, sion, able, ive, ous, ary, ify, ize, ish, ant, ing, ion, ate, ance, ence, ent, ism, ist, ity, ship, hood, dom, ward, wise, etc.
  - Philosophy: roots/prefixes/suffixes = morphological discovery (good). Bodies/onsets/cv = phonetic chunks (kept minimal).

## Archive system
- `public/puzzles.json` — sorted by date, all puzzles
- Puzzle unlocks when `puzzle.date <= today` using `-5h UTC offset` (10pm PDT rollover)
- Completed archive puzzles stored in localStorage key `bnb_archive_completed` (JSON array of IDs)
- `ArchiveScreen.tsx` exports `getArchiveCompleted()` and `markArchiveCompleted(id)`
- When playing from archive: ResultsScreen shows "Back to Archive" instead of "Share Results"
- GamePhase union: `'start' | 'archive' | 'playing' | 'roundWin' | 'results'`

## Deployment
- Vercel auto-deploys from GitHub `main` branch
- `vercel.json` at repo root: sets `buildCommand: npm run build`, `outputDirectory: dist`, no-cache headers on `/build/`
- Build: `tsc -b && vite build` → outputs to `dist/`; Vite copies `public/` → `dist/` during build
- `dist/` is gitignored; Vercel builds fresh each deploy
- Custom domains: `bits-n-bobs.io`, `www.bits-n-bobs.io`, `bits-n-bobs.vercel.app` — all point to same Vercel project

## Adding new puzzles
Edit `public/puzzles.json` — add entry with `{ id, date, tileset, rounds }`.
The app fetches this at runtime via `fetch('/puzzles.json')`.

## Design system
- **Fonts**: Inter (UI chrome), Serifa (game/tile text)
- **Background**: `#FAF8F6` (warm off-white, all screens)
- **Desktop bg**: `#E8E6E3` (warm gray behind the card)
- **Tile border**: `#111111`
- **Empty tile bg**: `#EBEBEB`
- **Wrong tile color**: `#D1D5DB`
- **Desktop card**: 390px wide, max-height 920px, border-radius 44px

## Round colors (5 rounds × 5 steps light→saturated)
```
Blue:   #C3DAFF → #2871EF
Yellow: #FFDDAA → #FEAC32
Red:    #FFAB9E → #FF5137
Purple: #F1ABFF → #B755CB
Green:  #80CFAD → #14A566
```

## Key animation details
- **Reveal bar**: `barIn` keyframe (spring bounce), hold 1100ms, `barOut` exit
- **Tile hiding**: tiles hidden during 'hold' and 'out' bar phases
- **Shake**: fires when tray is full + has wrong tile. 5px, 600ms, 2-cycle

## Owner
Tanner Deming (@TannerMDeming on GitHub). Designer-led build. Prefers recommendations over questions, one clean code pass per round of feedback.
