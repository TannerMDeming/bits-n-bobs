import logoUrl from '../assets/logo.png';

interface Props {
  onPlay: () => void;
}

export default function StartScreen({ onPlay }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      // Shift content slightly above center to match Figma (~43% from top)
      paddingBottom: 100,
      padding: '0 50px 100px',
      textAlign: 'center',
    }}>
      {/* Logo — Figma: 802px wide in 1080px frame → 278px CSS, ~50px side margins */}
      <img
        src={logoUrl}
        alt="Bits & Bobs"
        style={{ width: '100%', maxWidth: 278, marginBottom: 24 }}
        draggable={false}
      />

      {/* Tagline — Figma: Serifa 400, ~20px, 115% line-height, 678px → 235px CSS wide */}
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

      {/* Play button — Figma: Inter 800, ~16px, color #FFFDFC, height ~50px */}
      <button
        onClick={onPlay}
        style={{
          background: '#111',
          color: '#FFFDFC',
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
        }}
      >
        Play
      </button>
    </div>
  );
}
