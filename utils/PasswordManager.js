import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

// Configuration keys for storage
const SECURE_STORE_VAULT_KEY = 'windsore_vault_data';
const SECURE_STORE_MASTER_HASH = 'windsore_master_pass_hash';

/**
 * Checks if biometric hardware is available and enrolled.
 */
export const checkBiometricsAvailable = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

/**
 * Authenticates the user using Face ID / Touch ID.
 */
export const authenticateBiometrics = async () => {
  try {
    const isAvailable = await checkBiometricsAvailable();
    if (!isAvailable) {
      return { success: false, reason: 'Biometrics not available or set up' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock WINDSORE Secure Vault',
      fallbackLabel: 'Use Master Passcode',
      disableDeviceFallback: false,
    });

    return { success: result.success, error: result.error };
  } catch (error) {
    return { success: false, reason: error.message };
  }
};

/**
 * Check if the master passcode has been set up.
 */
export const hasMasterPasscode = async () => {
  try {
    const storedHash = await SecureStore.getItemAsync(SECURE_STORE_MASTER_HASH);
    return !!storedHash;
  } catch (err) {
    return false;
  }
};

/**
 * Retrieves or generates a consistent, secure encryption key for the vault data.
 * Decouples encryption key from user passcode so biometrics and passcode can both unlock the same vault.
 */
export const getVaultEncryptionKey = async () => {
  try {
    let key = await SecureStore.getItemAsync('windsore_vault_aes_key');
    if (!key) {
      key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
      await SecureStore.setItemAsync('windsore_vault_aes_key', key);
    }
    return key;
  } catch (err) {
    return 'default_encryption_key_fallback_2026';
  }
};

/**
 * Set up the Master Passcode if not already set.
 */
export const setupMasterPasscode = async (passcode) => {
  const hash = CryptoJS.SHA256(passcode).toString();
  await SecureStore.setItemAsync(SECURE_STORE_MASTER_HASH, hash);
  // Initialize empty vault
  await saveVaultData([]);
  return true;
};

/**
 * Verify Master Passcode fallback.
 */
export const verifyMasterPasscode = async (passcode) => {
  const storedHash = await SecureStore.getItemAsync(SECURE_STORE_MASTER_HASH);
  if (!storedHash) {
    return false; // Force proper setup flow instead of auto-initializing
  }
  const hash = CryptoJS.SHA256(passcode).toString();
  return hash === storedHash;
};

/**
 * Decrypts and retrieves the vault credentials.
 */
export const getVaultData = async () => {
  try {
    const decryptionKey = await getVaultEncryptionKey();
    const encryptedData = await SecureStore.getItemAsync(SECURE_STORE_VAULT_KEY);
    if (!encryptedData) {
      return [];
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Failed to decrypt vault:', error);
    return null;
  }
};

/**
 * Encrypts and saves the vault credentials.
 */
export const saveVaultData = async (vaultList) => {
  try {
    const encryptionKey = await getVaultEncryptionKey();
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(vaultList), encryptionKey).toString();
    await SecureStore.setItemAsync(SECURE_STORE_VAULT_KEY, ciphertext);
    return true;
  } catch (error) {
    console.error('Failed to encrypt vault:', error);
    return false;
  }
};

/**
 * Formats a login payload as JavaScript for auto-filling inputs.
 */
export const generateAutofillScript = (username, password) => {
  return `
    (function() {
      const uField = document.querySelector('input[type="email"], input[type="text"], input[name="username"], input[name="login"]');
      const pField = document.querySelector('input[type="password"], input[name="password"]');
      if (uField) {
        uField.value = ${JSON.stringify(username)};
        uField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (pField) {
        pField.value = ${JSON.stringify(password)};
        pField.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })();
  `;
};
