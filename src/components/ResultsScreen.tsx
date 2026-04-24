import type { Round } from '../types';
import { useEffect, useState } from 'react';

interface Props {
  rounds: Round[];
  roundTimes: number[];
  roundColors: string[];
  puzzleId: number;
  onRestart: () => void;
  fromArchive?: boolean;
  onBackToArchive?: () => void;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Short format: ":28" under a minute, "1:05" at or over
function formatShort(secs: number) {
  if (secs < 60) return `:${String(secs).padStart(2, '0')}`;
  return formatTime(secs);
}

const SHARE_SQUARES = ['🟦', '🟧', '🟥', '🟪', '🟩'];

function getStreak(): number {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const last = localStorage.getItem('bnb_lastPlayed');
  let streak = parseInt(localStorage.getItem('bnb_streak') || '0', 10);
  if (last === today) return streak;
  if (last === yesterday) streak += 1;
  else streak = 1;
  localStorage.setItem('bnb_streak', String(streak));
  localStorage.setItem('bnb_lastPlayed', today);
  return streak;
}

export default function ResultsScreen({ rounds, roundTimes, roundColors, puzzleId, onRestart, fromArchive, onBackToArchive }: Props) {
  const [visible, setVisible] = useState(false);
  const totalSecs = roundTimes.reduce((a, b) => a + b, 0);
  const streak = getStreak();
  const maxTime = Math.max(...roundTimes, 1);

  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const secsStr = String(secs).padStart(2, '0');

  // Big time tiles always show full M:SS (e.g. 0:28), 4 tiles
  const timeTiles = [
    { val: String(mins), color: roundColors[0] },
    { val: ':', color: roundColors[1] },
    { val: secsStr[0], color: roundColors[2] },
    { val: secsStr[1], color: roundColors[3] },
  ];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  function handleShare() {
    // 1 square per 5s, min 1, max 5 — absolute scale, not relative
    const lines = rounds.map((_, i) => {
      const count = Math.min(5, Math.max(1, Math.ceil(roundTimes[i] / 5)));
      return Array(count).fill(SHARE_SQUARES[i]).join('');
    });
    const id = String(puzzleId).padStart(3, '0');
    const text = `Bits & Bobs - ${id}\nI found all the bits & bobs in ${formatShort(totalSecs)}\n\n${lines.join('\n')}\n\nbits-n-bobs.io`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard.writeText(text);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      padding: '16px 28px 24px',
      background: 'var(--bg)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>

      {/* Top spacer — pushes content down ~22% matching Figma layout */}
      <div style={{ flex: 1, maxHeight: 120 }} />

      {/* ── "Nicely done." — centered, Inter 500, 33px, -0.04em ── */}
      <h1 style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 500,
        fontSize: 33,
        letterSpacing: '-0.04em',
        color: '#111',
        marginBottom: 6,
        lineHeight: 1.15,
        textAlign: 'center',
        width: '100%',
      }}>
        Nicely done.
      </h1>

      {/* ── Subtitle — centered, Serifa 400, 19px ── */}
      <p style={{
        fontFamily: 'var(--font-game)',
        fontWeight: 400,
        fontSize: 19,
        lineHeight: '115%',
        color: '#111',
        marginBottom: 22,
        textAlign: 'center',
        width: '100%',
      }}>
        You found all the bits &amp; bobs in
      </p>

      {/* ── Time tiles — centered row, 46px squares, Serifa 500, 35px digits ── */}
      <div style={{
        display: 'flex',
        gap: 7,
        marginBottom: 30,
      }}>
        {timeTiles.map((item, i) => (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              background: item.color,
              border: '2.5px solid #111',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-game)',
              fontWeight: 500,
              fontSize: 35,
              color: '#111',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {item.val}
          </div>
        ))}
      </div>

      {/* ── Bar chart — label floats right off bar end, max bar capped at 78% ── */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 30,
      }}>
        {rounds.map((_, i) => {
          const t = roundTimes[i] ?? 0;
          // Max bar = 78% so the label always has breathing room even at longest time
          const pct = Math.max((t / maxTime) * 78, 6);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-game)',
                fontWeight: 400,
                fontSize: 21,
                color: '#111',
                width: 14,
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>

              {/* Bar + label in one row — label anchors off bar end */}
              <div style={{ flex: 1, height: 20, display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: roundColors[i],
                  borderRadius: 2,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'var(--font-game)',
                  fontWeight: 400,
                  fontSize: 21,
                  color: '#111',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {formatShort(t)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Share / Back to Archive button ── */}
      <button
        onClick={fromArchive ? onBackToArchive : handleShare}
        style={{
          background: '#111',
          color: '#FFFDFC',
          border: 'none',
          borderRadius: 100,
          height: 50,
          width: fromArchive ? 210 : 177,
          fontSize: 16,
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          cursor: 'pointer',
          letterSpacing: '0.01em',
          marginBottom: 20,
          flexShrink: 0,
        }}
      >
        {fromArchive ? 'Back to Archive' : 'Share Results'}
      </button>

      {/* ── Streak — Serifa 700, 19px ── */}
      <p style={{
        fontFamily: 'var(--font-game)',
        fontWeight: 700,
        fontSize: 19,
        color: '#111',
        textAlign: 'center',
        marginBottom: 10,
      }}>
        {streak} Day Streak
      </p>

      <div style={{ flex: 1 }} />

      {/* ── Back to home ── */}
      <button
        onClick={onRestart}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontFamily: 'var(--font-game)',
          fontWeight: 700,
          fontSize: 14,
          color: '#838383',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Back to home
      </button>
    </div>
  );
}
