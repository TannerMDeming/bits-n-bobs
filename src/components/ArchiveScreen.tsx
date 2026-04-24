import { useEffect, useState } from 'react';
import type { Puzzle } from '../types';
import logoUrl from '../assets/logo.png';
import lockUrl from '../assets/lock.png';
import checkUrl from '../assets/check.png';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
}

function getTodayStr() {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function getArchiveCompleted(): Set<number> {
  try {
    const raw = localStorage.getItem('bnb_archive_completed');
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

export function markArchiveCompleted(id: number) {
  const s = getArchiveCompleted();
  s.add(id);
  localStorage.setItem('bnb_archive_completed', JSON.stringify([...s]));
}

export default function ArchiveScreen({ onPlay, onBack }: Props) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const today = getTodayStr();

  useEffect(() => {
    setCompleted(getArchiveCompleted());
    fetch('/puzzles.json')
      .then(r => r.json())
      .then((all: Puzzle[]) =>
        setPuzzles([...all].sort((a, b) => a.date.localeCompare(b.date)))
      );
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg)',
      padding: '28px 20px 32px',
      overflowY: 'auto',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, flexShrink: 0 }}>
        <img src={logoUrl} alt="Bits & Bobs" style={{ width: 200 }} draggable={false} />
      </div>

      {/* Puzzle grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
        flex: 1,
        alignContent: 'start',
      }}>
        {puzzles.map(p => {
          const unlocked = p.date <= today;
          const isDone = completed.has(p.id);

          // Style variants
          const bg       = !unlocked ? '#C8C8C8' : isDone ? '#F0FAF4' : '#FFF';
          const border   = !unlocked ? '#ADADAD' : isDone ? '#1A7A46' : '#111';
          const cursor   = unlocked ? 'pointer' : 'default';

          return (
            <button
              key={p.id}
              disabled={!unlocked}
              onClick={() => unlocked && onPlay(p)}
              style={{
                aspectRatio: '1',
                border: `2.5px solid ${border}`,
                borderRadius: 8,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor,
                padding: 0,
                position: 'relative',
                transition: 'background 0.15s ease',
              }}
            >
              {!unlocked ? (
                <img
                  src={lockUrl}
                  alt="locked"
                  style={{ width: 22, opacity: 0.55 }}
                  draggable={false}
                />
              ) : isDone ? (
                <img
                  src={checkUrl}
                  alt="completed"
                  style={{ width: 26 }}
                  draggable={false}
                />
              ) : (
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 17,
                  color: '#111',
                }}>
                  {p.id}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Back to Home */}
      <button
        onClick={onBack}
        style={{
          background: '#111',
          color: '#FAF8F6',
          border: 'none',
          borderRadius: 100,
          height: 50,
          width: '100%',
          fontSize: 16,
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          cursor: 'pointer',
          marginTop: 28,
          flexShrink: 0,
          letterSpacing: '0.01em',
        }}
      >
        Back to Home
      </button>

    </div>
  );
}
