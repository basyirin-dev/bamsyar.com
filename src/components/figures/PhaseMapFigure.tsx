// src/components/figures/PhaseMapFigure.tsx
// Interactive (δ, σ) phase map. Drag the agent marker to explore phase transitions.
// Hydration: client:visible

import { useState, useRef, useCallback } from "react";

// ── Design tokens ────────────────────────────────────────────────────
const SURFACE    = "#111111";
const RAISED     = "#1a1a1a";
const BORDER     = "#2a2a2a";
const ACCENT     = "#a78bfa";   // violet-400
const SECONDARY  = "#93c5fd";   // blue-300
const EMERALD    = "#34d399";
const AMBER      = "#fbbf24";
const MUTED      = "#525252";
const TEXT_MAIN  = "#e5e5e5";
const TEXT_DIM   = "#a3a3a3";

// ── Thresholds (normalised 0–1) ───────────────────────────────────────
const δc = 0.62;   // δ_critical
const σc = 0.45;   // σ_critical

// ── Phase logic ───────────────────────────────────────────────────────
type Phase = 0 | 1 | 2 | 3 | 4 | 5;

function getPhase(δ: number, σ: number): Phase {
  if (δ < 0.10 && σ < 0.10) return 0;
  if (σ < σc)                return 1;
  if (σ >= σc && δ < δc)     return 2;
  if (δ >= δc && σ >= σc && δ < 0.85) return 3;
  if (δ >= 0.85 && σ >= σc)  return 4;
  return 5;
}

const PHASE_META: Record<Phase, { label: string; color: string; prescription: string; failure: string }> = {
  0: {
    label: "Phase 0 — Initialisation",
    color: MUTED,
    prescription: "No stable domain-specific representations yet. The curriculum order matters most here. Enforce balanced causal-regime coverage before any single regime dominates the correlation structure.",
    failure: "Suppressed σ emergence in Phase 2. The penalty is invisible in Phase 0 — it surfaces only when Phase 2 structural pressure arrives.",
  },
  1: {
    label: "Phase 1 — Depth Accumulation",
    color: AMBER,
    prescription: "δ is the growth-limiting variable. Easy-to-hard difficulty scheduling is the correct heuristic here. Simultaneously: ensure training batches require causal-variable encoding, not just surface correlation matching.",
    failure: "High in-distribution benchmark performance, brittle compositional generalization. SCAN/COGS failure pattern. Standard fix (more data, more epochs) reduces error magnitude without changing error structure.",
  },
  2: {
    label: "Phase 2 — σ Crystallisation",
    color: SECONDARY,
    prescription: "σ is the growth-limiting variable. Add structural pressure to the loss: force prediction across causally varied conditions. Monitor the learning-rate discontinuity proxy. Do not expand breadth before σ_critical is crossed.",
    failure: "Introducing cross-domain transfer before σ_critical is reached transfers statistical correlations, not causal structure. Zero or negative transfer. Variance in multi-task transfer outcomes correlates with source-domain σ proxy at time of cross-domain exposure.",
  },
  3: {
    label: "Phase 3 — Near-Frontier",
    color: ACCENT,
    prescription: "The growth-limiting variable has shifted from δ to cross-domain interaction. Target domain pairs with high φ(d₁, d₂) where σ ≥ σ_critical in both. Above-additive performance on compositional tasks becomes achievable for the first time.",
    failure: "Training terminates here in most standard pipelines. The agent has high δ and high σ but has never been exposed to conditions that activate Ψ. Indistinguishable from a capacity-limited agent until cross-domain testing is applied.",
  },
  4: {
    label: "Phase 4 — Intersection Activation (Ψ > 0)",
    color: EMERALD,
    prescription: "Above-additive cross-domain benefit is measurably positive. Ψ scales multiplicatively with σ(d₁) × σ(d₂) × φ(d₁, d₂). Expand delegation strategically: 𝒟* should grow in high-σ domains to free capacity for frontier intersection work.",
    failure: "If σ is high in one contributing domain but near-critical in the other, Ψ collapses approximately proportionally — not incrementally. This is the multiplicative-vs-additive falsification target.",
  },
  5: {
    label: "Phase 5 — Frontier Operation",
    color: "#f0abfc",
    prescription: "Operating at or near the knowledge frontier. δ growth is now generative rather than acquisitive. Maintain relative mastery status by tracking frontier advancement. Accept that Ψ is the primary performance variable.",
    failure: "Frontier obsolescence (λ_f): the frontier advances faster than the agent's relative depth can track. Intervention: strategic delegation expansion combined with schema-intensive frontier work that AI cannot substitute.",
  },
};

