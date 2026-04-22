import { useState } from 'react';
import logoUrl from '../assets/logo.png';
import type { Puzzle } from '../types';
import { formatPuzzleDate } from '../puzzle';
import HowToPlayModal from './HowToPlayModal';

interface Props {
  onPlay: () => void;
  puzzle: Puzzle;
}

export default function StartScreen({ onPlay, puzzle }: Props) {
  const puzzleNum = String(puzzle.id).padStart(3, '0');
  const puzzleDate = formatPuzzleDate(puzzle.date);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
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
            marginBottom: 14,
          }}
        >
          Play
        </button>

        <button
          onClick={() => setShowHowToPlay(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: 14,
            color: '#8E8E8E',
            textDecoration: 'underline',
            textDecorationColor: '#C8C4BF',
            textUnderlineOffset: 3,
            padding: '4px 8px',
            marginBottom: 20,
          }}
        >
          How to Play
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

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
