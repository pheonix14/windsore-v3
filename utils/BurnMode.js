import { BackHandler } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Wipes all session data, cache pointers, local preferences, and exits the app.
 * Utilizes system commands to shut down cleanly.
 */
export const executeBurnMode = async (clearStateCallbacks = []) => {
  try {
    console.log('[Burn Mode] Initiating core wipe...');

    // 1. Clear any custom secure storage credentials (like password manager master key)
    try {
      await SecureStore.deleteItemAsync('windsore_master_passcode');
      await SecureStore.deleteItemAsync('windsore_passwords');
      console.log('[Burn Mode] Secure credentials purged.');
    } catch (err) {
      console.warn('[Burn Mode] Error purging SecureStore:', err);
    }

    // 2. Execute any callback functions to reset App.js React state (e.g. tabs, history, vpn)
    for (const callback of clearStateCallbacks) {
      if (typeof callback === 'function') {
        callback();
      }
    }

    console.log('[Burn Mode] React state and history pointers flushed.');

    // 3. Force exit the application (Android-specific BackHandler)
    setTimeout(() => {
      console.log('[Burn Mode] Bye!');
      BackHandler.exitApp();
    }, 1000);

    return true;
  } catch (error) {
    console.error('[Burn Mode] Wiping failed:', error);
    // Hard fallback exit anyway
    BackHandler.exitApp();
    return false;
  }
};
