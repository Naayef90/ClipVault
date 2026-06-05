export interface Snippet {
  id: string;
  title: string;
  content: string;
  color: string;
  category: string;
  orderIndex: number;
  dateCreated: number;
}

export type SnippetFormData = Omit<Snippet, 'id' | 'orderIndex' | 'dateCreated'>;

export type SnackbarSeverity = 'success' | 'error' | 'info';

export interface SnackbarMessage {
  id: string;
  message: string;
  severity: SnackbarSeverity;
}

export interface ThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  background: string;
  onBackground: string;
  outline: string;
  outlineVariant: string;
  error: string;
  success: string;
  scrim: string;
}

export interface BillingState {
  isAdsRemoved: boolean;
}

export type BottomSheetAction = 'edit' | 'delete' | 'close';

export interface BottomSheetActionsConfig {
  snippet: Snippet | null;
  isVisible: boolean;
}

export const SNIPPET_ACCENT_COLORS = [
  '#7C6FF7',  // lavender
  '#5B8DEF',  // sky blue
  '#3DB88B',  // teal
  '#F5A623',  // amber
  '#E85D5D',  // coral red
  '#E87DBF',  // pink
  '#59C4A8',  // mint
  '#F07C3E',  // orange
  '#6EC6FF',  // light blue
  '#A8D672',  // lime green
  '#B688F5',  // soft purple
  '#F5C842',  // yellow
] as const;

export type AccentColor = typeof SNIPPET_ACCENT_COLORS[number];

export const SNIPPET_CATEGORIES = [
  'General',
  'Work',
  'Personal',
  'Finance',
  'Medical',
  'Legal',
  'Travel',
  'Tech',
] as const;

export type SnippetCategory = typeof SNIPPET_CATEGORIES[number];

export const MAX_TITLE_LENGTH = 60;
export const MAX_CONTENT_LENGTH = 2000;
export const MAX_CATEGORY_LENGTH = 30;
