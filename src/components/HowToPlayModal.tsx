import { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

const TILE = 38;
const GAP  = 5;

function PoolTile({ text, used }: { text: string; used?: boolean }) {
  return (
    <div style={{
      width: TILE, height: TILE, flexShrink: 0,
      border: `2px solid ${used ? '#DADADA' : '#111'}`,
      borderRadius: 7,
      background: used ? '#EBEBEB' : '#FFF',
      fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 13,
      color: used ? '#BBBBBB' : '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {text}
    </div>
  );
}

function TrayTile({ text, bg, empty }: { text?: string; bg?: string; empty?: boolean }) {
  return (
    <div style={{
      width: TILE, height: TILE, flexShrink: 0,
      border: `2px solid ${empty ? '#DADADA' : '#111'}`,
      borderRadius: 7,
      background: empty ? '#EBEBEB' : bg,
      fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 13,
      color: '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {!empty && text}
    </div>
  );
}

function Example({
  pool,
  tray,
  caption,
}: {
  pool: React.ReactNode;
  tray: React.ReactNode;
  caption: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Pool — wrapped in a recessed card to mimic the tile bank */}
      <div style={{
        background: '#EDEAE6',
        borderRadius: 10,
        padding: '8px 10px',
        display: 'inline-flex',
        gap: GAP,
        marginBottom: 10,
      }}>
        {pool}
      </div>
      {/* Tray */}
      <div style={{ display: 'flex', gap: GAP, marginBottom: 10 }}>
        {tray}
      </div>
      <p style={{ fontFamily: 'var(--font-game)', fontSize: 14, color: '#222', lineHeight: 1.4 }}>
        {caption}
      </p>
    </div>
  );
}

export default function HowToPlayModal({ onClose }: Props) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => setClosing(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const LIGHT_BLUE = '#C3DAFF';
  const FULL_BLUE  = '#2871EF';
  const GRAY       = '#D1D5DB';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        opacity: closing ? 0 : 1,
        transition: 'opacity 260ms ease',
      }} />

      {/* Sheet */}
      <div
        onAnimationEnd={() => { if (closing) onClose(); }}
        style={{
          position: 'relative',
          background: '#FAF8F6',
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          overflowY: 'auto',
          maxHeight: '96%',
          animation: closing
            ? 'slideDown 260ms cubic-bezier(0.32, 0.72, 0, 1) forwards'
            : 'slideUp 320ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '18px 20px 0',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-game)',
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '-0.02em',
              color: '#111',
              lineHeight: 1.1,
              marginBottom: 5,
            }}>
              How to Play
            </p>
            <p style={{
              fontFamily: 'var(--font-game)',
              fontSize: 15,
              fontWeight: 400,
              color: '#333',
              lineHeight: 1.4,
            }}>
              Use wordy odds &amp; ends to<br />solve occasionally cryptic clues.
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 26, color: '#555', lineHeight: 1,
              padding: '0 0 0 12px', fontFamily: 'var(--font-ui)',
              flexShrink: 0, marginTop: -2,
            }}
          >
            ×
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #E8E6E3', margin: '14px 0 0' }} />

        {/* Body */}
        <div style={{ padding: '12px 20px 22px', flexShrink: 0 }}>

          {/* Section label + shared clue */}
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#555',
            marginBottom: 14,
          }}>
            Example Clue: <span style={{
              fontFamily: 'var(--font-game)',
              fontWeight: 400,
              fontSize: 16,
              fontStyle: 'italic',
              textTransform: 'none',
              letterSpacing: 0,
              color: '#444',
            }}>Makes sense</span>
          </p>

          {/* Example 1: log placed correctly */}
          <Example
            pool={<>
              <PoolTile text="log" used />
              <PoolTile text="co" />
              <PoolTile text="i" />
              <PoolTile text="cal" />
            </>}
            tray={<>
              <TrayTile text="log" bg={LIGHT_BLUE} />
              <TrayTile empty />
              <TrayTile empty />
            </>}
            caption={<>The <strong>log</strong> tile is in the right spot. It turns blue.</>}
          />

          {/* Example 2: co added, wrong */}
          <Example
            pool={<>
              <PoolTile text="log" used />
              <PoolTile text="co" used />
              <PoolTile text="i" />
              <PoolTile text="cal" />
            </>}
            tray={<>
              <TrayTile text="log" bg={GRAY} />
              <TrayTile text="co"  bg={GRAY} />
              <TrayTile empty />
            </>}
            caption={<>The <strong>co</strong> tile doesn't belong there. All tiles go gray,<br />even correct ones. Try something else.</>}
          />

          {/* Example 3: solved */}
          <Example
            pool={<>
              <PoolTile text="log" used />
              <PoolTile text="co" />
              <PoolTile text="i" used />
              <PoolTile text="cal" used />
            </>}
            tray={<>
              <TrayTile text="log" bg={FULL_BLUE} />
              <TrayTile text="i"   bg={FULL_BLUE} />
              <TrayTile text="cal" bg={FULL_BLUE} />
            </>}
            caption={<>Swap <strong>co</strong> for <strong>i</strong>, add <strong>cal</strong>, and you've solved the clue.<br />All three go blue. Makes sense!</>}
          />

        </div>
      </div>
    </div>
  );
}
