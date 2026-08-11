import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Key-value storage: `localStorage` on web, AsyncStorage on native.
 */
const memory = new Map<string, string>();

function webGet(key: string): string | null {
  if (typeof localStorage === 'undefined') {
    return memory.get(key) ?? null;
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function webSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    /* memory */
  }
  memory.set(key, value);
}

function webRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    /* memory */
  }
  memory.delete(key);
}

export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webGet(key);
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      webSet(key, value);
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      webRemove(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};
