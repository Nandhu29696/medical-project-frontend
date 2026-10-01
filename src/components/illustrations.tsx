/**
 * Hand-built SVG illustrations (no stock imagery or licensing concerns). Colours come
 * from Tailwind classes so they follow the brand palette and dark mode.
 */
import clsx from "clsx";

type Props = { className?: string };

export function HeroBrainIllustration({ className }: Props) {
  const nodes: [number, number][] = [
    [70, 120], [95, 300], [400, 110], [420, 290], [240, 40], [60, 210], [430, 200],
  ];
  return (
    <svg viewBox="0 0 480 420" className={clsx("h-full w-full", className)} role="img" aria-label="Illustration of a brain with neural connections">
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--brand-100))" />
          <stop offset="100%" stopColor="rgb(var(--accent-100))" />
        </linearGradient>
        <linearGradient id="hero-brain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--brand-400))" />
          <stop offset="100%" stopColor="rgb(var(--accent-500))" />
        </linearGradient>
      </defs>
      <circle cx="240" cy="210" r="185" fill="url(#hero-bg)" className="dark:opacity-30" />
      <circle cx="240" cy="210" r="140" fill="white" opacity="0.55" className="dark:opacity-10" />
      {/* neural network */}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={240} y2={200} stroke="rgb(var(--brand-300))" strokeWidth="2" strokeDasharray="4 6" />
          <circle cx={x} cy={y} r="9" fill="white" stroke="rgb(var(--brand-500))" strokeWidth="3" />
        </g>
      ))}
      {/* brain */}
      <g className="origin-center animate-float">
        <path
          d="M150 212 C138 150 190 108 246 114 C302 104 352 140 346 196 C362 232 336 272 300 276 C290 302 250 306 236 286 C206 302 164 288 166 256 C144 250 138 230 150 212 Z"
          fill="url(#hero-brain)"
        />
        <path d="M246 116 C236 160 250 220 236 286" stroke="white" strokeWidth="4" fill="none" opacity="0.7" strokeLinecap="round" />
        {[
          "M180 170 C200 160 215 180 232 168",
          "M170 215 C190 200 212 222 230 208",
          "M186 258 C204 244 220 262 232 250",
          "M262 150 C280 140 296 160 318 150",
          "M258 200 C278 186 298 210 330 196",
          "M262 246 C284 232 300 254 318 242",
        ].map((d) => (
          <path key={d} d={d} stroke="white" strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round" />
        ))}
        <path d="M236 286 C238 310 250 326 262 336" stroke="rgb(var(--brand-700))" strokeWidth="14" strokeLinecap="round" fill="none" />
      </g>
      {/* capsules */}
      <g transform="rotate(-30 110 360)">
        <rect x="80" y="345" width="64" height="26" rx="13" fill="rgb(var(--accent-500))" />
        <rect x="112" y="345" width="32" height="26" rx="13" fill="rgb(var(--accent-100))" />
      </g>
      <g transform="rotate(25 380 70)">
        <rect x="352" y="58" width="56" height="22" rx="11" fill="rgb(var(--brand-500))" />
        <rect x="380" y="58" width="28" height="22" rx="11" fill="rgb(var(--brand-100))" />
      </g>
      {/* leaf */}
      <path d="M395 355 C400 315 440 300 455 300 C455 330 435 360 395 355 Z" fill="rgb(var(--brand-400))" />
      <path d="M398 352 C415 335 432 320 452 304" stroke="rgb(var(--brand-700))" strokeWidth="2" fill="none" />
      {/* sparkles */}
      {[[350, 330], [120, 70], [300, 30]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3} Z`} fill="rgb(var(--accent-400))" />
      ))}
    </svg>
  );
}

export function DoctorIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 240 240" className={clsx("h-full w-full", className)} role="img" aria-label="Doctor illustration">
      <circle cx="120" cy="120" r="112" className="fill-brand-50" />
      <path d="M52 232 C56 176 84 152 120 152 C156 152 184 176 188 232 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M104 152 L120 190 L136 152" fill="rgb(var(--brand-500))" />
      <path d="M92 158 C80 190 92 214 112 212" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="113" cy="212" r="7" fill="#64748b" />
      <rect x="108" y="128" width="24" height="28" rx="8" fill="#f2c7a5" />
      <circle cx="120" cy="100" r="36" fill="#f6d2b3" />
      <path d="M84 98 C82 64 158 58 156 98 C150 80 120 74 98 84 C92 88 88 94 84 98 Z" fill="#1e293b" />
      <circle cx="107" cy="102" r="3.5" fill="#1e293b" />
      <circle cx="133" cy="102" r="3.5" fill="#1e293b" />
      <path d="M110 118 C116 123 124 123 130 118" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="150" y="176" width="34" height="44" rx="5" fill="rgb(var(--accent-500))" />
      <rect x="156" y="184" width="22" height="3" rx="1.5" fill="white" />
      <rect x="156" y="192" width="16" height="3" rx="1.5" fill="white" />
      <rect x="156" y="200" width="20" height="3" rx="1.5" fill="white" />
    </svg>
  );
}

export function SleepIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="fill-accent-50" />
      <path d="M72 30 A32 32 0 1 0 90 78 A26 26 0 1 1 72 30 Z" fill="rgb(var(--accent-500))" />
      <path d="M30 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="rgb(var(--accent-400))" />
      <path d="M92 40 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z" fill="rgb(var(--accent-400))" />
      <text x="84" y="30" fontSize="14" fontWeight="700" fill="rgb(var(--accent-600))">z</text>
      <text x="94" y="20" fontSize="10" fontWeight="700" fill="rgb(var(--accent-400))">z</text>
    </svg>
  );
}

export function FocusIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="fill-brand-50" />
      <path d="M60 24 C42 24 32 38 32 52 C32 64 40 70 44 78 L76 78 C80 70 88 64 88 52 C88 38 78 24 60 24 Z" fill="rgb(var(--brand-500))" />
      <rect x="46" y="82" width="28" height="8" rx="3" fill="rgb(var(--brand-700))" />
      <rect x="50" y="92" width="20" height="6" rx="3" fill="rgb(var(--brand-700))" />
      <path d="M60 36 L60 50 M50 44 L60 54 L70 44" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 40 L28 44 M100 40 L92 44 M60 10 L60 18" stroke="rgb(var(--brand-400))" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function StressIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="fill-blue-50" />
      <path d="M60 94 C30 74 22 58 22 44 C22 32 32 24 42 24 C50 24 56 28 60 36 C64 28 70 24 78 24 C88 24 98 32 98 44 C98 58 90 74 60 94 Z" fill="#3b82f6" />
      <path d="M30 56 L46 56 L52 44 L60 68 L68 50 L74 56 L90 56" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeadacheIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="fill-amber-50" />
      <circle cx="60" cy="60" r="28" fill="#f59e0b" />
      <path d="M48 56 C52 52 56 52 58 56 M62 56 C64 52 68 52 72 56" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M50 72 C56 68 64 68 70 72" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M26 30 L36 38 M94 30 L84 38 M18 60 L28 60 M102 60 L92 60" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <path d="M60 12 L98 26 L98 58 C98 82 82 100 60 108 C38 100 22 82 22 58 L22 26 Z" fill="rgb(var(--brand-500))" />
      <path d="M60 22 L88 32 L88 58 C88 76 76 90 60 97 Z" fill="rgb(var(--brand-400))" />
      <path d="M44 60 L56 72 L78 48" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 160 140" className={clsx("h-full w-full", className)} aria-hidden="true">
      <rect x="18" y="24" width="124" height="104" rx="14" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="18" y="24" width="124" height="28" rx="14" fill="rgb(var(--brand-500))" />
      <rect x="18" y="40" width="124" height="12" fill="rgb(var(--brand-500))" />
      <rect x="42" y="14" width="8" height="22" rx="4" fill="rgb(var(--brand-700))" />
      <rect x="110" y="14" width="8" height="22" rx="4" fill="rgb(var(--brand-700))" />
      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={32 + col * 26}
            y={62 + row * 20}
            width="18"
            height="12"
            rx="3"
            fill={col === 2 && row === 1 ? "rgb(var(--accent-500))" : "#e2e8f0"}
          />
        ))
      )}
      <circle cx="132" cy="112" r="20" fill="rgb(var(--accent-500))" />
      <path d="M132 100 L132 112 L140 118" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function DeliveryIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <rect x="14" y="40" width="58" height="42" rx="6" fill="rgb(var(--brand-500))" />
      <path d="M72 52 L94 52 L106 66 L106 82 L72 82 Z" fill="rgb(var(--brand-400))" />
      <rect x="80" y="57" width="12" height="10" rx="2" fill="white" />
      <circle cx="34" cy="86" r="10" fill="#1e293b" />
      <circle cx="90" cy="86" r="10" fill="#1e293b" />
      <circle cx="34" cy="86" r="4" fill="white" />
      <circle cx="90" cy="86" r="4" fill="white" />
      <path d="M26 56 L60 56 M26 66 L50 66" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function SupportIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <path d="M26 64 C26 40 42 24 60 24 C78 24 94 40 94 64" stroke="rgb(var(--accent-500))" strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="18" y="60" width="18" height="30" rx="8" fill="rgb(var(--accent-500))" />
      <rect x="84" y="60" width="18" height="30" rx="8" fill="rgb(var(--accent-500))" />
      <path d="M93 90 C93 102 80 104 66 104" stroke="rgb(var(--accent-400))" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="62" cy="104" r="6" fill="rgb(var(--accent-600))" />
    </svg>
  );
}

export function EmptyIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <circle cx="60" cy="60" r="54" className="fill-slate-100" />
      <rect x="34" y="26" width="52" height="68" rx="8" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="46" y="20" width="28" height="12" rx="4" fill="rgb(var(--brand-500))" />
      <rect x="44" y="46" width="32" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="44" y="58" width="24" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="44" y="70" width="28" height="5" rx="2.5" fill="#e2e8f0" />
      <circle cx="86" cy="86" r="14" fill="rgb(var(--accent-500))" />
      <path d="M81 86 L91 86 M86 81 L86 91" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MapIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 320 200" className={clsx("h-full w-full", className)} role="img" aria-label="Map showing clinic location">
      <rect width="320" height="200" rx="16" className="fill-brand-50" />
      <path d="M0 140 C60 120 90 160 150 140 C210 120 250 150 320 130 L320 200 L0 200 Z" fill="rgb(var(--brand-200))" opacity="0.7" />
      <path d="M20 40 L300 170 M40 180 L260 20 M0 90 L320 100" stroke="white" strokeWidth="10" />
      <path d="M20 40 L300 170 M40 180 L260 20 M0 90 L320 100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
      <rect x="60" y="30" width="40" height="30" rx="4" fill="rgb(var(--accent-200))" />
      <rect x="220" y="120" width="50" height="34" rx="4" fill="rgb(var(--accent-200))" />
      <path d="M160 52 C140 52 128 66 128 82 C128 104 160 132 160 132 C160 132 192 104 192 82 C192 66 180 52 160 52 Z" fill="rgb(var(--accent-500))" />
      <circle cx="160" cy="82" r="11" fill="white" />
    </svg>
  );
}

export function ReportIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={clsx("h-full w-full", className)} aria-hidden="true">
      <rect x="26" y="16" width="68" height="88" rx="8" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="36" y="30" width="30" height="6" rx="3" fill="rgb(var(--brand-500))" />
      <path d="M36 74 L50 60 L62 68 L84 46" stroke="rgb(var(--accent-500))" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="36" y="84" width="48" height="5" rx="2.5" fill="#e2e8f0" />
    </svg>
  );
}

export function ProductBottleIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 200 260" className={clsx("h-full w-full", className)} role="img" aria-label="Product bottle illustration">
      <ellipse cx="100" cy="240" rx="70" ry="10" fill="#0f172a" opacity="0.12" />
      <rect x="72" y="14" width="56" height="34" rx="8" fill="#1e293b" />
      <rect x="44" y="44" width="112" height="190" rx="26" fill="white" stroke="#e2e8f0" strokeWidth="3" />
      <rect x="44" y="96" width="112" height="90" fill="rgb(var(--brand-500))" />
      <text x="100" y="132" textAnchor="middle" fontSize="15" fontWeight="800" fill="white">MEDIANCE</text>
      <text x="100" y="152" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">NEURO LIFE</text>
      <text x="100" y="172" textAnchor="middle" fontSize="9" fill="rgb(var(--brand-100))">DEMO</text>
      <path d="M58 60 L58 220" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
