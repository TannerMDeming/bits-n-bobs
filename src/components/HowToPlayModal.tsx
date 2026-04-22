import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

function DemoTrayTile({ text, bg, borderColor }: { text: string; bg: string; borderColor: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 56,
      height: 50,
      padding: '0 10px',
      border: `2.5px solid ${borderColor}`,
      borderRadius: 10,
      background: bg,
      fontFamily: 'var(--font-game)',
      fontWeight: 700,
      fontSize: 16,
      color: '#111',
      transition: 'background 0.2s',
    }}>
      {text}
    </div>
  );
}

function DemoPoolTile({ text, dimmed }: { text: string; dimmed?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${dimmed ? '#CCC' : '#111'}`,
      borderRadius: 8,
      background: dimmed ? '#F5F4F2' : '#FAF8F6',
      fontFamily: 'var(--font-game)',
      fontWeight: 700,
      fontSize: 14,
      color: dimmed ? '#CCC' : '#111',
      padding: '6px 10px',
    }}>
      {text}
    </div>
  );
}

function DemoClue({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-game)',
      fontSize: 15,
      fontWeight: 700,
      textAlign: 'center',
      color: '#111',
      marginBottom: 12,
      letterSpacing: '-0.01em',
    }}>
      {text}
    </p>
  );
}

function ExampleLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-ui)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#8E8E8E',
      marginBottom: 14,
    }}>
      {text}
    </p>
  );
}

export default function HowToPlayModal({ onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: '28px 28px 0 0',
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          paddingBottom: 48,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px 20px 16px',
          borderBottom: '1.5px solid #E8E6E3',
          position: 'sticky',
          top: 0,
          background: 'var(--bg)',
          zIndex: 1,
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
              fontSize: 22,
              color: '#8E8E8E',
              lineHeight: 1,
              padding: '2px 4px',
              fontFamily: 'var(--font-ui)',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 0' }}>

          {/* Intro */}
          <p style={{
            fontFamily: 'var(--font-game)',
            fontSize: 16,
            lineHeight: 1.55,
            color: '#111',
            marginBottom: 28,
          }}>
            Each round gives you a clue. Pick tiles from the pool below to spell the answer — in order.
          </p>

          {/* ── Example 1: Correct ── */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #E8E6E3',
            borderRadius: 16,
            padding: '18px 16px 16px',
            marginBottom: 12,
          }}>
            <ExampleLabel text="Right tiles turn blue" />
            <DemoClue text="Come through" />
            {/* Tray — both correct */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
              <DemoTrayTile text="vis" bg="#9CC0FB" borderColor="#9CC0FB" />
              <DemoTrayTile text="it"  bg="#2871EF" borderColor="#2871EF" />
            </div>
            {/* Pool */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              <DemoPoolTile text="vis" dimmed />
              <DemoPoolTile text="it"  dimmed />
              <DemoPoolTile text="co"  />
              <DemoPoolTile text="al"  />
              <DemoPoolTile text="log" />
            </div>
          </div>

          {/* ── Example 2: Wrong ── */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #E8E6E3',
            borderRadius: 16,
            padding: '18px 16px 16px',
            marginBottom: 28,
          }}>
            <ExampleLabel text="A wrong tile turns gray" />
            <DemoClue text="Come through" />
            {/* Tray — second tile wrong */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
              <DemoTrayTile text="vis" bg="#D1D5DB" borderColor="#C0C4C9" />
              <DemoTrayTile text="co"  bg="#D1D5DB" borderColor="#C0C4C9" />
            </div>
            {/* Pool */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              <DemoPoolTile text="vis" dimmed />
              <DemoPoolTile text="it"  />
              <DemoPoolTile text="co"  dimmed />
              <DemoPoolTile text="al"  />
              <DemoPoolTile text="log" />
            </div>
          </div>

          {/* Footer */}
          <p style={{
            fontFamily: 'var(--font-game)',
            fontSize: 14,
            color: '#8E8E8E',
            lineHeight: 1.6,
            textAlign: 'center',
          }}>
            Five rounds per puzzle.<br />A new one drops every day.
          </p>
        </div>
      </div>
    </div>
  );
}
