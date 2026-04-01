/**
 * Finlock Obsidian Design System
 * Centralized design tokens — generated via Stitch MCP
 * 
 * Philosophy: "The Precision Architect"
 * Premium fintech aesthetic with emerald accents and charcoal surfaces.
 */

export const colors = {
  // ── Surface Hierarchy (Tonal Layering) ──
  surface: {
    base: '#111319',           // Page background
    dim: '#111319',            // Same as base for dark mode
    containerLowest: '#0B0E13', // Deepest — sidebar background
    containerLow: '#191C21',   // Secondary panels
    container: '#1D2025',      // Standard cards
    containerHigh: '#272A30',  // Elevated cards / hover
    containerHighest: '#32353B', // Modals, drawers
    bright: '#36393F',         // Bright surface accents
  },

  // ── Text Hierarchy ──
  text: {
    primary: '#E1E2EA',        // High contrast headings & body
    secondary: '#8B949E',      // Muted labels
    muted: '#484F58',          // Very subtle / disabled
    onPrimary: '#003824',      // Text on primary buttons
    onSurface: '#E1E2EA',
    onSurfaceVariant: '#BBCABF',
  },

  // ── Accent Colors ──
  primary: '#4EDEA3',          // Emerald — primary actions, income
  primaryContainer: '#10B981', // Darker emerald — button gradients
  primaryHover: '#059669',     // Hover state
  primarySubtle: 'rgba(78, 222, 163, 0.15)', // Subtle fills

  secondary: '#9ED2B5',
  secondaryContainer: '#21523C',

  tertiary: '#FFB3AF',         // Muted coral — expenses, warnings
  tertiaryContainer: '#FC7C78',

  // ── Semantic Colors ──
  income: '#4EDEA3',           // Same as primary (emerald)
  expense: '#FFB3AF',          // Muted coral (NOT bright red)
  warning: '#FBBF24',          // Budget alerts
  error: '#FFB4AB',
  errorContainer: '#93000A',

  // ── Borders ──
  border: {
    subtle: 'rgba(60, 74, 66, 0.20)',    // Ghost border (outline-variant 20%)
    default: 'rgba(60, 74, 66, 0.40)',    // Standard border
    strong: '#3C4A42',                     // Full opacity
  },

  // ── Chart Colors ──
  chart: {
    emerald: '#4EDEA3',
    teal: '#2DD4BF',
    blue: '#60A5FA',
    indigo: '#818CF8',
    violet: '#A78BFA',
    coral: '#FFB3AF',
    amber: '#FBBF24',
  },
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  tabularNums: {
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
  },
  sizes: {
    displayLg: '3.5rem',    // 56px — portfolio totals
    displayMd: '2.25rem',   // 36px — page titles
    headlineLg: '2rem',     // 32px
    headlineMd: '1.5rem',   // 24px
    headlineSm: '1.25rem',  // 20px — card titles
    bodyLg: '1.125rem',     // 18px
    bodyMd: '1rem',         // 16px — default body
    bodySm: '0.875rem',     // 14px — compact body
    labelLg: '0.875rem',    // 14px
    labelMd: '0.75rem',     // 12px — metadata
    labelSm: '0.6875rem',   // 11px — uppercase captions
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.05em',
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px — standard padding
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px — section gaps
};

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 32px rgba(0, 33, 19, 0.04)',   // Ambient emerald glow
  modal: '0 16px 48px rgba(0, 0, 0, 0.3)',
};

export const transitions = {
  fast: '150ms ease',
  default: '200ms ease',
  slow: '300ms ease',
  chart: '400ms ease-out',
};

// ── Tailwind-Compatible Theme Classes ──
// These map directly to className usage in JSX

export const themeClasses = {
  dark: {
    background: 'bg-[#111319]',
    card: 'bg-[#1D2025] border-[#3C4A42]/20',
    cardHover: 'hover:bg-[#272A30]',
    input: 'bg-[#191C21] border-[#3C4A42]/40 text-[#E1E2EA] placeholder-[#484F58] focus:ring-[#4EDEA3]/40 focus:border-[#4EDEA3]',
    text: {
      primary: 'text-[#E1E2EA]',
      secondary: 'text-[#8B949E]',
      muted: 'text-[#484F58]',
      accent: 'text-[#4EDEA3]',
    },
    border: 'border-[#3C4A42]/20',
    sidebar: 'bg-[#0B0E13]',
    surfaceLow: 'bg-[#191C21]',
    surfaceHigh: 'bg-[#272A30]',
    surfaceHighest: 'bg-[#32353B]',
  },
  light: {
    background: 'bg-[#FAFAF9]',
    card: 'bg-white border-[#E5E7EB]/70',
    cardHover: 'hover:bg-[#F5F5F4]',
    input: 'bg-white border-[#D1D5DB] text-[#111827] placeholder-[#9CA3AF] focus:ring-[#10B981]/40 focus:border-[#10B981]',
    text: {
      primary: 'text-[#111827]',
      secondary: 'text-[#6B7280]',
      muted: 'text-[#9CA3AF]',
      accent: 'text-[#10B981]',
    },
    border: 'border-[#E5E7EB]/70',
    sidebar: 'bg-[#F5F5F4]',
    surfaceLow: 'bg-[#F5F5F4]',
    surfaceHigh: 'bg-[#E5E7EB]',
    surfaceHighest: 'bg-white',
  },
};

// Category icon colors (refined palette)
export const categoryColors = {
  // Income
  salary: '#4EDEA3',
  freelance: '#2DD4BF',
  investments: '#60A5FA',
  'other-income': '#818CF8',
  // Expenses
  housing: '#FBBF24',
  transportation: '#FFB3AF',
  groceries: '#4EDEA3',
  utilities: '#F59E0B',
  entertainment: '#A78BFA',
  food: '#FB923C',
  shopping: '#F472B6',
  healthcare: '#F87171',
  education: '#38BDF8',
  travel: '#C084FC',
};

// Pie/Donut chart colors (harmonious palette)
export const chartColors = [
  '#4EDEA3', // emerald
  '#2DD4BF', // teal
  '#60A5FA', // blue
  '#A78BFA', // violet
  '#FBBF24', // amber
  '#FFB3AF', // coral
  '#F472B6', // pink
];
