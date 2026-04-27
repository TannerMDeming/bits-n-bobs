import { useEffect, useState } from 'react';
import handUrl from '../assets/hand.png';

interface Props { onClose: () => void; onPlay?: () => void; }

// ── Layout ────────────────────────────────────────────────────────────────────
const T  = 56;
const G  = 6;
const W  = 300;

// Pool: [log(0), co(1), i(2), cal(3)]
const POOL_BG_W    = 4 * T + 3 * G + 20;         // 262
const POOL_BG_L    = (W - POOL_BG_W) / 2;         // 19
const PAD_TOP      = 10;                           // small top margin only
const PAD_V        = 8;
const POOL_TOP     = PAD_TOP + PAD_V;             // 18
const poolCx       = (i: number) => POOL_BG_L + 10 + i * (T + G) + T / 2;

// Tray: 3 slots [log, i, cal]
const TRAY_W       = 3 * T + 2 * G;              // 180
const TRAY_L       = (W - TRAY_W) / 2;           // 60
const TRAY_TOP     = PAD_TOP + PAD_V + T + PAD_V + 14;  // 96
const trayCx       = (i: number) => TRAY_L + i * (T + G) + T / 2;

// Hand PNG: 77×101, finger points UP. Displayed at 28×37px.
// Finger tip = CSS top of image. Position so finger overlaps tile bottom by OVERLAP px.
// → hand top = tile_top + T - OVERLAP
const HAND_W       = 28;
const HAND_H       = Math.round(HAND_W * 101 / 77);  // 37
const OVERLAP      = 12;
const POOL_HAND    = (i: number): [number, number] => [poolCx(i),  POOL_TOP + T - OVERLAP];
const TRAY_HAND    = (i: number): [number, number] => [trayCx(i),  TRAY_TOP + T - OVERLAP];

const ANIM_H       = TRAY_TOP + T + HAND_H - OVERLAP + 4;   // 181

// ── Colors ────────────────────────────────────────────────────────────────────
const C1 = '#C3DAFF';
const C2 = '#9CC0FB';
const C3 = '#2871EF';
const CG = '#D1D5DB';

// ── Frames ───────────────────────────────────────────────────────────────────
// Pool order: [log(0), co(1), cal(2), i(3)] — scrambled so answer isn't obvious
// Hand uses CSS handTap animation: enters from below already moving, arrives + presses.
// No separate appear/tap frames — one frame per tap, animation handles the arc.
interface Frame {
  ms:     number;
  used:   number[];
  tray:   (string | null)[];
  wrong:  boolean;
  reveal: boolean;
  hand:   [number, number] | null;
  shake?: boolean;
}

const FRAMES: Frame[] = [
  // 0 — idle
  { ms: 800,  used: [],         tray: [null, null, null],    wrong: false, reveal: false, hand: null },
  // 1 — tap log (pool[0])
  { ms: 420,  used: [],         tray: [null, null, null],    wrong: false, reveal: false, hand: POOL_HAND(0) },
  // 2 — log placed
  { ms: 320,  used: [0],        tray: ['log', null, null],   wrong: false, reveal: false, hand: null },
  // 3 — tap co (pool[1])
  { ms: 420,  used: [0],        tray: ['log', null, null],   wrong: false, reveal: false, hand: POOL_HAND(1) },
  // 4 — co placed: gray + shake
  { ms: 650,  used: [0, 1],     tray: ['log', 'co', null],   wrong: true,  reveal: false, hand: null, shake: true },
  // 5 — tap co in tray to remove (slot 1)
  { ms: 420,  used: [0, 1],     tray: ['log', 'co', null],   wrong: true,  reveal: false, hand: TRAY_HAND(1) },
  // 6 — co removed, log back to blue
  { ms: 280,  used: [0],        tray: ['log', null, null],   wrong: false, reveal: false, hand: null },
  // 7 — tap i (pool[3])
  { ms: 420,  used: [0],        tray: ['log', null, null],   wrong: false, reveal: false, hand: POOL_HAND(3) },
  // 8 — i placed (log + i)
  { ms: 320,  used: [0, 3],     tray: ['log', 'i', null],    wrong: false, reveal: false, hand: null },
  // 9 — tap cal (pool[2])
  { ms: 420,  used: [0, 3],     tray: ['log', 'i', null],    wrong: false, reveal: false, hand: POOL_HAND(2) },
  // 10 — all placed, full blue
  { ms: 550,  used: [0, 2, 3],  tray: ['log', 'i', 'cal'],   wrong: false, reveal: false, hand: null },
  // 11 — reveal
  { ms: 1100, used: [0, 2, 3],  tray: ['log', 'i', 'cal'],   wrong: false, reveal: true,  hand: null },
];

const POOL_LABELS = ['log', 'co', 'cal', 'i'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HowToPlayModal({ onClose, onPlay }: Props) {
  const [closing,    setClosing]    = useState(false);
  const [playOnClose, setPlayOnClose] = useState(false);
  const [fi,         setFi]         = useState(0);
  const [shakeKey,   setShakeKey]   = useState(0);

  const handleClose = () => setClosing(true);
  const handlePlay  = () => { setPlayOnClose(true); setClosing(true); };

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

  const { used, tray, wrong, reveal, hand } = FRAMES[fi];
  const filled    = tray.filter(Boolean).length;
  const tileColor = wrong ? CG
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
        onAnimationEnd={() => { if (closing) { playOnClose && onPlay ? onPlay() : onClose(); } }}
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
            overflow: 'visible',
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
                animation: shakeKey > 0 ? 'trayShake 300ms ease-in-out' : 'none',
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

            {/* Hand — appears/disappears per tap, finger points UP into tile */}
            {hand && (
              <img
                src={handUrl}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: hand[0] - HAND_W / 2,
                  top:  hand[1],
                  width:  HAND_W,
                  height: HAND_H,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  imageRendering: 'pixelated',
                  transformOrigin: 'center top',
                  // Single continuous arc: enters from below already moving, arrives + presses
                  animation: 'handTap 420ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                }}
              />
            )}
          </div>

          {/* Clue — below animation, like in the game */}
          <p style={{
            fontFamily: 'var(--font-game)', fontWeight: 400,
            fontSize: 20, color: '#111',
            textAlign: 'center', marginTop: 2,
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
              'Correct tiles light up. A wrong tile turns your whole guess gray. Tap to remove and try again.',
              'Feeling stuck? Use the arrows to save a clue for\u00a0later.',
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
              onClick={handlePlay}
              style={{
                height: 48, padding: '0 44px',
                background: '#111', color: '#FAF8F6',
                border: 'none', borderRadius: 100,
                fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', letterSpacing: '0.01em',
              }}
            >
              Play
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
