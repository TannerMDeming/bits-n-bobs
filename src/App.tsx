import { useState, useCallback, useEffect, useRef } from 'react';
import type { Puzzle, GamePhase } from './types';
import { getTodaysPuzzle, ROUND_COLORS, ROUND_COLOR_FINAL, WRONG_COLOR } from './puzzle';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';

export default function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [phase, setPhase] = useState<GamePhase>('start');
  const [roundIndex, setRoundIndex] = useState(0);

  // Load puzzle on mount
  useEffect(() => {
    getTodaysPuzzle().then(setPuzzle);
  }, []);

  const currentRound = puzzle?.rounds[roundIndex];
  const slotCount = currentRound?.tiles.length ?? 0;
  const [tray, setTray] = useState<(string | null)[]>(Array(slotCount).fill(null));

  // Per-round time tracking — accumulated seconds per round index
  const [roundAccumTimes, setRoundAccumTimes] = useState<number[]>([]);
  // Final solved times, indexed by round (used by ResultsScreen)
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Track which rounds are completed / skipped
  const [completedRounds, setCompletedRounds] = useState<Set<number>>(new Set());
  const [skippedRounds, setSkippedRounds] = useState<Set<number>>(new Set());

  // Init per-round arrays once puzzle loads
  useEffect(() => {
    if (puzzle) {
      setRoundAccumTimes(Array(puzzle.rounds.length).fill(0));
      setRoundTimes(Array(puzzle.rounds.length).fill(0));
    }
  }, [puzzle]);

  // Reset tray when round changes
  useEffect(() => {
    if (currentRound) {
      setTray(Array(currentRound.tiles.length).fill(null));
      roundStartRef.current = Date.now();
      // Show accumulated time immediately
      setElapsed(roundAccumTimes[roundIndex] ?? 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, currentRound]);

  // Timer — shows per-round elapsed (accumulated + current session)
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsed((roundAccumTimes[roundIndex] ?? 0) + Math.floor((Date.now() - roundStartRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex]);

  // ─── COLOR LOGIC ─────────────────────────────────────────────────────────
  const correctCount = tray.filter((t, i) => t === currentRound?.tiles[i]).length;
  const totalSlots = currentRound?.tiles.length ?? 1;
  const hasWrongTile = tray.some((t, i) => t !== null && t !== currentRound?.tiles[i]);

  function getTileColor(): string {
    if (hasWrongTile) return WRONG_COLOR;
    if (correctCount === 0) return '#FFFFFF';
    const lastStep = ROUND_COLORS[roundIndex].length - 1;
    const stepIndex = totalSlots <= 1
      ? lastStep
      : Math.round(((correctCount - 1) / (totalSlots - 1)) * lastStep);
    return ROUND_COLORS[roundIndex][stepIndex];
  }

  const tileColor = getTileColor();
  const isComplete = correctCount === totalSlots && totalSlots > 0;

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  // Find next/prev round that isn't completed, wrapping from fromIndex
  function findNext(from: number, completed: Set<number>, total: number): number {
    // Look forward first, then wrap around from the beginning
    for (let i = from + 1; i < total; i++) {
      if (!completed.has(i)) return i;
    }
    for (let i = 0; i < from; i++) {
      if (!completed.has(i)) return i;
    }
    return -1;
  }

  function findPrev(from: number, completed: Set<number>): number {
    for (let i = from - 1; i >= 0; i--) {
      if (!completed.has(i)) return i;
    }
    return -1;
  }

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    setPhase('playing');
    roundStartRef.current = Date.now();
  }, []);

  const placeTile = useCallback((tile: string) => {
    setTray(prev => {
      if (prev.includes(tile)) return prev.map(t => t === tile ? null : t);
      const next = [...prev];
      const emptyIdx = next.findIndex(t => t === null);
      if (emptyIdx === -1) return prev;
      next[emptyIdx] = tile;
      return next;
    });
  }, []);

  const returnTile = useCallback((slotIdx: number) => {
    setTray(prev => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  }, []);

  const handleRoundComplete = useCallback(() => {
    if (!puzzle) return;

    // Record final time for this round
    const sessionSecs = Math.floor((Date.now() - roundStartRef.current) / 1000);
    const finalTime = (roundAccumTimes[roundIndex] ?? 0) + sessionSecs;

    setRoundTimes(prev => {
      const next = [...prev];
      next[roundIndex] = finalTime;
      return next;
    });

    const newCompleted = new Set([...completedRounds, roundIndex]);
    setCompletedRounds(newCompleted);
    setSkippedRounds(prev => { const s = new Set(prev); s.delete(roundIndex); return s; });

    // All rounds done → results
    if (newCompleted.size >= puzzle.rounds.length) {
      setPhase('results');
      return;
    }

    // Auto-advance to next incomplete round
    const next = findNext(roundIndex, newCompleted, puzzle.rounds.length);
    if (next !== -1) setRoundIndex(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, puzzle, completedRounds, roundAccumTimes]);

  const handleSkipForward = useCallback(() => {
    if (!puzzle) return;
    // Snapshot session time NOW before the ref is updated
    const sessionSecs = Math.floor((Date.now() - roundStartRef.current) / 1000);
    setRoundAccumTimes(prev => {
      const next = [...prev];
      next[roundIndex] = (prev[roundIndex] ?? 0) + sessionSecs;
      return next;
    });
    if (!completedRounds.has(roundIndex)) {
      setSkippedRounds(prev => new Set([...prev, roundIndex]));
    }
    const next = findNextNoWrap(roundIndex, completedRounds, puzzle.rounds.length);
    if (next !== -1) {
      setRoundIndex(next);
      roundStartRef.current = Date.now();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, puzzle, completedRounds]);

  const handleSkipBack = useCallback(() => {
    // Snapshot session time NOW before the ref is updated
    const sessionSecs = Math.floor((Date.now() - roundStartRef.current) / 1000);
    setRoundAccumTimes(prev => {
      const next = [...prev];
      next[roundIndex] = (prev[roundIndex] ?? 0) + sessionSecs;
      return next;
    });
    if (!completedRounds.has(roundIndex)) {
      setSkippedRounds(prev => new Set([...prev, roundIndex]));
    }
    const prev = findPrev(roundIndex, completedRounds);
    if (prev !== -1) {
      setRoundIndex(prev);
      roundStartRef.current = Date.now();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, completedRounds]);

  // For the skip button, only look forward (no wrap) — wrapping is only for auto-advance after solving
  function findNextNoWrap(from: number, completed: Set<number>, total: number): number {
    for (let i = from + 1; i < total; i++) {
      if (!completed.has(i)) return i;
    }
    return -1;
  }
  const canSkipForward = puzzle ? findNextNoWrap(roundIndex, completedRounds, puzzle.rounds.length) !== -1 : false;
  const canSkipBack = findPrev(roundIndex, completedRounds) !== -1;

  // ─── RENDER ──────────────────────────────────────────────────────────────
  if (!puzzle) return null;

  if (phase === 'start') {
    return (
      <div className="app-shell">
        <StartScreen onPlay={handlePlay} puzzle={puzzle} />
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="app-shell">
        <ResultsScreen
          rounds={puzzle.rounds}
          roundTimes={roundTimes}
          roundColors={ROUND_COLOR_FINAL}
          puzzleId={puzzle.id}
          onRestart={() => {
            setPhase('start');
            setRoundIndex(0);
            setRoundTimes([]);
            setElapsed(0);
            setCompletedRounds(new Set());
            setSkippedRounds(new Set());
            setRoundAccumTimes(Array(puzzle.rounds.length).fill(0));
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
        onSkipForward={handleSkipForward}
        onSkipBack={handleSkipBack}
        canSkipForward={canSkipForward}
        canSkipBack={canSkipBack}
        roundColors={ROUND_COLOR_FINAL}
        completedRounds={completedRounds}
        skippedRounds={skippedRounds}
      />
    </div>
  );
}
