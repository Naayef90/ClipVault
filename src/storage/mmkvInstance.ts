import { MMKV } from 'react-native-mmkv';

// Plain unencrypted instance. Clipboard snippets are convenience text, not
// secrets, so encryption adds no meaningful security but was causing data loss
// when the SecureStore key became inaccessible across launches on Android.
const DB_ID = 'clipboard_snippets_db_plain';
const LEGACY_ENCRYPTED_ID = 'clipboard_snippets_db';
const LEGACY_FALLBACK_ID = 'clipboard_snippets_db_fallback';
const SNIPPETS_KEY = 'user_snippets_v1';

let _storage: MMKV | null = null;

/**
 * Must be called once during app boot before any storage reads/writes.
 * On first run after migration, salvages any data left in the old stores.
 */
export async function initializeMMKV(): Promise<void> {
  if (_storage) return;

  const plain = new MMKV({ id: DB_ID });

  // One-time migration: if the new store is empty, try salvaging from fallback
  // (the unencrypted fallback that initializeMMKV used to create on key errors).
  if (!plain.getString(SNIPPETS_KEY)) {
    try {
      const fallback = new MMKV({ id: LEGACY_FALLBACK_ID });
      const saved = fallback.getString(SNIPPETS_KEY);
      if (saved) plain.set(SNIPPETS_KEY, saved);
    } catch {
      // no legacy data — nothing to migrate
    }
  }

  _storage = plain;
}

/**
 * Returns the singleton MMKV instance.
 * Throws if initializeMMKV() has not been awaited first.
 */
export function getMMKV(): MMKV {
  if (!_storage) {
    throw new Error(
      '[Storage] MMKV not initialized. Ensure initializeMMKV() resolves before accessing storage.',
    );
  }
  return _storage;
}
