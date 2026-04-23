import { useEffect, useState } from 'react';

interface Props { onClose: () => void; }

// ── Layout ────────────────────────────────────────────────────────────────────
const T  = 38;   // tile size
const G  = 5;    // gap
const W  = 280;  // animation viewport width

// Pool: 4 tiles  [log, co, i, cal]
const POOL_BG_W  = 4 * T + 3 * G + 20;          // 187 (10px h-pad each side)
const POOL_BG_L  = (W - POOL_BG_W) / 2;          // 46.5
const PAD_TOP    = 36;                            // space above pool for hand
const PAD_V      = 8;                             // pool vertical padding
const POOL_TOP   = PAD_TOP + PAD_V;              // 44  — top of pool tiles
const poolCx     = (i: number) => POOL_BG_L + 10 + i * (T + G) + T / 2;

// Tray: 3 slots
const TRAY_W     = 3 * T + 2 * G;               // 124
const TRAY_L     = (W - TRAY_W) / 2;            // 78
const TRAY_TOP   = PAD_TOP + PAD_V + T + PAD_V + 10;  // 100
const trayCx     = (i: number) => TRAY_L + i * (T + G) + T / 2;

const ANIM_H     = TRAY_TOP + T + 8;            // 146

// Hand: 👇 emoji. We position so fingertip is just above tile center.
// fingertip = hand_top + ~24px (rendered height). Target: tile_top + T/2.
// → hand_top = tile_top + T/2 - 24
const hx = (tileTop: number) => tileTop + T / 2 - 24;
const OVER_POOL = (i: number): [number, number] => [poolCx(i), hx(POOL_TOP)];  // y=39
const OVER_TRAY = (i: number): [number, number] => [trayCx(i), hx(TRAY_TOP)]; // y=95

// ── Colors ────────────────────────────────────────────────────────────────────
const C1 = '#C3DAFF';   // 1 tile correct
const C2 = '#9CC0FB';   // 2 tiles correct
const C3 = '#2871EF';   // all correct / reveal bar
const CG = '#D1D5DB';   // wrong state

// ── Frame table ───────────────────────────────────────────────────────────────
interface Frame {
  ms:     number;
  used:   number[];             // pool indices grayed out
  tray:   (string | null)[];   // 3 slots
  wrong:  boolean;
  reveal: boolean;
  hand:   [number, number] | null;  // [x, y] absolute within anim area
  shake?: boolean;              // trigger tray shake on this frame
}

const FRAMES: Frame[] = [
  // 0 — idle: tray empty, no hand
  { ms: 900,  used: [],      tray: [null, null, null],   wrong: false, reveal: false, hand: null },
  // 1 — hand appears over co tile (fresh mount → no transition needed)
  { ms: 350,  used: [],      tray: [null, null, null],   wrong: false, reveal: false, hand: OVER_POOL(1) },
  // 2 — tap co: wrong placement, gray + shake; hand moves to tray[0]
  { ms: 750,  used: [1],     tray: ['co', null, null],   wrong: true,  reveal: false, hand: OVER_TRAY(0), shake: true },
  // 3 — hand moves back to pool (co returned, tray empties)
  { ms: 350,  used: [],      tray: [null, null, null],   wrong: false, reveal: false, hand: OVER_POOL(0) },
  // 4 — tap log: placed in slot 0; hand at tray[0]
  { ms: 500,  used: [0],     tray: ['log', null, null],  wrong: false, reveal: false, hand: OVER_TRAY(0) },
  // 5 — hand moves to i
  { ms: 350,  used: [0],     tray: ['log', null, null],  wrong: false, reveal: false, hand: OVER_POOL(2) },
  // 6 — tap i: placed in slot 1; hand at tray[1]
  { ms: 500,  used: [0, 2],  tray: ['log', 'i', null],   wrong: false, reveal: false, hand: OVER_TRAY(1) },
  // 7 — hand moves to cal
  { ms: 350,  used: [0, 2],  tray: ['log', 'i', null],   wrong: false, reveal: false, hand: OVER_POOL(3) },
  // 8 — tap cal: all placed, full blue; hand at tray[2]
  { ms: 650,  used: [0, 2, 3], tray: ['log', 'i', 'cal'], wrong: false, reveal: false, hand: OVER_TRAY(2) },
  // 9 — reveal bar; hand fades (null)
  { ms: 1100, used: [0, 2, 3], tray: ['log', 'i', 'cal'], wrong: false, reveal: true,  hand: null },
];

