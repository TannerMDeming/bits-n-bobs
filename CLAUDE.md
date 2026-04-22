# Bits & Bobs — Claude Memory

## What this is
A daily word puzzle game. Players use word fragment tiles to solve 5 clues per day.
Live at: **bits-n-bobs.io** (also bits-n-bobs.vercel.app)
GitHub: https://github.com/TannerMDeming/bits-n-bobs

## Stack
- Vite + React + TypeScript
- No backend — puzzles are hardcoded in `src/puzzle.ts`
- Deployed on Vercel, auto-deploys from GitHub main branch
- To push changes: `git add`, `git commit`, `git push` from `/Users/tannerdeming/Desktop/bits-n-bobs/App/`
- Node lives at `~/.local/node/bin`

## Project structure
```
src/
  App.tsx              — game state, color logic, phase management
  puzzle.ts            — puzzle data, ROUND_COLORS, color constants
  types.ts             — TypeScript types
  index.css            — global styles, CSS vars, keyframe animations
  components/
    StartScreen.tsx
    GameScreen.tsx      — tile grid, answer tray, reveal animation, shake
    ResultsScreen.tsx   — results, share logic, streak
```

## Puzzle generator
Lives at: `/Users/tannerdeming/Desktop/Home Scryer/App/public/generator.html`
Access via: `http://localhost:5173/generator.html` (when Home Scryer dev server is running)
Outputs puzzle data ready to paste into `src/puzzle.ts`

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
Final colors (used for completed bars, round badge): last step of each.

## Color step formula
`Math.round(((correctCount - 1) / (totalSlots - 1)) * 4)`
Spreads evenly across all 5 steps regardless of word length.

## Key animation details
- **Reveal bar**: `barIn` keyframe (spring bounce), hold 1100ms, `barOut` exit
- **Tile hiding**: tiles hidden (`opacity: 0`) during 'hold' and 'out' bar phases so nothing shows behind exiting bar
- **Bing moment**: tray scales to 1.035 on solve before bar appears
- **Shake**: fires when tray is full + has wrong tile. 5px, 600ms, 2-cycle. Gated by `snapReset` to prevent spurious shake on round transition
- **snapReset**: suppresses tile transitions during round reset to prevent color linger

## Share format
```
Bits & Bobs - 001
I found all the bits & bobs in :32

🟦  ⚡️⚡️⚡️
🟧  🏃‍♂️🏃‍♂️🏃‍♂️
🟥  🚣🚣🚣
🟪  🦥🦥🦥
🟩  🪨🪨🪨

bits-n-bobs.io
```
Speed tiers: ≤8s ⚡️ / ≤20s 🏃‍♂️ / ≤45s 🚣 / ≤90s 🦥 / 90s+ 🪨

## Current puzzle (id: 1, date: 2026-04-21)
Tileset: `['vis', 'st', 'log', 'able', 'co', 'ness', 'e', 'sion', 'i', 'cal', 'it', 'al']`
- visit — "Come through"
- coal — "Sinner's present"
- ecological — "Deductive, environmentally"
- steal — "A criminal baseball move"
- stale — "A baker's crime?"

## Adding new puzzles
Edit `src/puzzle.ts` — swap `TEST_PUZZLE` for date-based lookup when puzzle bank is built.
The `getTodaysPuzzle()` function is the hook for that.

## Owner
Tanner Deming (@TannerMDeming on GitHub). Designer-led build. Prefers recommendations over questions, one clean code pass per round of feedback.
