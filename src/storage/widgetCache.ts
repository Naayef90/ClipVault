import { MMKV } from 'react-native-mmkv';

// Plain unencrypted storage shared between the main app and the widget task handler.
// The widget runs in a headless JS context where SecureStore + encrypted MMKV is unreliable,
// so we mirror snippet data here for the widget to read.
const WIDGET_SNIPPETS_KEY = 'widget_snippets_v1';

const storage = new MMKV({ id: 'widget_cache_db' });

export function writeWidgetCache(snippetsJson: string): void {
  storage.set(WIDGET_SNIPPETS_KEY, snippetsJson);
}

export function readWidgetCache(): string | undefined {
  return storage.getString(WIDGET_SNIPPETS_KEY);
}
