import { Platform } from "react-native";

const primaryLight = "#2563EB";
const primaryDark = "#60A5FA";

export const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: primaryLight,
    link: primaryLight,
    primary: primaryLight,
    primaryLight: "#60A5FA",
    primaryDark: "#1E40AF",
    backgroundRoot: "#F9FAFB",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",
    border: "#E5E7EB",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: primaryDark,
    link: primaryDark,
    primary: primaryDark,
    primaryLight: "#60A5FA",
    primaryDark: "#1E40AF",
    backgroundRoot: "#111827",
    backgroundDefault: "#1F2937",
    backgroundSecondary: "#111827",
    backgroundTertiary: "#0F172A",
    border: "#374151",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
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
  inputHeight: 48,
  buttonHeight: 48,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Gradient Colors
export const Gradients = {
  light: {
    primary: ['#3B82F6', '#2563EB', '#1D4ED8'] as const,
    secondary: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
    accent: ['#F59E0B', '#D97706', '#B45309'] as const,
    success: ['#10B981', '#059669', '#047857'] as const,
    background: ['#F9FAFB', '#F3F4F6', '#E5E7EB'] as const,
    card: ['#FFFFFF', '#F9FAFB'] as const,
  },
  dark: {
    primary: ['#60A5FA', '#3B82F6', '#2563EB'] as const,
    secondary: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const,
    accent: ['#FBBF24', '#F59E0B', '#D97706'] as const,
    success: ['#34D399', '#10B981', '#059669'] as const,
    background: ['#111827', '#0F172A', '#0C1220'] as const,
    card: ['#1F2937', '#111827'] as const,
  },
};

// Shadow Presets
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  colored: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Animation Durations (in milliseconds)
export const Animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// Glassmorphism
export const Glassmorphism = {
  blur: 10,
  opacity: 0.8,
  borderOpacity: 0.2,
};