const POOL_LABELS = ['log', 'co', 'i', 'cal'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HowToPlayModal({ onClose }: Props) {
  const [closing,  setClosing]  = useState(false);
  const [fi,       setFi]       = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const handleClose = () => setClosing(true);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Animation loop
  useEffect(() => {
    const frame = FRAMES[fi];
    if (frame.shake) setShakeKey(k => k + 1);
    const t = setTimeout(() => setFi(n => (n + 1) % FRAMES.length), frame.ms);
    return () => clearTimeout(t);
  }, [fi]);

  const { used, tray, wrong, reveal, hand } = FRAMES[fi];
  const filledCount = tray.filter(Boolean).length;
  const tileColor   = wrong
    ? CG
    : filledCount === 1 ? C1
    : filledCount === 2 ? C2
    : C3;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          opacity: closing ? 0 : 1,
          transition: 'opacity 260ms ease',
        }}
      />

      {/* Sheet */}
      <div
        onAnimationEnd={() => { if (closing) onClose(); }}
        style={{
          position: 'relative',
          background: '#FAF8F6',
          borderRadius: '24px 24px 0 0',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          overflowY: 'auto', maxHeight: '96%',
          animation: closing
            ? 'slideDown 260ms cubic-bezier(0.32,0.72,0,1) forwards'
            : 'slideUp 320ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '18px 20px 0', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 24,
              letterSpacing: '-0.02em', color: '#111', lineHeight: 1.1, marginBottom: 5,
            }}>
              How to Play
            </p>
            <p style={{
              fontFamily: 'var(--font-game)', fontSize: 15, fontWeight: 400,
              color: '#333', lineHeight: 1.4,
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
          >×</button>
        </div>

        <div style={{ borderTop: '1px solid #E8E6E3', margin: '14px 0 0' }} />

        {/* ── Body ── */}
        <div style={{ padding: '16px 20px 28px', flexShrink: 0 }}>

          {/* Clue label */}
          <p style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.07em', color: '#555',
            marginBottom: 14, textAlign: 'center',
          }}>
            Clue:{'  '}
            <span style={{
              fontFamily: 'var(--font-game)', fontWeight: 400, fontSize: 16,
              fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: '#444',
            }}>
              Makes sense
            </span>
          </p>

          {/* ── Animation area ── */}
          <div style={{
            position: 'relative',
            width: W, height: ANIM_H,
            maxWidth: '100%',
            margin: '0 auto',
          }}>

            {/* Pool bg + tiles */}
            <div style={{
              position: 'absolute',
              left: POOL_BG_L, top: PAD_TOP,
              width: POOL_BG_W,
              background: '#EDEAE6',
              borderRadius: 10,
              padding: `${PAD_V}px 10px`,
              display: 'flex', gap: G,
            }}>
              {POOL_LABELS.map((label, i) => {
                const isUsed = used.includes(i);
                return (
                  <div key={label} style={{
                    width: T, height: T, flexShrink: 0,
                    border: `2px solid ${isUsed ? '#DADADA' : '#111'}`,
                    borderRadius: 7,
                    background: isUsed ? '#EBEBEB' : '#FFF',
                    fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 13,
                    color: isUsed ? 'transparent' : '#111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                    userSelect: 'none',
                  }}>
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Tray — key change re-triggers shake animation */}
            <div
              key={`tray-${shakeKey}`}
              style={{
                position: 'absolute',
                left: TRAY_L, top: TRAY_TOP,
                display: 'flex', gap: G,
                animation: shakeKey > 0 && fi === 2
                  ? 'trayShake 300ms ease-in-out'
                  : 'none',
              }}
            >
              {tray.map((tile, i) => (
                <div key={i} style={{
                  width: T, height: T, flexShrink: 0,
                  border: `2px solid ${tile ? '#111' : '#DADADA'}`,
                  borderRadius: 7,
                  background: tile ? tileColor : '#EBEBEB',
                  fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 13,
                  color: tile ? '#111' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                  userSelect: 'none',
                }}>
                  {tile ?? ''}
                </div>
              ))}
            </div>

            {/* Reveal bar */}
            {reveal && (
              <div style={{
                position: 'absolute',
                left: TRAY_L, top: TRAY_TOP,
                width: TRAY_W, height: T,
                background: C3,
                border: '2px solid #111',
                borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 17,
                color: '#111',
                animation: 'barIn 360ms cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}>
                logical
              </div>
            )}

            {/* Hand cursor — only rendered when hand !== null; fresh mount = no stale transition */}
            {hand && (
              <div style={{
                position: 'absolute',
                left: hand[0],
                top:  hand[1],
                transform: 'translateX(-50%)',
                fontSize: 22,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
                transition: 'left 380ms cubic-bezier(0.4,0,0.2,1), top 320ms cubic-bezier(0.4,0,0.2,1)',
              }}>
                👇
              </div>
            )}

          </div>

          {/* ── Rules ── */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              'Tap tiles from the bank to fill the answer slots.',
              "If the tray goes gray, something\u2019s wrong \u2014 tap a tray tile to return it.",
              'Skip clues with the arrows and come back any time.',
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                  color: '#888', marginTop: 2, flexShrink: 0,
                }}>
                  {i + 1}.
                </span>
                <p style={{
                  fontFamily: 'var(--font-game)', fontSize: 14,
                  color: '#333', lineHeight: 1.45, margin: 0,
                }}>
                  {rule}
                </p>
              </div>
            ))}
          </div>

          {/* Got it */}
          <button
            onClick={handleClose}
            style={{
              marginTop: 22,
              width: '100%', height: 48,
              background: '#111', color: '#FAF8F6',
              border: 'none', borderRadius: 100,
              fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16,
              cursor: 'pointer', letterSpacing: '0.01em',
              flexShrink: 0,
            }}
          >
            Got it
          </button>

        </div>
      </div>
    </div>
  );
}
