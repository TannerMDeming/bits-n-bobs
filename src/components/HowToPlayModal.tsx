import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

// Matches the actual tray tile style from GameScreen
function TrayTile({ text, bg }: { text: string; bg: string }) {
  return (
    <div style={{
      width: 60,
      height: 60,
      flexShrink: 0,
      border: '2.5px solid #111',
      borderRadius: 8,
      background: bg,
      fontFamily: 'var(--font-game)',
      fontWeight: 700,
      fontSize: 20,
      color: '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {text}
    </div>
  );
}

// Matches the actual pool tile style from GameScreen (square, same border)
function PoolTile({ text, used }: { text: string; used?: boolean }) {
  return (
    <div style={{
      width: 46,
      height: 46,
      flexShrink: 0,
      border: `2px solid ${used ? '#DADADA' : '#111'}`,
      borderRadius: 8,
      background: used ? '#EBEBEB' : '#FFF',
      fontFamily: 'var(--font-game)',
      fontWeight: 700,
      fontSize: 15,
      color: used ? 'transparent' : '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {used ? '' : text}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1.5px solid #E8E6E3', margin: '20px 0' }} />;
}

export default function HowToPlayModal({ onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    // position:absolute so it's contained within the card (parent must be position:relative)
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'var(--bg)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'inherit',
      overflow: 'hidden',
    }}>

      {/* ── Sticky header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 20px 16px',
        borderBottom: '1.5px solid #E8E6E3',
        flexShrink: 0,
      }}>
        <span style={{
          flex: 1,
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: '-0.025em',
        }}>
          How to Play
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            color: '#8E8E8E',
            lineHeight: 1,
            padding: '0 2px',
            fontFamily: 'var(--font-ui)',
          }}
        >
          ×
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '22px 24px 40px' }}>

        {/* Intro */}
        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 16,
          lineHeight: 1.55,
          color: '#111',
          margin: '0 0 20px',
        }}>
          Use the bits and pieces of words to solve each clue.
        </p>

        <p style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: '#8E8E8E',
          margin: '0 0 16px',
        }}>
          Examples
        </p>

        {/* ── Example 1: Correct ── */}
        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 19,
          fontWeight: 400,
          textAlign: 'center',
          color: '#111',
          margin: '0 0 10px',
        }}>
          Come through
        </p>

        {/* Tray — correct (full blue) */}
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 10 }}>
          <TrayTile text="vis" bg="#2871EF" />
          <TrayTile text="it"  bg="#2871EF" />
        </div>

        {/* Pool */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
          <PoolTile text="vis" used />
          <PoolTile text="it"  used />
          <PoolTile text="co"  />
          <PoolTile text="al"  />
          <PoolTile text="log" />
        </div>

        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 14,
          color: '#555',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.45,
        }}>
          Tiles turn blue as the right ones go in.
        </p>

        <Divider />

        {/* ── Example 2: Wrong ── */}
        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 19,
          fontWeight: 400,
          textAlign: 'center',
          color: '#111',
          margin: '0 0 10px',
        }}>
          Come through
        </p>

        {/* Tray — wrong (gray) */}
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 10 }}>
          <TrayTile text="vis" bg="#D1D5DB" />
          <TrayTile text="co"  bg="#D1D5DB" />
        </div>

        {/* Pool */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
          <PoolTile text="vis" used />
          <PoolTile text="it"  />
          <PoolTile text="co"  used />
          <PoolTile text="al"  />
          <PoolTile text="log" />
        </div>

        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 14,
          color: '#555',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.45,
        }}>
          An incorrect tile turns the row gray.<br />Remove it and try again.
        </p>

        <Divider />

        {/* Footer copy */}
        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 14,
          color: '#8E8E8E',
          lineHeight: 1.6,
          margin: '0 0 8px',
        }}>
          Clues range from the clear to cryptic, the straightforward to the unhinged.
        </p>
        <p style={{
          fontFamily: 'var(--font-game)',
          fontSize: 14,
          color: '#8E8E8E',
          lineHeight: 1.6,
          margin: 0,
        }}>
          A new set of 12 tiles and 5 clues, every morning.
        </p>
      </div>
    </div>
  );
}
