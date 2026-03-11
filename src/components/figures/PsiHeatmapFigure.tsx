// src/components/figures/PsiHeatmapFigure.tsx
// Interactive Ψ activation heatmap.
// Hover cells to inspect Ψ values. The multiplicative σ₁ × σ₂ structure
// is the falsifiable core: halving one σ halves Ψ, not decrements it.
// Hydration: client:visible

import { useState } from "react";

// ── Design tokens ────────────────────────────────────────────────────
const SURFACE   = "#111111";
const RAISED    = "#1c1c1c";
const BORDER    = "#2a2a2a";
const ACCENT    = "#a78bfa";
const SECONDARY = "#93c5fd";
const EMERALD   = "#34d399";
const ROSE      = "#f87171";
const MUTED     = "#525252";
const TEXT_MAIN = "#e5e5e5";
const TEXT_DIM  = "#a3a3a3";

// ── Parameters ───────────────────────────────────────────────────────
const THETA_I    = 0.18;   // σ₁ × σ₂ threshold for Ψ > 0
const GRID_N     = 12;     // resolution of heatmap grid
const PSI_0      = 1.0;    // normalisation constant (visual scale)
const PHI        = 0.75;   // structural similarity φ(d₁, d₂) — fixed in this figure

// ── Canvas ────────────────────────────────────────────────────────────
const CELL_W  = 28;
const CELL_H  = 28;
const PAD     = { top: 36, right: 20, bottom: 48, left: 52 };
const GRID_PX_W = GRID_N * CELL_W;
const GRID_PX_H = GRID_N * CELL_H;
const TOTAL_W = PAD.left + GRID_PX_W + PAD.right;
const TOTAL_H = PAD.top  + GRID_PX_H + PAD.bottom;

// ── Ψ computation ─────────────────────────────────────────────────────
function computePsi(σ1: number, σ2: number): number {
  const product = σ1 * σ2;
  if (product <= THETA_I) return 0;
  return PSI_0 * product * PHI;
}

// ── Colour interpolation: #111 → #a78bfa ──────────────────────────────
function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t); }

function psiToColor(psi: number, maxPsi: number): string {
  if (psi <= 0) return SURFACE;
  const t = Math.min(1, psi / maxPsi);
  // from surface (#111111) to accent (#a78bfa) with a mid-stop through teal
  // Two-leg interpolation: 0→0.5 surface→#60a5fa (blue), 0.5→1 blue→accent
  if (t < 0.5) {
    const t2 = t * 2;
    return `rgb(${lerp(0x11,0x60,t2)},${lerp(0x11,0xa5,t2)},${lerp(0x11,0xfa,t2)})`;
  } else {
    const t2 = (t - 0.5) * 2;
    return `rgb(${lerp(0x60,0xa7,t2)},${lerp(0xa5,0x8b,t2)},${lerp(0xfa,0xfa,t2)})`;
  }
}

// Max Ψ for normalisation
const MAX_PSI = computePsi(1, 1);

// ── PIRL annotated cells ───────────────────────────────────────────────
// PIRL: physics prior (σ_d1 ≈ 0.85) × residual (σ_d2 ≈ 0.70)
const PIRL_CELL_I = Math.round(0.85 * (GRID_N - 1)); // row (σ_d1)
const PIRL_CELL_J = Math.round(0.70 * (GRID_N - 1)); // col (σ_d2)

