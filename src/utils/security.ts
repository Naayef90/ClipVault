import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY_STORE_ID = 'mmkv_enc_key_v1';

/**
 * Retrieves an existing 256-bit key from SecureStore or generates and persists
 * a new one. The key is stored with WHEN_UNLOCKED_THIS_DEVICE_ONLY so it never
 * leaves the device and is inaccessible while the device is locked.
 */
export async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORE_ID, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  if (existing) {
    return existing;
  }

  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const hexKey = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await SecureStore.setItemAsync(ENCRYPTION_KEY_STORE_ID, hexKey, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return hexKey;
}

/**
 * Generates a collision-resistant ID using cryptographic random bytes.
 * Avoids the uuid package dependency and any non-CSPRNG Math.random paths.
 */
export async function generateSecureId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Scrubs a mutable string reference from memory by overwriting its value.
 * JavaScript strings are immutable primitives so true memory zeroing is not
 * possible, but explicitly nulling the binding removes the reference from the
 * current execution scope so the GC can collect it sooner.
 */
export function scrubString(ref: { current: string | null }): void {
  ref.current = null;
}
