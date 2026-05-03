import { DefaultTheme } from '@react-navigation/native';

export const navPalette = {
  background: '#F7F3EC',
  surface: '#FFF8E8',
  accent: '#173B7A',
  accentSoft: 'rgba(23, 59, 122, 0.12)',
  border: '#E6D7B9',
  text: '#1F2937',
  muted: '#6B7280',
  highlight: '#F4B942',
};

export const appNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: navPalette.accent,
    background: navPalette.background,
    card: navPalette.surface,
    text: navPalette.text,
    border: navPalette.border,
    notification: navPalette.highlight,
  },
};

export const rootStackScreenOptions = {
  headerStyle: {
    backgroundColor: navPalette.surface,
  },
  headerTintColor: navPalette.accent,
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: navPalette.background,
  },
};

export const tabBarSurfaceStyle = {
  backgroundColor: navPalette.surface,
  borderColor: navPalette.border,
};
