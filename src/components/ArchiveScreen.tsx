import { useEffect, useState } from 'react';
import type { Puzzle } from '../types';
import logoUrl from '../assets/logo.png';
import lockUrl from '../assets/lock.png';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
  // ID of today's puzzle so we can skip it (it's played via the main Play button)
  todayId?: number;
}

function getTodayStr() {
  // Same -5h offset used by the game (day rolls at 10pm PDT)
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
        <img
          src={logoUrl}
          alt="Bits & Bobs"
          style={{ width: 200 }}
          draggable={false}
        />
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

          return (
            <button
              key={p.id}
              disabled={!unlocked}
              onClick={() => unlocked && onPlay(p)}
              style={{
                aspectRatio: '1',
                border: `2.5px solid ${unlocked ? '#111' : '#DADADA'}`,
                borderRadius: 8,
                background: isDone ? '#E8F5EE' : unlocked ? '#FFF' : '#EBEBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: unlocked ? 'pointer' : 'default',
                padding: 0,
                transition: 'background 0.15s ease',
              }}
            >
              {unlocked ? (
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 17,
                  color: isDone ? '#1A7A46' : '#111',
                }}>
                  {isDone ? '✓' : p.id}
                </span>
              ) : (
                <img
                  src={lockUrl}
                  alt="locked"
                  style={{ width: 16, opacity: 0.35 }}
                  draggable={false}
                />
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
