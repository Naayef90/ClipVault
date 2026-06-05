import type { ThemeColors } from '../types';

export const M3DarkColors: ThemeColors = {
  primary:            '#3D3D3D',
  onPrimary:          '#FFFFFF',
  primaryContainer:   '#E0E0E0',
  onPrimaryContainer: '#1A1A1A',
  secondary:          '#6B6B6B',
  onSecondary:        '#FFFFFF',
  secondaryContainer: '#ECECEC',
  surface:            '#FFFFFF',
  surfaceVariant:     '#EDEDE8',
  onSurface:          '#1A1A1A',
  onSurfaceVariant:   '#6B6B6B',
  background:         '#F2F1EC',
  onBackground:       '#1A1A1A',
  outline:            '#B0B0B0',
  outlineVariant:     '#E0E0DC',
  error:              '#B00020',
  success:            '#2E7D32',
  scrim:              '#000000',
};

// Surface elevation ramp for off-white light theme
export const SurfaceLevel1 = '#ECEAE4';
export const SurfaceLevel2 = '#F2F1EC';
export const SurfaceLevel3 = '#FFFFFF';
export const SurfaceLevel4 = '#F7F7F4';

export const M3ElevationOverlay = {
  level0: 'transparent',
  level1: 'rgba(0,0,0,0.03)',
  level2: 'rgba(0,0,0,0.05)',
  level3: 'rgba(0,0,0,0.07)',
  level4: 'rgba(0,0,0,0.08)',
  level5: 'rgba(0,0,0,0.09)',
};

export const Typography = {
  displayLarge:   { fontSize: 57, lineHeight: 64,  fontWeight: '400' as const },
  displayMedium:  { fontSize: 45, lineHeight: 52,  fontWeight: '400' as const },
  headlineLarge:  { fontSize: 32, lineHeight: 40,  fontWeight: '400' as const },
  headlineMedium: { fontSize: 28, lineHeight: 36,  fontWeight: '400' as const },
  headlineSmall:  { fontSize: 24, lineHeight: 32,  fontWeight: '400' as const },
  titleLarge:     { fontSize: 22, lineHeight: 28,  fontWeight: '400' as const },
  titleMedium:    { fontSize: 16, lineHeight: 24,  fontWeight: '500' as const },
  titleSmall:     { fontSize: 14, lineHeight: 20,  fontWeight: '500' as const },
  bodyLarge:      { fontSize: 16, lineHeight: 24,  fontWeight: '400' as const },
  bodyMedium:     { fontSize: 14, lineHeight: 20,  fontWeight: '400' as const },
  bodySmall:      { fontSize: 12, lineHeight: 16,  fontWeight: '400' as const },
  labelLarge:     { fontSize: 14, lineHeight: 20,  fontWeight: '500' as const },
  labelMedium:    { fontSize: 12, lineHeight: 16,  fontWeight: '500' as const },
  labelSmall:     { fontSize: 11, lineHeight: 16,  fontWeight: '500' as const },
};