export default function PsiHeatmapFigure() {
  const [hovered, setHovered] = useState<{ i: number; j: number } | null>(null);
  const [showAdditive, setShowAdditive] = useState(false);

  // Build grid data
  const cells: Array<{ i: number; j: number; σ1: number; σ2: number; ψ: number; ψAdditive: number }> = [];
  for (let i = 0; i < GRID_N; i++) {
    for (let j = 0; j < GRID_N; j++) {
      const σ1 = i / (GRID_N - 1);
      const σ2 = j / (GRID_N - 1);
      const ψ = computePsi(σ1, σ2);
      // Additive baseline: (σ1 + σ2) / 2 × PHI, gated at θ_I sum-threshold
      const ψAdditive = ((σ1 + σ2) / 2 > Math.sqrt(THETA_I) * 1.1) ? ((σ1 + σ2) / 2) * PHI * 0.8 : 0;
      cells.push({ i, j, σ1, σ2, ψ, ψAdditive });
    }
  }

  const activePsi = hovered
    ? cells.find(c => c.i === hovered.i && c.j === hovered.j)
    : null;

  function cellX(j: number) { return PAD.left + j * CELL_W; }
  function cellY(i: number) { return PAD.top  + (GRID_N - 1 - i) * CELL_H; }

  // Threshold boundary: σ1 × σ2 = θ_I → draw polyline
  const thresholdPoints: string[] = [];
  for (let j = 0; j < GRID_N; j++) {
    const σ2 = j / (GRID_N - 1);
    if (σ2 < 0.001) continue;
    const σ1needed = THETA_I / σ2;
    if (σ1needed > 1) continue;
    const px = cellX(j) + CELL_W / 2;
    const py = cellY(σ1needed * (GRID_N - 1)) + CELL_H / 2;
    thresholdPoints.push(`${px},${py}`);
  }

  const activeDisplay = showAdditive ? "ψAdditive" : "ψ";

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
      <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.75rem" }}>
        <span style={{ color: TEXT_MAIN, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Figure 3 — Ψ Activation Heatmap
        </span>
        <span style={{ color: MUTED, fontSize: "0.75rem" }}>
          φ(d₁, d₂) = {PHI.toFixed(2)} · θ_I = {THETA_I.toFixed(2)}
        </span>
      </div>

      {/* Toggle: multiplicative vs additive */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {["Multiplicative (H-Bar)", "Additive (baseline)"].map((label, idx) => {
          const active = (idx === 0) !== showAdditive;
          return (
            <button
              key={label}
              onClick={() => setShowAdditive(idx === 1)}
              style={{
                background: active ? RAISED : "transparent",
                border: `1px solid ${active ? ACCENT : BORDER}`,
                color: active ? TEXT_MAIN : MUTED,
                borderRadius: "0.25rem",
                padding: "0.2rem 0.6rem",
                fontSize: "0.72rem",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* SVG heatmap */}
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
          style={{ width: "100%", maxWidth: TOTAL_W, height: "auto", display: "block" }}
        >
          {/* Cells */}
          {cells.map(cell => {
            const psiVal = showAdditive ? cell.ψAdditive : cell.ψ;
            const isHovered = hovered?.i === cell.i && hovered?.j === cell.j;
            const isPIRL = cell.i === PIRL_CELL_I && cell.j === PIRL_CELL_J;
            return (
              <g
                key={`${cell.i}-${cell.j}`}
                onMouseEnter={() => setHovered({ i: cell.i, j: cell.j })}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={cellX(cell.j)}
                  y={cellY(cell.i)}
                  width={CELL_W}
                  height={CELL_H}
                  fill={psiToColor(psiVal, MAX_PSI)}
                  opacity={isHovered ? 1 : 0.92}
                  stroke={isPIRL ? "#f0abfc" : isHovered ? TEXT_MAIN : "none"}
                  strokeWidth={isPIRL ? 2 : 1}
                />
              </g>
            );
          })}

          {/* Threshold boundary polyline */}
          {thresholdPoints.length > 1 && (
            <polyline
              points={thresholdPoints.join(" ")}
              fill="none"
              stroke={ACCENT}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.8}
            />
          )}
          <text
            x={PAD.left + 4}
            y={cellY(THETA_I * (GRID_N - 1) / 0.4) + CELL_H - 2}
            fill={ACCENT} fontSize={8.5} opacity={0.8}
          >
            θ_I boundary
          </text>

          {/* PIRL annotation */}
          <text
            x={cellX(PIRL_CELL_J) + CELL_W + 3}
            y={cellY(PIRL_CELL_I) + CELL_H / 2 + 3}
            fill="#f0abfc" fontSize={8.5} fontWeight={600}
          >
            PIRL
          </text>

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + GRID_PX_H} stroke={BORDER} strokeWidth={1.5} />
          <line x1={PAD.left} y1={PAD.top + GRID_PX_H} x2={PAD.left + GRID_PX_W} y2={PAD.top + GRID_PX_H} stroke={BORDER} strokeWidth={1.5} />

          {/* Axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(v => {
            const ji = Math.round(v * (GRID_N - 1));
            const tickX = cellX(ji) + CELL_W / 2;
            const tickY = cellY(Math.round(v * (GRID_N - 1))) + CELL_H / 2;
            return (
              <g key={v}>
                {/* X axis */}
                <line x1={tickX} y1={PAD.top + GRID_PX_H} x2={tickX} y2={PAD.top + GRID_PX_H + 4} stroke={MUTED} strokeWidth={1} />
                <text x={tickX} y={PAD.top + GRID_PX_H + 13} textAnchor="middle" fill={MUTED} fontSize={8}>
                  {v.toFixed(2)}
                </text>
                {/* Y axis */}
                <line x1={PAD.left - 4} y1={tickY} x2={PAD.left} y2={tickY} stroke={MUTED} strokeWidth={1} />
                <text x={PAD.left - 6} y={tickY + 3} textAnchor="end" fill={MUTED} fontSize={8}>
                  {v.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={PAD.left + GRID_PX_W / 2} y={TOTAL_H - 4} textAnchor="middle" fill={TEXT_DIM} fontSize={10}>
            σ_A(d₂, t)
          </text>
          <text
            x={11} y={PAD.top + GRID_PX_H / 2}
            textAnchor="middle" fill={TEXT_DIM} fontSize={10}
            transform={`rotate(-90, 11, ${PAD.top + GRID_PX_H / 2})`}
          >
            σ_A(d₁, t)
          </text>

          {/* Colour scale bar (right side) */}
          {Array.from({ length: 20 }, (_, k) => {
            const t = k / 19;
            const barY = PAD.top + (1 - t) * GRID_PX_H;
            return (
              <rect
                key={k}
                x={PAD.left + GRID_PX_W + 6}
                y={barY}
                width={8}
                height={GRID_PX_H / 20 + 0.5}
                fill={psiToColor(t * MAX_PSI, MAX_PSI)}
              />
            );
          })}
          <text x={PAD.left + GRID_PX_W + 10} y={PAD.top - 4} textAnchor="middle" fill={MUTED} fontSize={7.5}>Ψ</text>
          <text x={PAD.left + GRID_PX_W + 10} y={PAD.top + 8} textAnchor="middle" fill={MUTED} fontSize={7}>high</text>
          <text x={PAD.left + GRID_PX_W + 10} y={PAD.top + GRID_PX_H - 2} textAnchor="middle" fill={MUTED} fontSize={7}>0</text>
        </svg>
      </div>

      {/* Hover readout */}
      <div
        style={{
          marginTop: "0.875rem",
          borderTop: `1px solid ${BORDER}`,
          paddingTop: "0.75rem",
          minHeight: "4rem",
        }}
      >
        {activePsi ? (
          <>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              {[
                { label: "σ(d₁)", val: activePsi.σ1.toFixed(2) },
                { label: "σ(d₂)", val: activePsi.σ2.toFixed(2) },
                { label: "σ₁ × σ₂", val: (activePsi.σ1 * activePsi.σ2).toFixed(3) },
                { label: "Ψ (multiplicative)", val: activePsi.ψ.toFixed(3), color: activePsi.ψ > 0 ? ACCENT : ROSE },
                { label: "Ψ (additive baseline)", val: activePsi.ψAdditive.toFixed(3), color: TEXT_DIM },
              ].map(item => (
                <div key={item.label}>
                  <span style={{ color: MUTED, fontSize: "0.68rem" }}>{item.label}</span>
                  <div style={{ color: item.color ?? TEXT_MAIN, fontFamily: "IBM Plex Mono, monospace", fontSize: "0.82rem", fontWeight: 600 }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color: TEXT_DIM, fontSize: "0.77rem", lineHeight: 1.5, margin: 0 }}>
              {activePsi.ψ > 0
                ? `Above θ_I — intersection activation is live. Ψ = ${activePsi.ψ.toFixed(3)} (multiplicative) vs ${activePsi.ψAdditive.toFixed(3)} (additive). ${
                    activePsi.ψAdditive > 0
                      ? `The multiplicative model predicts ${((activePsi.ψ / activePsi.ψAdditive - 1) * 100).toFixed(0)}% ${activePsi.ψ > activePsi.ψAdditive ? "more" : "less"} cross-domain benefit than the additive baseline.`
                      : "The additive baseline would predict zero benefit here; the multiplicative model differs."
                  }`
                : `Below θ_I — Ψ = 0 regardless of φ(d₁, d₂). σ₁ × σ₂ = ${(activePsi.σ1 * activePsi.σ2).toFixed(3)} < θ_I = ${THETA_I.toFixed(2)}. At least one domain must cross σ_critical before cross-domain training produces above-additive benefit.`
              }
            </p>
          </>
        ) : (
          <p style={{ color: MUTED, fontSize: "0.77rem", lineHeight: 1.5, margin: 0 }}>
            Hover any cell to inspect Ψ values. The dashed line marks the θ_I boundary — below it, Ψ = 0 regardless of either agent's depth.
            The PIRL annotation marks the physics-prior × residual intersection (σ_prior ≈ 0.85, σ_residual ≈ 0.70). Toggle between multiplicative and additive to see the prediction difference: H-Bar claims the field measures the difference between these models by varying σ independently per contributing domain.
          </p>
        )}
      </div>
    </div>
  );
}
