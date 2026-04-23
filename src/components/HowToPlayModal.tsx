import { useEffect, useState } from 'react';
import handUrl from '../assets/hand.png';

interface Props { onClose: () => void; }

// ── Layout ────────────────────────────────────────────────────────────────────
const T   = 56;   // tile size (px)
const G   = 6;    // tile gap
const W   = 300;  // animation viewport width

// Pool: 4 tiles [log, co, i, cal]
const POOL_BG_W = 4 * T + 3 * G + 20;          // 262
const POOL_BG_L = (W - POOL_BG_W) / 2;          // 19
const PAD_TOP   = 48;                            // space above pool bg for hand
const PAD_V     = 8;                             // pool vertical padding
const POOL_TOP  = PAD_TOP + PAD_V;              // 56 — top of pool tiles
const poolCx    = (i: number) => POOL_BG_L + 10 + i * (T + G) + T / 2;

// Tray: 3 slots
const TRAY_W    = 3 * T + 2 * G;               // 180
const TRAY_L    = (W - TRAY_W) / 2;            // 60
const TRAY_GAP  = 12;
const TRAY_TOP  = PAD_TOP + PAD_V + T + PAD_V + TRAY_GAP;  // 132
const trayCx    = (i: number) => TRAY_L + i * (T + G) + T / 2;

const ANIM_H    = TRAY_TOP + T + 10;           // 198

// Hand PNG: 77×101 original, displayed at 34×(34*101/77)≈45px
// Flipped via scaleY(-1) so finger points down.
// Finger tip (after flip) is at the CSS bottom of the element.
// We position so the tip is ~10px below the tile top edge.
// → element top = tile_top - HAND_H + 10
const HAND_W  = 34;
const HAND_H  = Math.round(34 * 101 / 77);     // ≈ 45

const handTop = (tileTop: number) => tileTop - HAND_H + 10;
const POOL_HAND = (i: number): [number, number] => [poolCx(i), handTop(POOL_TOP)];
const TRAY_HAND = (i: number): [number, number] => [trayCx(i), handTop(TRAY_TOP)];

// ── Colors ────────────────────────────────────────────────────────────────────
const C1 = '#C3DAFF';
const C2 = '#9CC0FB';
const C3 = '#2871EF';
const CG = '#D1D5DB';

// ── Frames ───────────────────────────────────────────────────────────────────
// Hand appears ONLY at the moment of a tap — no position transitions.
// Frames alternate: hand-ready → hand-tap → state-change.

interface Frame {
  ms:         number;
  used:       number[];            // pool tile indices to dim
  tray:       (string | null)[];  // 3 slots
  wrong:      boolean;
  reveal:     boolean;
  hand:       [number, number] | null;
  tap?:       boolean;             // true = hand in pressed state (scale down)
  shake?:     boolean;
}

const FRAMES: Frame[] = [
  // 0 — idle: show tiles, no hand
  { ms: 900, used: [], tray: [null, null, null], wrong: false, reveal: false, hand: null },

  // 1 — hand appears over "co"
  { ms: 250, used: [], tray: [null, null, null], wrong: false, reveal: false, hand: POOL_HAND(1) },
  // 2 — tap "co"
  { ms: 150, used: [], tray: [null, null, null], wrong: false, reveal: false, hand: POOL_HAND(1), tap: true },
  // 3 — co placed: gray + shake, hand gone
  { ms: 650, used: [1], tray: ['co', null, null], wrong: true, reveal: false, hand: null, shake: true },

  // 4 — hand appears over tray[0] to return co
  { ms: 250, used: [1], tray: ['co', null, null], wrong: true, reveal: false, hand: TRAY_HAND(0) },
  // 5 — tap tray[0]
  { ms: 150, used: [1], tray: ['co', null, null], wrong: true, reveal: false, hand: TRAY_HAND(0), tap: true },
  // 6 — co returned, tray empty, hand gone
  { ms: 300, used: [], tray: [null, null, null], wrong: false, reveal: false, hand: null },

  // 7 — hand appears over "log"
  { ms: 250, used: [], tray: [null, null, null], wrong: false, reveal: false, hand: POOL_HAND(0) },
  // 8 — tap "log"
  { ms: 150, used: [], tray: [null, null, null], wrong: false, reveal: false, hand: POOL_HAND(0), tap: true },
  // 9 — log placed, hand gone
  { ms: 380, used: [0], tray: ['log', null, null], wrong: false, reveal: false, hand: null },

  // 10 — hand appears over "i"
  { ms: 250, used: [0], tray: ['log', null, null], wrong: false, reveal: false, hand: POOL_HAND(2) },
  // 11 — tap "i"
  { ms: 150, used: [0], tray: ['log', null, null], wrong: false, reveal: false, hand: POOL_HAND(2), tap: true },
  // 12 — i placed
  { ms: 380, used: [0, 2], tray: ['log', 'i', null], wrong: false, reveal: false, hand: null },

  // 13 — hand appears over "cal"
  { ms: 250, used: [0, 2], tray: ['log', 'i', null], wrong: false, reveal: false, hand: POOL_HAND(3) },
  // 14 — tap "cal"
  { ms: 150, used: [0, 2], tray: ['log', 'i', null], wrong: false, reveal: false, hand: POOL_HAND(3), tap: true },
  // 15 — all placed, full blue
  { ms: 550, used: [0, 2, 3], tray: ['log', 'i', 'cal'], wrong: false, reveal: false, hand: null },

  // 16 — reveal bar
  { ms: 1100, used: [0, 2, 3], tray: ['log', 'i', 'cal'], wrong: false, reveal: true, hand: null },
];

