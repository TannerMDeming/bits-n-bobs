import logoUrl from '../assets/logo.png';
import type { Puzzle } from '../types';
import { formatPuzzleDate } from '../puzzle';

interface Props {
  onPlay: () => void;
  puzzle: Puzzle;
}

export default function StartScreen({ onPlay, puzzle }: Props) {
  const puzzleNum = String(puzzle.id).padStart(3, '0');
  const puzzleDate = formatPuzzleDate(puzzle.date);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '0 50px 100px',
      textAlign: 'center',
    }}>
      <img
        src={logoUrl}
        alt="Bits & Bobs"
        style={{ width: '100%', maxWidth: 278, marginBottom: 24 }}
        draggable={false}
      />

      <p style={{
        fontFamily: 'var(--font-game)',
        fontWeight: 400,
        fontSize: 20,
        lineHeight: '115%',
        color: '#000',
        maxWidth: 235,
        marginBottom: 20,
      }}>
        Clues that need solving and only pieces of words to see you through.
      </p>

      <button
        onClick={onPlay}
        style={{
          background: '#111',
          color: '#FAF8F6',
          border: 'none',
          borderRadius: 100,
          padding: '17px 0',
          width: '100%',
          maxWidth: 300,
          fontSize: 16,
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          cursor: 'pointer',
          letterSpacing: '0.01em',
          marginBottom: 20,
        }}
      >
        Play
      </button>

      <p style={{
        fontFamily: 'var(--font-game)',
        fontWeight: 700,
        fontSize: 13,
        color: '#8E8E8E',
        lineHeight: 1.6,
      }}>
        {puzzleDate}<br />No. {puzzleNum}
      </p>
    </div>
  );
}
