import type { Puzzle } from './types';

// ─── COLOR SYSTEM ────────────────────────────────────────────────────────────
// 5 rounds × 5 color steps (light → saturated)
// Steps indexed 0 (lightest, 1 tile placed) → 4 (full color, all tiles placed)
// Exact colors from Figma — 5 steps light→saturated per round
export const ROUND_COLORS: string[][] = [
  ['#C3DAFF', '#9CC0FB', '#76A5F7', '#4E8CF3', '#2871EF'], // Blue
  ['#FFDDAA', '#FFD18C', '#FFC56E', '#FDB850', '#FEAC32'], // Yellow
  ['#FFAB9E', '#FF9484', '#FF7E6B', '#FF6851', '#FF5137'], // Red
  ['#F1ABFF', '#E394F2', '#D480E5', '#C56AD8', '#B755CB'], // Purple
  ['#80CFAD', '#64C59B', '#4ABA89', '#2EB077', '#14A566'], // Green
];

// Final saturated color per round (used for completed round bars, result tiles, etc.)
export const ROUND_COLOR_FINAL = ROUND_COLORS.map(steps => steps[4]);

// Gray used when a wrong tile is in the tray
export const WRONG_COLOR = '#D1D5DB';

// ─── HARDCODED TEST PUZZLE ───────────────────────────────────────────────────
export const TEST_PUZZLE: Puzzle = {
  id: 1,
  date: '2026-04-21',
  tileset: ['vis', 'st', 'log', 'able', 'co', 'ness', 'e', 'sion', 'i', 'cal', 'it', 'al'],
  rounds: [
    {
      answer: 'visit',
      tiles: ['vis', 'it'],
      clue: 'Come through',
    },
    {
      answer: 'coal',
      tiles: ['co', 'al'],
      clue: "Sinner's present",
    },
    {
      answer: 'ecological',
      tiles: ['e', 'co', 'log', 'i', 'cal'],
      clue: 'Deductive, environmentally',
    },
    {
      answer: 'steal',
      tiles: ['st', 'e', 'al'],
      clue: 'A criminal baseball move',
    },
    {
      answer: 'stale',
      tiles: ['st', 'al', 'e'],
      clue: "A baker's crime?",
    },
  ],
};

// ─── PUZZLE LOADER ───────────────────────────────────────────────────────────
// For now always returns the test puzzle.
// Later: look up today's date against a puzzle bank.
export function getTodaysPuzzle(): Puzzle {
  return TEST_PUZZLE;
}
