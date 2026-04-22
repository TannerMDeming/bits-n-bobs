import type { Puzzle } from './types';

// ─── COLOR SYSTEM ────────────────────────────────────────────────────────────
export const ROUND_COLORS: string[][] = [
  ['#C3DAFF', '#9CC0FB', '#76A5F7', '#4E8CF3', '#2871EF'], // Blue
  ['#FFDDAA', '#FFD18C', '#FFC56E', '#FDB850', '#FEAC32'], // Yellow
  ['#FFAB9E', '#FF9484', '#FF7E6B', '#FF6851', '#FF5137'], // Red
  ['#F1ABFF', '#E394F2', '#D480E5', '#C56AD8', '#B755CB'], // Purple
  ['#80CFAD', '#64C59B', '#4ABA89', '#2EB077', '#14A566'], // Green
];

export const ROUND_COLOR_FINAL = ROUND_COLORS.map(steps => steps[4]);
export const WRONG_COLOR = '#D1D5DB';

// ─── PUZZLE LOADER ───────────────────────────────────────────────────────────
export async function getTodaysPuzzle(): Promise<Puzzle> {
  const res = await fetch('/puzzles.json');
  const puzzles: Puzzle[] = await res.json();

  // Preview mode: ?preview=002 loads that puzzle ID
  const params = new URLSearchParams(window.location.search);
  const previewId = params.get('preview');
  if (previewId) {
    const match = puzzles.find(p => String(p.id).padStart(3, '0') === previewId || String(p.id) === previewId);
    if (match) return match;
  }

  // Load today's puzzle by date
  const today = new Date().toISOString().slice(0, 10);
  const todaysPuzzle = puzzles.find(p => p.date === today);
  if (todaysPuzzle) return todaysPuzzle;

  // Fallback: most recent puzzle
  return puzzles[puzzles.length - 1];
}

export function formatPuzzleDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
