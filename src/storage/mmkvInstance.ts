import { MMKV } from 'react-native-mmkv';
import { getOrCreateEncryptionKey } from '../utils/security';

let _storage: MMKV | null = null;

/**
 * Must be called once during app boot before any storage reads/writes.
 * Retrieves or generates a 256-bit encryption key from SecureStore and
 * initialises the MMKV instance with AES encryption.
 */
export async function initializeMMKV(): Promise<void> {
  if (_storage) return;

  const encryptionKey = await getOrCreateEncryptionKey();

  _storage = new MMKV({
    id: 'clipboard_snippets_db',
    encryptionKey,
  });
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
