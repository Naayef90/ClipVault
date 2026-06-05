/**
 * Widget metadata consumed by react-native-android-widget's config plugin.
 * This file is referenced from app.json → plugins → react-native-android-widget.
 */
export const widgetConfig = {
  name: 'SnippetWidget',
  label: 'Clipboard Snippets',
  description: 'Quick-copy your saved text snippets from the home screen.',
  minWidth: '180dp',
  minHeight: '110dp',
  targetCellWidth: 3,
  targetCellHeight: 2,
  updatePeriodMillis: 1800000, // OS max meaningful refresh: 30 min
  previewLayout: '@layout/snippet_widget_preview',
  resizeMode: 'both',
  widgetCategory: 'home_screen',
} as const;
