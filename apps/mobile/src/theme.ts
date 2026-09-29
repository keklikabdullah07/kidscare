/**
 * KidsCare Mobile — Impeccable Design System Tokens
 * Conforming strictly to DESIGN.md (Operate mode, 60-30-10 Royal Blue + Honey Amber)
 */

export const colors = {
  // 60% Neutrals & Surfaces (Clean, breathable, anti-glare canvas)
  bg: '#FAF9F6', // Warm oatmeal / linen canvas (matching web #faf9f6)
  surface: '#FFFFFF', // Pure crisp card surface
  surfaceMuted: '#F1F5F9', // Slate 100 — Embedded panels, pills, inputs
  surfaceHighlight: '#F8FAFC',
  border: '#E2E8F0', // Slate 200/80 — Subtle borders
  borderLight: '#F1F5F9',
  borderFocus: '#0F766E', // Teal 700

  // 30% Primary Brand: Scandinavian Sage / Deep Forest Teal (matching web #0f766e)
  primary: '#0F766E', // Teal 700 (Official KidsCare Brand)
  primaryDark: '#115E59', // Teal 800
  primaryLight: '#F0FDFA', // Teal 50
  primaryBorder: '#CCFBF1', // Teal 100
  primaryHover: '#0D9488', // Teal 600

  // 10% Daycare Warmth & Delight: Sunshine & Honey Amber
  amber: '#F59E0B', // Amber 500
  amberDark: '#D97706', // Amber 600
  amberLight: '#FEF3C7', // Amber 100
  amberBorder: '#FDE68A', // Amber 200
  amberText: '#92400E', // Amber 800

  // Typography Palette
  textPrimary: '#0F172A', // Slate 900 — Maximum readability ink
  textSecondary: '#475569', // Slate 600 — Balanced secondary
  textMuted: '#94A3B8', // Slate 400 — Captions & metadata
  textInverse: '#FFFFFF',

  // Semantics & Status
  success: '#10B981', // Emerald 500
  successBg: '#D1FAE5', // Emerald 100
  successText: '#065F46', // Emerald 800
  danger: '#EF4444', // Red 500
  dangerBg: '#FEE2E2', // Red 100
  dangerText: '#991B1B', // Red 800
  info: '#0EA5E9', // Sky 500
  infoBg: '#E0F2FE', // Sky 100
  infoText: '#0369A1', // Sky 700

  // Bottom Navigation Bar
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#0F766E',
  tabBarInactive: '#94A3B8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12, // Standard buttons and inputs (rounded-xl)
  lg: 16, // Standard cards (rounded-2xl)
  xl: 22,
  xxl: 28,
  full: 9999, // Pills and badges
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyBold: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  captionBold: { fontSize: 12, fontWeight: '600' as const },
  tiny: { fontSize: 10, fontWeight: '600' as const },
};

export const shadows = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
};