const POOL_LABELS = ['log', 'co', 'i', 'cal'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HowToPlayModal({ onClose }: Props) {
  const [closing,  setClosing]  = useState(false);
  const [fi,       setFi]       = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const handleClose = () => setClosing(true);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    const frame = FRAMES[fi];
    if (frame.shake) setShakeKey(k => k + 1);
    const t = setTimeout(() => setFi(n => (n + 1) % FRAMES.length), frame.ms);
    return () => clearTimeout(t);
  }, [fi]);

  const { used, tray, wrong, reveal, hand, tap } = FRAMES[fi];
  const filled     = tray.filter(Boolean).length;
  const tileColor  = wrong ? CG
    : filled === 1 ? C1
    : filled === 2 ? C2
    : C3;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
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
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          overflowY: 'auto', maxHeight: '96%',
          animation: closing
            ? 'slideDown 260ms cubic-bezier(0.32,0.72,0,1) forwards'
            : 'slideUp 320ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '18px 20px 0', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 24,
              letterSpacing: '-0.02em', color: '#111', lineHeight: 1.1, marginBottom: 5,
            }}>How to Play</p>
            <p style={{
              fontFamily: 'var(--font-game)', fontSize: 15, fontWeight: 400,
              color: '#333', lineHeight: 1.4,
            }}>Use wordy odds &amp; ends to<br />solve occasionally cryptic clues.</p>
          </div>
          <button onClick={handleClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 26, color: '#555', lineHeight: 1,
            padding: '0 0 0 12px', flexShrink: 0, marginTop: -2,
          }}>×</button>
        </div>

        <div style={{ borderTop: '1px solid #E8E6E3', margin: '14px 0 0' }} />

        {/* Body */}
        <div style={{ padding: '16px 20px 28px', flexShrink: 0 }}>

          {/* ── Animation area ── */}
          <div style={{
            position: 'relative',
            width: W, height: ANIM_H,
            maxWidth: '100%',
            margin: '0 auto',
          }}>

            {/* Pool */}
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
                    border: `2.5px solid ${isUsed ? '#DADADA' : '#111'}`,
                    borderRadius: 8,
                    background: isUsed ? '#EBEBEB' : '#FFF',
                    fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 16,
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

            {/* Tray */}
            <div
              key={`tray-${shakeKey}`}
              style={{
                position: 'absolute',
                left: TRAY_L, top: TRAY_TOP,
                display: 'flex', gap: G,
                animation: shakeKey > 0 && fi === 3
                  ? 'trayShake 300ms ease-in-out'
                  : 'none',
              }}
            >
              {tray.map((tile, i) => (
                <div key={i} style={{
                  width: T, height: T, flexShrink: 0,
                  border: `2.5px solid ${tile ? '#111' : '#DADADA'}`,
                  borderRadius: 8,
                  background: tile ? tileColor : '#EBEBEB',
                  fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 16,
                  color: tile ? '#111' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.18s ease, border-color 0.18s ease',
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
                border: '2.5px solid #111',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-game)', fontWeight: 700, fontSize: 20,
                color: '#111',
                animation: 'barIn 360ms cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}>
                logical
              </div>
            )}

            {/* Hand — freshly mounted at each tap position, no position transitions */}
            {hand && (
              <img
                src={handUrl}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: hand[0] - HAND_W / 2,
                  top:  hand[1],
                  width: HAND_W,
                  height: HAND_H,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  imageRendering: 'pixelated',
                  // Flip so finger points down; scale down on tap
                  transform: `scaleY(-1) scale(${tap ? 0.82 : 1})`,
                  transformOrigin: 'center bottom',
                  transition: 'transform 110ms ease',
                }}
              />
            )}

          </div>

          {/* Clue — lives below the tray like in the game */}
          <p style={{
            fontFamily: 'var(--font-game)', fontWeight: 400,
            fontSize: 20, color: '#111',
            textAlign: 'center', marginTop: 14,
            lineHeight: 1.3,
          }}>
            Makes sense
          </p>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E8E6E3', margin: '16px 0' }} />

          {/* Rules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Tap tiles to piece together the answer.',
              'Correct tiles light up. A wrong one turns your whole guess gray. Tap to remove and try again.',
              'Feeling stuck? Use the arrows to save a clue for later.',
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                  color: '#888', marginTop: 2, flexShrink: 0,
                }}>{i + 1}.</span>
                <p style={{
                  fontFamily: 'var(--font-game)', fontSize: 14,
                  color: '#333', lineHeight: 1.45, margin: 0,
                }}>{rule}</p>
              </div>
            ))}
          </div>

          {/* Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
            <button
              onClick={handleClose}
              style={{
                height: 48,
                padding: '0 36px',
                background: '#111', color: '#FAF8F6',
                border: 'none', borderRadius: 100,
                fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', letterSpacing: '0.01em',
                flexShrink: 0,
              }}
            >
              Makes sense
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
