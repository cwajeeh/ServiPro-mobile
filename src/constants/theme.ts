/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 *
 * Web font tokens live in `src/global.css` (import from a web entry if your bundler supports CSS).
 * Native Metro does not process `.css`, so do not import it here.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#121212',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#64748B',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Spline Sans, Inter, ui-sans-serif, system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, 'Courier New', monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Brand tokens aligned with Servisca web (#19317C / #001A6D). */
export const Brand = {
  PRIMARY: '#19317C',
  CTA: '#001A6D',
  SOFT_BG: '#E0EEFF',
  DARK_TEXT: '#080D26',
  DIVIDER: '#2B4A98',
  ACCENT_YELLOW: '#F0B100',
  SUCCESS: '#2E7D32',
  DANGER: '#DC2626',
} as const;

export const AuthPalette = {
  NAVY: Brand.CTA,
  PRIMARY: Brand.PRIMARY,
  PRIMARY_TEXT: Brand.DARK_TEXT,
  BORDER: '#E0E0E0',
  GRAY: '#757575',
  SECONDARY_BG: Brand.SOFT_BG,
  LINK_DARK: '#000000',
  MAIN_BLUE: Brand.DIVIDER,
  BLACK: '#000000',
  LINK_BLUE: Brand.DIVIDER,
  ERROR_RED: Brand.DANGER,
} as const;

export const TaskerPalette = {
  ACCENT_BLUE: '#3277F1',
  TAB_INACTIVE: '#757575',
  TAB_ACTIVE: Brand.CTA,
  BG_LIGHT: '#F8FAFC',
  BADGE_RED: '#FF4D4D',
  ACCENT_YELLOW: Brand.ACCENT_YELLOW,
} as const;


export const Typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '500' as const },
  bodyBold: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionBold: { fontSize: 12, fontWeight: '600' as const },
  tiny: { fontSize: 10, fontWeight: '400' as const },
  tinyBold: { fontSize: 10, fontWeight: '700' as const },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
