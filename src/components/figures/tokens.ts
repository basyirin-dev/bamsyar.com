// src/components/figures/tokens.ts
// Shared design tokens for all figure components
// Centralized constants to eliminate duplication and improve maintainability

// ── Color Palette ────────────────────────────────────────────────────
export const COLORS = {
  SURFACE: "#111111",
  RAISED: "#1a1a1a",
  BORDER: "#2a2a2a",
  ACCENT: "#a78bfa",
  SECONDARY: "#93c5fd",
  EMERALD: "#34d399",
  ROSE: "#f87171",
  AMBER: "#fbbf24",
  MUTED: "#525252",
  TEXT_MAIN: "#e5e5e5",
  TEXT_DIM: "#a3a3a3",
} as const;

// ── Canvas Dimensions ────────────────────────────────────────────────
export const CANVAS = {
  // Standard dimensions for PhaseMapFigure
  STANDARD: { W: 400, H: 360 },

  // Wide dimensions for DelegationGradientFigure
  WIDE: { W: 480, H: 220 },

  // Padding presets
  STANDARD_PAD: { top: 20, right: 20, bottom: 50, left: 50 },
  WIDE_PAD: { top: 24, right: 20, bottom: 46, left: 20 },
} as const;

// ── Thresholds ───────────────────────────────────────────────────────
export const THRESHOLDS = {
  SIGMA_CRITICAL: 0.45,
  DELTA_CRITICAL: 0.62,
  THETA_I: 0.18,
} as const;

// ── Parameters ───────────────────────────────────────────────────────
export const PARAMETERS = {
  PHI: 0.75,
  PSI_0: 1.0,
  GRID_N: 12,
  CELL_W: 28,
  CELL_H: 28,
} as const;
