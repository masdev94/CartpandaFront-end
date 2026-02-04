/**
 * Design tokens for consistent UI.
 * Use these in components so the app stays cohesive and is easy to extend.
 */

export const theme = {
  /** Main accent - primary actions, focus rings, links */
  accent: {
    DEFAULT: '#4F46E5',
    hover: '#4338CA',
    light: '#EEF2FF',
    border: '#C7D2FE',
  },
  /** Neutral UI (toolbar, sidebar, panels) */
  surface: {
    canvas: '#F8FAFC',
    panel: '#FFFFFF',
    panelBorder: '#E2E8F0',
    muted: '#F1F5F9',
  },
  /** Text hierarchy */
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    inverse: '#FFFFFF',
  },
  /** Spacing scale (Tailwind-aligned) */
  space: {
    toolbar: '0.75rem 1rem',
    sidebar: '1rem',
    nodePadding: '0.75rem',
  },
  /** Border radius */
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  /** Shadows */
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  },
} as const;

/** Node-type colors (for canvas nodes and palette) - hex for React Flow minimap */
export const nodeTypeColors = {
  salesPage: { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', dot: '#3B82F6' },
  orderPage: { bg: '#ECFDF5', border: '#10B981', text: '#047857', dot: '#10B981' },
  upsell: { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6', dot: '#8B5CF6' },
  downsell: { bg: '#FFF7ED', border: '#F97316', text: '#C2410C', dot: '#F97316' },
  thankYou: { bg: '#ECFDF5', border: '#059669', text: '#065F46', dot: '#059669' },
} as const;