// ── Canvas dimensions ─────────────────────────────────────────────────
const W = 400;
const H = 360;
const PAD = { top: 20, right: 20, bottom: 50, left: 50 };
const CW = W - PAD.left - PAD.right;  // canvas width
const CH = H - PAD.top  - PAD.bottom; // canvas height

function toCanvas(δ: number, σ: number) {
  return {
    cx: PAD.left + δ * CW,
    cy: PAD.top  + (1 - σ) * CH,
  };
}

function fromCanvas(cx: number, cy: number) {
  return {
    δ: Math.max(0, Math.min(1, (cx - PAD.left) / CW)),
    σ: Math.max(0, Math.min(1, 1 - (cy - PAD.top) / CH)),
  };
}

// ── Axis tick helpers ─────────────────────────────────────────────────
const TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

export default function PhaseMapFigure() {
  const [δ, setδ] = useState(0.35);
  const [σ, setσ] = useState(0.25);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const phase = getPhase(δ, σ);
  const meta  = PHASE_META[phase];
  const { cx, cy } = toCanvas(δ, σ);

  // Threshold line positions in canvas coords
  const δcX = PAD.left + δc * CW;
  const σcY = PAD.top  + (1 - σc) * CH;

  const updateFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const rawCx = (clientX - rect.left) * scaleX;
    const rawCy = (clientY - rect.top)  * scaleY;
    const { δ: newδ, σ: newσ } = fromCanvas(rawCx, rawCy);
    setδ(newδ);
    setσ(newσ);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    updateFromEvent(e.clientX, e.clientY);
  }, [updateFromEvent]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    updateFromEvent(e.clientX, e.clientY);
  }, [dragging, updateFromEvent]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    updateFromEvent(t.clientX, t.clientY);
    setDragging(true);
  }, [updateFromEvent]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    updateFromEvent(t.clientX, t.clientY);
  }, [updateFromEvent]);

  const onTouchEnd = useCallback(() => setDragging(false), []);

  // Region shading — four quadrants defined by the two thresholds
  const regions = [
    // Low-δ, low-σ  (Phase 0/1 space)
    { x: PAD.left, y: σcY, w: δcX - PAD.left, h: CH + PAD.top - σcY, fill: AMBER,     opacity: 0.06 },
    // High-δ, low-σ (Phase 1 deep — high depth, no schema)
    { x: δcX,      y: σcY, w: CW - (δcX - PAD.left), h: CH + PAD.top - σcY, fill: "#f87171", opacity: 0.05 },
    // Low-δ, high-σ (Phase 2 — schema crystallising)
    { x: PAD.left, y: PAD.top, w: δcX - PAD.left, h: σcY - PAD.top, fill: SECONDARY,  opacity: 0.06 },
    // High-δ, high-σ (Phase 3–5 — mastery zone)
    { x: δcX,      y: PAD.top, w: CW - (δcX - PAD.left), h: σcY - PAD.top, fill: ACCENT,    opacity: 0.08 },
  ];

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
      <div style={{ marginBottom: "0.75rem" }}>
        <span style={{ color: TEXT_MAIN, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Figure 1 — The (δ, σ) Phase Map
        </span>
        <span style={{ color: MUTED, fontSize: "0.75rem", marginLeft: "0.75rem" }}>
          Drag the marker · touch supported
        </span>
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", cursor: dragging ? "grabbing" : "crosshair", display: "block" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Region fills */}
        {regions.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} opacity={r.opacity} />
        ))}

        {/* Grid lines */}
        {TICKS.map(v => {
          const gx = PAD.left + v * CW;
          const gy = PAD.top  + (1 - v) * CH;
          return (
            <g key={v}>
              <line x1={gx} y1={PAD.top} x2={gx} y2={PAD.top + CH} stroke={BORDER} strokeWidth={0.5} />
              <line x1={PAD.left} y1={gy} x2={PAD.left + CW} y2={gy} stroke={BORDER} strokeWidth={0.5} />
            </g>
          );
        })}

        {/* Threshold lines */}
        <line x1={δcX} y1={PAD.top} x2={δcX} y2={PAD.top + CH}
          stroke={ACCENT} strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />
        <line x1={PAD.left} y1={σcY} x2={PAD.left + CW} y2={σcY}
          stroke={ACCENT} strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />

        {/* Threshold labels */}
        <text x={δcX + 4} y={PAD.top + 12} fill={ACCENT} fontSize={10} opacity={0.85}>
          δ_critical
        </text>
        <text x={PAD.left + 4} y={σcY - 5} fill={ACCENT} fontSize={10} opacity={0.85}>
          σ_critical
        </text>

        {/* Region corner labels */}
        <text x={PAD.left + 6}  y={PAD.top + CH - 6} fill={AMBER}    fontSize={9} opacity={0.7}>Phase 0–1</text>
        <text x={δcX + 6}       y={PAD.top + CH - 6} fill="#f87171"  fontSize={9} opacity={0.7}>Phase 1 (δ↑ σ↓)</text>
        <text x={PAD.left + 6}  y={PAD.top + 14}     fill={SECONDARY} fontSize={9} opacity={0.7}>Phase 2</text>
        <text x={δcX + 6}       y={PAD.top + 14}     fill={ACCENT}   fontSize={9} opacity={0.7}>Phase 3–5</text>

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top + CH} x2={PAD.left + CW} y2={PAD.top + CH} stroke={BORDER} strokeWidth={1.5} />
        <line x1={PAD.left} y1={PAD.top}      x2={PAD.left}       y2={PAD.top + CH} stroke={BORDER} strokeWidth={1.5} />

        {/* Axis ticks + labels */}
        {TICKS.map(v => {
          const gx = PAD.left + v * CW;
          const gy = PAD.top  + (1 - v) * CH;
          return (
            <g key={v}>
              <line x1={gx} y1={PAD.top + CH} x2={gx} y2={PAD.top + CH + 4} stroke={MUTED} strokeWidth={1} />
              <text x={gx} y={PAD.top + CH + 14} textAnchor="middle" fill={MUTED} fontSize={9}>
                {v.toFixed(1)}
              </text>
              <line x1={PAD.left - 4} y1={gy} x2={PAD.left} y2={gy} stroke={MUTED} strokeWidth={1} />
              <text x={PAD.left - 7} y={gy + 3} textAnchor="end" fill={MUTED} fontSize={9}>
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={PAD.left + CW / 2} y={H - 4} textAnchor="middle" fill={TEXT_DIM} fontSize={11}>
          Parametric Depth  δ
        </text>
        <text
          x={12}
          y={PAD.top + CH / 2}
          textAnchor="middle"
          fill={TEXT_DIM}
          fontSize={11}
          transform={`rotate(-90, 12, ${PAD.top + CH / 2})`}
        >
          Schema Coherence  σ
        </text>

        {/* Agent marker — outer glow ring */}
        <circle cx={cx} cy={cy} r={16} fill={meta.color} opacity={0.12} />
        <circle cx={cx} cy={cy} r={11} fill={meta.color} opacity={0.18} />
        {/* Agent marker — solid dot */}
        <circle cx={cx} cy={cy} r={7} fill={meta.color} stroke={SURFACE} strokeWidth={2} />
        {/* Crosshair lines from marker to axes */}
        <line x1={cx} y1={cy} x2={cx} y2={PAD.top + CH} stroke={meta.color} strokeWidth={0.75} strokeDasharray="3 3" opacity={0.5} />
        <line x1={cx} y1={cy} x2={PAD.left}             y2={cy}             stroke={meta.color} strokeWidth={0.75} strokeDasharray="3 3" opacity={0.5} />
        {/* Coordinate read-out dots on axes */}
        <circle cx={cx}      cy={PAD.top + CH} r={3} fill={meta.color} opacity={0.8} />
        <circle cx={PAD.left} cy={cy}           r={3} fill={meta.color} opacity={0.8} />
      </svg>

      {/* Phase readout panel */}
      <div
        style={{
          marginTop: "0.875rem",
          borderTop: `1px solid ${BORDER}`,
          paddingTop: "0.875rem",
        }}
      >
        {/* Phase label + coordinates */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <span style={{ color: meta.color, fontWeight: 700, fontSize: "0.85rem" }}>
            {meta.label}
          </span>
          <span style={{ color: MUTED, fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace" }}>
            δ = {δ.toFixed(2)}  ·  σ = {σ.toFixed(2)}
          </span>
        </div>

        {/* Prescription */}
        <div style={{ marginBottom: "0.5rem" }}>
          <span style={{ color: MUTED, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Training prescription
          </span>
          <p style={{ color: TEXT_DIM, fontSize: "0.78rem", lineHeight: 1.55, marginTop: "0.2rem" }}>
            {meta.prescription}
          </p>
        </div>

        {/* Failure mode */}
        <div>
          <span style={{ color: "#f87171", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Failure mode if stuck here
          </span>
          <p style={{ color: TEXT_DIM, fontSize: "0.78rem", lineHeight: 1.55, marginTop: "0.2rem" }}>
            {meta.failure}
          </p>
        </div>
      </div>
    </div>
  );
}
