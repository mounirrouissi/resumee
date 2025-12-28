import { Platform } from "react-native";

// Modern color palette - sleek and minimal
export const Colors = {
  light: {
    text: "#1A1A2E",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#007AFF", // Brand Blue
    link: "#007AFF",
    primary: "#007AFF", // Brand Blue
    primaryLight: "#66B2FF",
    primaryDark: "#0056D2",
    backgroundRoot: "#FAFAFA",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    success: "#10B981",
    successLight: "#D1FAE5",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    accent: "#FF9800", // Brand Orange
    accentLight: "#FFE0B2",
    gold: "#FF9800",
    goldLight: "#FFE0B2",
    cardGlow: "rgba(0, 122, 255, 0.08)",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#4DAFFF", // Lighter Blue for Dark Mode
    link: "#4DAFFF",
    primary: "#4DAFFF", // Lighter Blue
    primaryLight: "#80C7FF",
    primaryDark: "#007AFF",
    backgroundRoot: "#0F0F1A",
    backgroundDefault: "#1A1A2E",
    backgroundSecondary: "#16162A",
    backgroundTertiary: "#252542",
    border: "#2D2D4A",
    borderLight: "#1F1F3A",
    success: "#34D399",
    successLight: "#064E3B",
    error: "#F87171",
    errorLight: "#7F1D1D",
    warning: "#FBBF24",
    warningLight: "#78350F",
    accent: "#FFB74D", // Lighter Orange for Dark Mode
    accentLight: "#E65100",
    gold: "#FFB74D",
    goldLight: "#E65100",
    cardGlow: "rgba(77, 175, 255, 0.12)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
  "5xl": 80,
  inputHeight: 52,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 36,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 11,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

// Modern Gradients
export const Gradients = {
  light: {
    primary: ["#007AFF", "#0056D2"] as const,
    primarySoft: ["#E3F2FD", "#E1F5FE"] as const,
    secondary: ["#66B2FF", "#007AFF"] as const,
    accent: ["#FF9800", "#F57C00"] as const,
    success: ["#10B981", "#059669"] as const,
    background: ["#FAFAFA", "#F3F4F6"] as const,
    card: ["#FFFFFF", "#FAFAFA"] as const,
    premium: ["#FF9800", "#F57C00", "#E65100"] as const,
    glass: ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"] as const,
  },
  dark: {
    primary: ["#4DAFFF", "#007AFF"] as const,
    primarySoft: ["#1E1B4B", "#312E81"] as const,
    secondary: ["#80C7FF", "#4DAFFF"] as const,
    accent: ["#FFB74D", "#FF9800"] as const,
    success: ["#34D399", "#10B981"] as const,
    background: ["#0F0F1A", "#1A1A2E"] as const,
    card: ["#1A1A2E", "#16162A"] as const,
    premium: ["#FFB74D", "#FF9800", "#F57C00"] as const,
    glass: ["rgba(26,26,46,0.9)", "rgba(26,26,46,0.7)"] as const,
  },
};

// Modern Shadows
export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  glowSuccess: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};

// Animation Durations
export const Animations = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
};

// Glassmorphism
export const Glassmorphism = {
  blur: 20,
  opacity: 0.85,
  borderOpacity: 0.15,
};
