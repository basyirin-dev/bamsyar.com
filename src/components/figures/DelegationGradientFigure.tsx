// src/components/figures/DelegationGradientFigure.tsx
// Interactive delegation gradient. Slider controls AI capability level,
// showing how 𝒟* expands and where the σ-gate suppresses delegation.
// Hydration: client:visible

import { useState } from "react";
import { COLORS, CANVAS } from "./tokens";

// Destructure colors for backward compatibility
const {
  SURFACE,
  BORDER,
  ACCENT,
  SECONDARY,
  EMERALD,
  ROSE,
  AMBER,
  MUTED,
  TEXT_MAIN,
  TEXT_DIM,
} = COLORS;

// ── Canvas ────────────────────────────────────────────────────────────
const { W, H } = CANVAS.WIDE;
const PAD = CANVAS.WIDE_PAD;
const CW  = W - PAD.left - PAD.right;
const CH  = H - PAD.top  - PAD.bottom;

// ── σ profile: step function across the skill spectrum ───────────────
// Represents the agent's σ in each region of the skill spectrum [0,1].
// Three zones: [0, 0.30] σ = 0.25 (novice), [0.30, 0.65] σ = 0.55 (developing),
// [0.65, 1.0] σ = 0.82 (mastery anchor).
const SIGMA_PROFILE: Array<{ from: number; to: number; σ: number; label: string }> = [
  { from: 0.00, to: 0.30, σ: 0.25, label: "Low σ" },
  { from: 0.30, to: 0.65, σ: 0.55, label: "Mid σ" },
  { from: 0.65, to: 1.00, σ: 0.82, label: "High σ" },
];

const σ_CRITICAL = 0.45;

// ── Zone classification ───────────────────────────────────────────────
function classifyZone(
  skillX: number,
  aiCapability: number
): "delegated-safe" | "delegated-trap" | "not-delegated-strong" | "not-delegated-weak" {
  const seg = SIGMA_PROFILE.find(s => skillX >= s.from && skillX < s.to) ?? SIGMA_PROFILE[2];
  const isDelegatable = skillX <= aiCapability;
  const isAboveSigma  = seg.σ >= σ_CRITICAL;

  if (isDelegatable && isAboveSigma)  return "delegated-safe";
  if (isDelegatable && !isAboveSigma) return "delegated-trap";
  if (!isDelegatable && isAboveSigma) return "not-delegated-strong";
  return "not-delegated-weak";
}

const ZONE_COLORS: Record<string, string> = {
  "delegated-safe":      EMERALD,
  "delegated-trap":      ROSE,
  "not-delegated-strong": ACCENT,
  "not-delegated-weak":  AMBER,
};

const ZONE_LABELS: Record<string, string> = {
  "delegated-safe":       "Safe to delegate — σ ≥ σ_critical",
  "delegated-trap":       "Delegation trap — AI outperforms but σ < σ_critical",
  "not-delegated-strong": "Human frontier — σ high, AI not yet dominant",
  "not-delegated-weak":   "Pre-schema frontier — neither agent is strong",
};

// Render helpers
function toX(v: number) { return PAD.left + v * CW; }
function toY(v: number) { return PAD.top  + (1 - v) * CH; }

