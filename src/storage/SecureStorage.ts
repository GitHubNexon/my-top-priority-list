import { Encryption } from '../services/EncryptionServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

export class SecureStorage {
  // Save secure data
  static async saveSecureItem<T>(
    storageKey: string, // AsyncStorage KEY for storing encrypted data
    data: T, // Data that need to be encrypted
    encryptionKey: string, // EncrytedStorage KEY for stored password or password creation for encrypting data
  ): Promise<void> {
    try {
      const json = JSON.stringify(data);
      const encrypted = await Encryption.encryptData(json, encryptionKey);
      await AsyncStorage.setItem(storageKey, encrypted);
    } catch (error: unknown) {
      let errorMessage = 'Failed to save encrypted data.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Retrieve secure data
  static async getSecureItem<T>(
    storageKey: string, // AsyncStorage KEY for stored encrypted data
    encryptionKey: string, // EncrytedStorage KEY for stored password of stored encrypted data
  ): Promise<T | null> {
    try {
      const encrypted = await AsyncStorage.getItem(storageKey);
      if (!encrypted) {
        return null;
      }
      const decrypted = await Encryption.decryptData(encrypted, encryptionKey);
      return JSON.parse(decrypted);
    } catch (error: unknown) {
      let errorMessage = 'Failed to get encrypted data.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Clear Local Storage KEYS
  static async clearAllStorageKeys(): Promise<void> {
    try {
      await AsyncStorage.clear();
      await EncryptedStorage.clear();
    } catch (error: unknown) {
      let errorMessage = 'Failed to clear local storage.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Verify cleanup of both AsyncStorage & EncryptedStorage
  static async verifyCleanUp(): Promise<
    { key: string; value: string | null }[] | null
  > {
    try {
      // 1. Get all AsyncStorage items
      const asyncStorageKeys = await AsyncStorage.getAllKeys();
      const asyncStores = await AsyncStorage.multiGet(asyncStorageKeys);
      const asyncResults = asyncStores.map(([key, value]) => ({ key, value }));

      return asyncResults;
    } catch (error: unknown) {
      let errorMessage = 'Failed to verify local storage cleanup.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
}
