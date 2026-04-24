import { useEffect, useRef, useState } from 'react';
import HowToPlayModal from './HowToPlayModal';
import type { Puzzle } from '../types';
import chevronUrl from '../assets/chevron.png';

interface Props {
  puzzle: Puzzle;
  roundIndex: number;
  tray: (string | null)[];
  tileColor: string;
  isComplete: boolean;
  elapsed: number;
  onPlaceTile: (tile: string) => void;
  onReturnTile: (slotIdx: number) => void;
  onRoundComplete: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
  canSkipForward: boolean;
  canSkipBack: boolean;
  roundColors: string[];
  completedRounds: Set<number>;
  skippedRounds: Set<number>;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const TILE_FONT_SIZE = 24;
const BAR_IN_DURATION = 360;
const BAR_HOLD = 1100;
const BAR_OUT_DURATION = 200;

type BarPhase = 'hidden' | 'in' | 'hold' | 'out';

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9.5" stroke="#BBBBBB" strokeWidth="1.5" />
      <rect x="10.25" y="9.5" width="1.5" height="7" rx="0.75" fill="#BBBBBB" />
      <circle cx="11" cy="6.75" r="1" fill="#BBBBBB" />
    </svg>
  );
}


export default function GameScreen({
  puzzle,
  roundIndex,
  tray,
  tileColor,
  isComplete,
  elapsed,
  onPlaceTile,
  onReturnTile,
  onRoundComplete,
  onSkipForward,
  onSkipBack,
  canSkipForward,
  canSkipBack,
  roundColors,
  completedRounds,
  skippedRounds,
}: Props) {
  const round = puzzle.rounds[roundIndex];
  const inTray = new Set(tray.filter(Boolean) as string[]);
  const hasWrongTile = tray.some((t, i) => t !== null && t !== round.tiles[i]);

  const gridTileSize = Math.floor((335 - 3 * 8) / 4); // matches the 4-col grid tile width
  const trayTileSize = Math.min(gridTileSize, Math.floor((335 - (tray.length - 1) * 7) / tray.length));
  // Tray container is always fixed height (max tile size) so clue never jumps between rounds
  const TRAY_CONTAINER_HEIGHT = gridTileSize + 4;
  const roundColor = roundColors[roundIndex];

  // ── Info modal ──
  const [showInfo, setShowInfo] = useState(false);

  // ── Reveal animation ──
  const completedRef = useRef(false);
  const [barPhase, setBarPhase] = useState<BarPhase>('hidden');
  const [tilePulse, setTilePulse] = useState(false);
  // Suppress tray tile transitions right after a round resets (prevents color linger)
  const [snapReset, setSnapReset] = useState(false);

  // ── Shake when tray is full but wrong ──
  const trayFull = tray.every(t => t !== null);
  const [shaking, setShaking] = useState(false);
  const wasFullWrongRef = useRef(false);

  useEffect(() => {
    const isFullWrong = trayFull && hasWrongTile && !isComplete && !snapReset;
    if (isFullWrong && !wasFullWrongRef.current) {
      wasFullWrongRef.current = true;
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
    if (!isFullWrong) wasFullWrongRef.current = false;
  }, [trayFull, hasWrongTile, isComplete, snapReset]);

  const revealAnswerRef = useRef('');
  const revealColorRef = useRef('');
  const revealWidthRef = useRef(0);
  const revealHeightRef = useRef(0);

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;

      // ① "Bing" — spring pulse on the tray
      setTilePulse(true);

      // ② Snapshot + launch bar
      const t1 = setTimeout(() => {
        setTilePulse(false);

        revealAnswerRef.current = round.answer;
        revealColorRef.current = roundColors[roundIndex];
        revealWidthRef.current = tray.length * trayTileSize + (tray.length - 1) * 7;
        revealHeightRef.current = trayTileSize;

        setBarPhase('in');

        // ③ Bar in → hold
        const t2 = setTimeout(() => {
          setBarPhase('hold');

          // ④ Hold → exit
          const t3 = setTimeout(() => {
            setBarPhase('out');

            // ⑤ Exit done → advance, clean up
            const t4 = setTimeout(() => {
              completedRef.current = false;
              setSnapReset(true);      // suppress transitions during reset
              onRoundComplete();
              setBarPhase('hidden');
              // Re-enable transitions on next paint
              requestAnimationFrame(() => requestAnimationFrame(() => setSnapReset(false)));
            }, BAR_OUT_DURATION);

            return () => clearTimeout(t4);
          }, BAR_HOLD);

          return () => clearTimeout(t3);
        }, BAR_IN_DURATION);

        return () => clearTimeout(t2);
      }, 180);

      return () => clearTimeout(t1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const barAnimation = (() => {
    if (barPhase === 'in')  return `barIn ${BAR_IN_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
    if (barPhase === 'out') return `barOut ${BAR_OUT_DURATION}ms ease-in forwards`;
    return 'none';
  })();

  const barVisible = barPhase !== 'hidden';
  // Hide tiles once bar is fully in — so when bar exits, there's nothing behind it
  const hideTiles = barPhase === 'hold' || barPhase === 'out';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px 20px 80px',
      background: 'var(--bg)',
      position: 'relative',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 12 }}>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: '-0.04em',
          color: '#111',
        }}>
          Bits &amp; Bobs
        </span>

        <div style={{ flex: 1 }} />

        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 18,
          fontWeight: 500,
          color: '#8E8E8E',
          marginRight: 12,
        }}>
          {formatTime(elapsed)}
        </span>

        <button
          onClick={() => setShowInfo(v => !v)}
          style={{
            width: 22, height: 22,
            border: 'none', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 10, flexShrink: 0, cursor: 'pointer', padding: 0,
          }}
        >
          <InfoIcon />
        </button>

        <div style={{
          background: roundColor,
          color: '#fff',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 21,
          width: 34, height: 34,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {roundIndex + 1}
        </div>

      </div>

      <div style={{ flex: 1, maxHeight: 40 }} />

      {/* ── Tile Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        flexShrink: 0,
        marginBottom: 42,
      }}>
        {puzzle.tileset.map((tile) => {
          const isUsed = inTray.has(tile);
          return (
            <button
              key={tile}
              onClick={() => !isUsed && onPlaceTile(tile)}
              style={{
                aspectRatio: '1',
                border: `2.5px solid ${isUsed ? '#DADADA' : '#111'}`,
                borderRadius: 8,
                background: isUsed ? '#EBEBEB' : '#FFF',
                fontFamily: 'var(--font-game)',
                fontWeight: 700,
                fontSize: TILE_FONT_SIZE,
                color: isUsed ? 'transparent' : '#111',
                cursor: isUsed ? 'default' : 'pointer',
                transition: 'background 0.35s ease, border-color 0.35s ease, color 0.35s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
                userSelect: 'none',
              }}
            >
              {tile}
            </button>
          );
        })}
      </div>

      {/* ── Answer Tray ── */}
      <div style={{
        flexShrink: 0,
        height: TRAY_CONTAINER_HEIGHT,
        position: 'relative',
      }}>
        {/* Tile layer — instantly hidden once bar is settled so nothing shows behind exit */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          pointerEvents: barVisible ? 'none' : 'auto',
          opacity: hideTiles ? 0 : 1,
          transform: tilePulse ? 'scale(1.035)' : 'scale(1)',
          transition: tilePulse
            ? 'transform 110ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 90ms ease-in',
          animation: shaking ? 'trayShake 300ms ease-in-out' : 'none',
        }}>
          {tray.map((tile, i) => (
            <button
              key={i}
              onClick={() => tile && onReturnTile(i)}
              style={{
                width: trayTileSize,
                height: trayTileSize,
                flexShrink: 0,
                border: `2.5px solid ${tile ? '#111' : '#DADADA'}`,
                borderRadius: 8,
                background: tile ? tileColor : '#EBEBEB',
                fontFamily: 'var(--font-game)',
                fontWeight: 700,
                fontSize: TILE_FONT_SIZE,
                color: tile ? '#111' : 'transparent',
                cursor: tile ? 'pointer' : 'default',
                // Snap instantly on reset so old round color doesn't linger
                transition: snapReset ? 'none' : 'background 0.12s ease, border-color 0.12s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
                userSelect: 'none',
              }}
            >
              {tile ?? ''}
            </button>
          ))}
        </div>

        {/* Reveal bar */}
        {barVisible && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            animation: barAnimation,
          }}>
            <div style={{
              width: revealWidthRef.current,
              height: revealHeightRef.current,
              background: revealColorRef.current,
              borderRadius: 8,
              border: '2.5px solid #111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-game)',
              fontWeight: 700,
              fontSize: 24,
              color: '#111',
            }}>
              {revealAnswerRef.current}
            </div>
          </div>
        )}
      </div>

      {/* ── Clue — sits close below the tray ── */}
      <div style={{
        flexShrink: 0,
        marginTop: 22,
        textAlign: 'center',
        fontFamily: 'var(--font-game)',
        fontWeight: 400,
        fontSize: 22,
        lineHeight: 1.35,
        color: '#111',
        maxWidth: 220,
        alignSelf: 'center',
      }}>
        {round.clue}
      </div>

      {/* ── Skip arrows + Progress Pills — pinned above bottom ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginTop: 'auto' }}>
        {/* Left chevron — 44px tap target */}
        <button
          onClick={onSkipBack}
          disabled={!canSkipBack}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: canSkipBack ? 'pointer' : 'default',
            opacity: canSkipBack ? 1 : 0,
            flexShrink: 0,
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={chevronUrl}
            alt="previous"
            style={{ width: 16, height: 22, transform: 'scaleX(-1)', opacity: 0.5 }}
            draggable={false}
          />
        </button>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {puzzle.rounds.map((_, i) => {
            const isCompleted = completedRounds.has(i);
            const isSkipped = skippedRounds.has(i);
            const isCurrent = i === roundIndex;
            let bg = '#D1D5DB';
            let opacity = 0.4;
            if (isCompleted) { bg = roundColors[i]; opacity = 1; }
            else if (isCurrent) { bg = roundColors[i]; opacity = 1; }
            else if (isSkipped) { bg = roundColors[i]; opacity = 0.35; }
            return (
              <div
                key={i}
                style={{
                  height: 18, flex: 1, borderRadius: 100,
                  background: bg, opacity,
                  transition: 'background 0.3s ease, opacity 0.3s ease',
                }}
              />
            );
          })}
        </div>

        {/* Right chevron — 44px tap target */}
        <button
          onClick={onSkipForward}
          disabled={!canSkipForward}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: canSkipForward ? 'pointer' : 'default',
            opacity: canSkipForward ? 1 : 0,
            flexShrink: 0,
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={chevronUrl}
            alt="next"
            style={{ width: 16, height: 22, opacity: 0.5 }}
            draggable={false}
          />
        </button>
      </div>

      {/* How to Play modal — sibling of all game content, positioned relative to this outer div */}
      {showInfo && <HowToPlayModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