export default function DelegationGradientFigure() {
  const [aiCap, setAiCap] = useState(0.42);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Compute per-segment zone fills (20 segments for smooth rendering)
  const SEGS = 80;
  const segW = CW / SEGS;

  // Identify which zone each segment belongs to
  const segZones = Array.from({ length: SEGS }, (_, i) => {
    const midX = (i + 0.5) / SEGS;
    return classifyZone(midX, aiCap);
  });

  // σ profile path points
  const sigmaPath = SIGMA_PROFILE.flatMap((seg) => [
    { x: toX(seg.from), y: toY(seg.σ) },
    { x: toX(seg.to),   y: toY(seg.σ) },
  ]);

  // Polyline for sigma profile (step function)
  const sigmaPoints = SIGMA_PROFILE.flatMap(seg => [
    `${toX(seg.from)},${toY(seg.σ)}`,
    `${toX(seg.to)},${toY(seg.σ)}`,
  ]).join(" ");

  // Vertical step lines between σ segments
  const sigmaSteps = SIGMA_PROFILE.slice(0, -1).map((seg, i) => ({
    x:  toX(seg.to),
    y1: toY(seg.σ),
    y2: toY(SIGMA_PROFILE[i + 1].σ),
  }));

  const frontierX = toX(aiCap);

  // Current zone at delegation frontier
  const frontierSeg = SIGMA_PROFILE.find(s => aiCap >= s.from && aiCap < s.to) ?? SIGMA_PROFILE[1];
  const frontierSafe = frontierSeg.σ >= σ_CRITICAL;

  // Active zone for annotation
  const displayZone = hoveredZone ?? (frontierSafe ? "delegated-safe" : "delegated-trap");

  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.625rem",
        padding: "1.25rem",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: "0.875rem" }}>
        <span style={{ color: TEXT_MAIN, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Figure 2 — The Delegation Gradient 𝒟*(d, t)
        </span>
      </div>

      {/* SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>

        {/* Zone fill rectangles */}
        {segZones.map((zone, i) => (
          <rect
            key={i}
            x={PAD.left + i * segW}
            y={PAD.top}
            width={segW + 0.5}
            height={CH}
            fill={ZONE_COLORS[zone]}
            opacity={0.09}
            onMouseEnter={() => setHoveredZone(zone)}
            onMouseLeave={() => setHoveredZone(null)}
          />
        ))}

        {/* σ_critical dashed line */}
        <line
          x1={PAD.left} y1={toY(σ_CRITICAL)}
          x2={PAD.left + CW} y2={toY(σ_CRITICAL)}
          stroke={ACCENT} strokeWidth={1} strokeDasharray="4 4" opacity={0.6}
        />
        <text x={PAD.left + CW - 4} y={toY(σ_CRITICAL) - 4}
          textAnchor="end" fill={ACCENT} fontSize={9} opacity={0.8}>
          σ_critical
        </text>

        {/* AI delegation frontier vertical line */}
        <line
          x1={frontierX} y1={PAD.top}
          x2={frontierX} y2={PAD.top + CH}
          stroke={frontierSafe ? EMERALD : ROSE} strokeWidth={2}
        />
        <text
          x={frontierX + 4} y={PAD.top + 12}
          fill={frontierSafe ? EMERALD : ROSE} fontSize={9} fontWeight={600}
        >
          𝒟* frontier
        </text>

        {/* AI capability fill (left of frontier) */}
        <rect
          x={PAD.left} y={PAD.top}
          width={frontierX - PAD.left} height={CH}
          fill={frontierSafe ? EMERALD : ROSE}
          opacity={0.04}
        />

        {/* σ step-function profile */}
        {/* Step horizontal segments */}
        {SIGMA_PROFILE.map((seg, i) => (
          <line
            key={i}
            x1={toX(seg.from)} y1={toY(seg.σ)}
            x2={toX(seg.to)}   y2={toY(seg.σ)}
            stroke={SECONDARY} strokeWidth={2.5}
          />
        ))}
        {/* Step vertical connectors */}
        {sigmaSteps.map((s, i) => (
          <line key={i} x1={s.x} y1={s.y1} x2={s.x} y2={s.y2} stroke={SECONDARY} strokeWidth={2.5} />
        ))}
        {/* σ label */}
        <text x={PAD.left + 6} y={toY(SIGMA_PROFILE[2].σ) - 6}
          fill={SECONDARY} fontSize={9} fontWeight={600}>
          Agent σ profile
        </text>

        {/* Axis */}
        <line x1={PAD.left} y1={PAD.top + CH} x2={PAD.left + CW} y2={PAD.top + CH} stroke={BORDER} strokeWidth={1.5} />
        <line x1={PAD.left} y1={PAD.top}      x2={PAD.left}       y2={PAD.top + CH} stroke={BORDER} strokeWidth={1.5} />

        {/* Y-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1.0].map(v => (
          <g key={v}>
            <line x1={PAD.left - 3} y1={toY(v)} x2={PAD.left} y2={toY(v)} stroke={MUTED} strokeWidth={1} />
            <text x={PAD.left - 5} y={toY(v) + 3} textAnchor="end" fill={MUTED} fontSize={8}>
              {v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        <text x={PAD.left + 4}      y={PAD.top + CH + 13} fill={MUTED} fontSize={9}>Fully mechanisable</text>
        <text x={PAD.left + CW - 4} y={PAD.top + CH + 13} textAnchor="end" fill={MUTED} fontSize={9}>Schema-intensive frontier</text>
        <text x={PAD.left + CW / 2} y={H - 4} textAnchor="middle" fill={TEXT_DIM} fontSize={10}>
          Skill spectrum
        </text>

        {/* Y-axis label */}
        <text
          x={9} y={PAD.top + CH / 2}
          textAnchor="middle" fill={TEXT_DIM} fontSize={10}
          transform={`rotate(-90, 9, ${PAD.top + CH / 2})`}
        >
          σ / capability
        </text>

        {/* σ zone labels at top */}
        {SIGMA_PROFILE.map((seg, i) => (
          <text
            key={i}
            x={toX((seg.from + seg.to) / 2)}
            y={PAD.top + 12}
            textAnchor="middle"
            fill={MUTED}
            fontSize={8}
          >
            {seg.label}
          </text>
        ))}
      </svg>

      {/* Slider */}
      <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ color: MUTED, fontSize: "0.75rem", whiteSpace: "nowrap" }}>AI capability</span>
        <input
          type="range"
          min={0} max={100}
          value={Math.round(aiCap * 100)}
          onChange={e => setAiCap(e.target.valueAsNumber / 100)}
          style={{ flex: 1, accentColor: ACCENT }}
        />
        <span style={{
          color: TEXT_MAIN,
          fontSize: "0.75rem",
          fontFamily: "IBM Plex Mono, monospace",
          minWidth: "3rem",
          textAlign: "right",
        }}>
          {(aiCap * 100).toFixed(0)}%
        </span>
      </div>

      {/* Zone legend */}
      <div style={{
        marginTop: "0.875rem",
        borderTop: `1px solid ${BORDER}`,
        paddingTop: "0.875rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.4rem 1rem",
      }}>
        {Object.entries(ZONE_LABELS).map(([zone, label]) => (
          <div key={zone} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2, flexShrink: 0, marginTop: 2,
              background: ZONE_COLORS[zone], opacity: 0.85,
            }} />
            <span style={{ color: TEXT_DIM, fontSize: "0.72rem", lineHeight: 1.4 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Active zone annotation */}
      <div style={{
        marginTop: "0.75rem",
        borderTop: `1px solid ${BORDER}`,
        paddingTop: "0.75rem",
      }}>
        <span style={{ color: MUTED, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          Current frontier zone
        </span>
        <p style={{ color: TEXT_DIM, fontSize: "0.78rem", lineHeight: 1.55, marginTop: "0.25rem" }}>
          {displayZone === "delegated-safe" &&
            "The frontier sits in a high-σ region. Delegation is net-positive — the agent can evaluate and verify retrieved content. Expanding 𝒟* here frees parametric capacity for schema-intensive frontier work."
          }
          {displayZone === "delegated-trap" &&
            "The frontier sits in a low-σ region. This is the delegation trap: AI capability exceeds the agent's parametric knowledge, but σ < σ_critical means the agent cannot verify retrieved results. Delegating here is expected to reduce compositional task accuracy."
          }
          {displayZone === "not-delegated-strong" &&
            "This skill is beyond current AI capability but the agent's σ is high. This is the high-value human frontier — the region where schema-intensive work that AI cannot yet substitute should be concentrated."
          }
          {displayZone === "not-delegated-weak" &&
            "Pre-schema frontier: AI has not yet reached this region and the agent's σ is also low. Phase 1–2 training prescription applies: build σ before attempting delegation or frontier extension."
          }
        </p>
      </div>
    </div>
  );
}
