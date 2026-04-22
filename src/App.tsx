import { useState, useCallback, useEffect, useRef } from 'react';
import type { GamePhase } from './types';
import { getTodaysPuzzle, ROUND_COLORS, ROUND_COLOR_FINAL, WRONG_COLOR } from './puzzle';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';

const puzzle = getTodaysPuzzle();

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [roundIndex, setRoundIndex] = useState(0);

  // tray: ordered slots — each is a tile string or null
  const currentRound = puzzle.rounds[roundIndex];
  const slotCount = currentRound?.tiles.length ?? 0;
  const [tray, setTray] = useState<(string | null)[]>(Array(slotCount).fill(null));

  // Per-round elapsed time in seconds
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Reset tray when round changes
  useEffect(() => {
    if (currentRound) {
      setTray(Array(currentRound.tiles.length).fill(null));
      roundStartRef.current = Date.now();
      setElapsed(0);
    }
  }, [roundIndex, currentRound]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - roundStartRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, roundIndex]);

  // ─── COLOR LOGIC ─────────────────────────────────────────────────────────
  // Count how many tray tiles are correct in position
  const correctCount = tray.filter((t, i) => t === currentRound?.tiles[i]).length;
  const totalSlots = currentRound?.tiles.length ?? 1;
  const hasWrongTile = tray.some((t, i) => t !== null && t !== currentRound?.tiles[i]);

  function getTileColor(): string {
    if (hasWrongTile) return WRONG_COLOR;
    if (correctCount === 0) return '#FFFFFF';
    // Spread evenly across all 5 steps so every word length feels distinct.
    // First tile → step 0 (lightest), last tile → step 4 (final color).
    // 2-tile: 0→4  |  3-tile: 0→2→4  |  5-tile: 0→1→2→3→4
    const lastStep = ROUND_COLORS[roundIndex].length - 1;
    const stepIndex = totalSlots <= 1
      ? lastStep
      : Math.round(((correctCount - 1) / (totalSlots - 1)) * lastStep);
    return ROUND_COLORS[roundIndex][stepIndex];
  }

  const tileColor = getTileColor();
  const isComplete = correctCount === totalSlots && totalSlots > 0;

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    setPhase('playing');
    roundStartRef.current = Date.now();
  }, []);

  // Place a tile from the grid into the next empty tray slot
  const placeTile = useCallback((tile: string) => {
    setTray(prev => {
      // If tile already in tray, remove it (tap-to-return)
      if (prev.includes(tile)) {
        return prev.map(t => t === tile ? null : t);
      }
      // Place in first empty slot
      const next = [...prev];
      const emptyIdx = next.findIndex(t => t === null);
      if (emptyIdx === -1) return prev; // tray full
      next[emptyIdx] = tile;
      return next;
    });
  }, []);

  // Remove tile from tray slot (tap tray tile to return)
  const returnTile = useCallback((slotIdx: number) => {
    setTray(prev => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  }, []);

  // Called when round is complete (after animation)
  const handleRoundComplete = useCallback(() => {
    const time = Math.floor((Date.now() - roundStartRef.current) / 1000);
    setRoundTimes(prev => [...prev, time]);

    if (roundIndex + 1 >= puzzle.rounds.length) {
      setPhase('results');
    } else {
      setRoundIndex(i => i + 1);
    }
  }, [roundIndex]);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return <div className="app-shell"><StartScreen onPlay={handlePlay} /></div>;
  }

  if (phase === 'results') {
    return (
      <div className="app-shell">
        <ResultsScreen
          rounds={puzzle.rounds}
          roundTimes={roundTimes}
          roundColors={ROUND_COLOR_FINAL}
          onRestart={() => {
            setPhase('start');
            setRoundIndex(0);
            setRoundTimes([]);
            setElapsed(0);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <GameScreen
        puzzle={puzzle}
        roundIndex={roundIndex}
        tray={tray}
        tileColor={tileColor}
        isComplete={isComplete}
        elapsed={elapsed}
        onPlaceTile={placeTile}
        onReturnTile={returnTile}
        onRoundComplete={handleRoundComplete}
        roundColors={ROUND_COLOR_FINAL}
      />
    </div>
  );
}
