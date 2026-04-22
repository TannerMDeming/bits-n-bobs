import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

// Pool tile — matches game pool tile style exactly
function PoolTile({ text, used }: { text: string; used?: boolean }) {
  return (
    <div style={{
      width: 44,
      height: 44,
      flexShrink: 0,
      border: `2px solid ${used ? '#DADADA' : '#111'}`,
      borderRadius: 8,
      background: used ? '#EBEBEB' : '#FFF',
      fontFamily: 'var(--font-game)',
      fontWeight: 700,
      fontSize: 14,
      color: used ? 'transparent' : '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {text}
    </div>
  );
}

// Tray slot — matches game tray tile style exactly
function TraySlot({ text, bg, empty }: { text?: string; bg?: string; empty?: boolean }) {
  return (
    <div style={{
      width: 62,
      height: 62,
      flexShrink: 0,
      border: `2.5px solid ${empty ? '#DADADA' : '#111'}`,
      borderRadius: 8,
      background: empty ? '#EBEBEB' : bg,
      fontFamily: 'var(--font-game)',
      fontWeight: 700,
      fontSize: 20,
      color: '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {!empty && text}
    </div>
  );
}

function ExampleClue({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-game)',
      fontWeight: 400,
      fontSize: 18,
      color: '#111',
      textAlign: 'center',
      margin: 0,
    }}>
      {text}
    </p>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-game)',
      fontSize: 14,
      color: '#555',
      textAlign: 'left',
      margin: 0,
      lineHeight: 1.45,
    }}>
      {children}
    </p>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: '#111' }}>{children}</strong>;
}

function Divider() {
  return <div style={{ borderTop: '1px solid #E8E6E3', width: '100%' }} />;
}

export default function HowToPlayModal({ onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Colors from the game's actual color system
  const LIGHT_BLUE = '#C3DAFF'; // ROUND_COLORS[0][0] — 1 of 2 correct
  const FULL_BLUE  = '#2871EF'; // ROUND_COLORS[0][4] — all correct
  const GRAY       = '#D1D5DB'; // WRONG_COLOR

  return (
    // Covers the full card, backdrop behind the sheet
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop — tap to close */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'relative',
        background: '#FAF8F6',
        borderRadius: '24px 24px 0 0',
        maxHeight: '88%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px 22px 16px',
          borderBottom: '1px solid #E8E6E3',
          flexShrink: 0,
        }}>
          <span style={{
            flex: 1,
            fontFamily: 'var(--font-ui)',
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '-0.025em',
          }}>
            How to Play
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 26, color: '#8E8E8E', lineHeight: 1,
              padding: '0 2px', fontFamily: 'var(--font-ui)',
            }}
          >
            ×
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 22px 36px' }}>

          {/* Intro */}
          <p style={{
            fontFamily: 'var(--font-game)',
            fontSize: 16,
            lineHeight: 1.55,
            color: '#111',
            marginBottom: 22,
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
            marginBottom: 18,
          }}>
            Examples
          </p>

          {/* ── Step 1: One right tile → light blue ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {/* Pool */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <PoolTile text="vis" used />
              <PoolTile text="it" />
              <PoolTile text="co" />
              <PoolTile text="al" />
              <PoolTile text="log" />
            </div>
            {/* Tray */}
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
              <TraySlot text="vis" bg={LIGHT_BLUE} />
              <TraySlot empty />
            </div>
            {/* Clue */}
            <ExampleClue text="Come through" />
            {/* Caption */}
            <Caption><Bold>vis</Bold> is in the right spot — the tray turns blue.</Caption>
          </div>

          <Divider />

          {/* ── Step 2: Wrong tile → all gray ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '18px 0' }}>
            {/* Pool */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <PoolTile text="vis" used />
              <PoolTile text="it" />
              <PoolTile text="co" used />
              <PoolTile text="al" />
              <PoolTile text="log" />
            </div>
            {/* Tray */}
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
              <TraySlot text="vis" bg={GRAY} />
              <TraySlot text="co"  bg={GRAY} />
            </div>
            {/* Clue */}
            <ExampleClue text="Come through" />
            {/* Caption */}
            <Caption><Bold>co</Bold> is wrong — the row turns gray. Remove it and try again.</Caption>
          </div>

          <Divider />

          {/* ── Step 3: Correct replacement → full blue ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '18px 0 22px' }}>
            {/* Pool */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <PoolTile text="vis" used />
              <PoolTile text="it"  used />
              <PoolTile text="co" />
              <PoolTile text="al" />
              <PoolTile text="log" />
            </div>
            {/* Tray */}
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
              <TraySlot text="vis" bg={FULL_BLUE} />
              <TraySlot text="it"  bg={FULL_BLUE} />
            </div>
            {/* Clue */}
            <ExampleClue text="Come through" />
            {/* Caption */}
            <Caption>Swap in <Bold>it</Bold> — both tiles go full blue. Round solved!</Caption>
          </div>

          <Divider />

          {/* Footer */}
          <p style={{
            fontFamily: 'var(--font-game)',
            fontSize: 14,
            color: '#8E8E8E',
            lineHeight: 1.6,
            marginTop: 18,
          }}>
            Clues range from the clear to cryptic, the straightforward to the unhinged. A new set of 12 tiles and 5 clues, every morning.
          </p>
        </div>
      </div>
    </div>
  );
}
