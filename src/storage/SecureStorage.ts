import { Encryption } from '../services/EncryptionServices';
import EncryptedStorage from 'react-native-encrypted-storage';
import { MMKV } from 'react-native-mmkv';

export class SecureStorage {
  // Keep multiple MMKV instances mapped by id
  private static instances: Map<string, MMKV> = new Map();

  // MMKV Store Config and Initialize
  static async init(mmkvId: string, mmkvKey: string) {
    if (this.instances.has(mmkvId)) {
      return this.instances.get(mmkvId)!;
    }
    const key = await Encryption.setupEncryption(mmkvKey);
    const instance = new MMKV({
      id: mmkvId,
      encryptionKey: key,
    });

    this.instances.set(mmkvId, instance);
    return instance;
  }

  // Save secure data
  static async saveSecureItem<T>(
    mmkvId: string,
    mmkvKey: string,
    userKey: string, // User KEY for storing accessing the data
    data: T, // Data that need to be encrypted
    encryptionKey: string, // EncrytedStorage KEY for stored password or password creation for encrypting data
  ): Promise<void> {
    try {
      const json = JSON.stringify(data);
      const encryptedData = await Encryption.encryptData(json, encryptionKey);
      const storage = await this.init(mmkvId, mmkvKey);
      storage.set(userKey, encryptedData);
    } catch (error: unknown) {
      throw error;
    }
  }

  // Retrieve secure data
  static async getSecureItem<T>(
    mmkvId: string,
    mmkvKey: string,
    storageKey: string, // User KEY for stored encrypted data
    encryptionKey: string, // EncrytedStorage KEY for stored password of stored encrypted data
  ): Promise<T | null> {
    try {
      const storage = await this.init(mmkvId, mmkvKey);
      const encryptedData = storage.getString(storageKey) ?? undefined;
      if (!encryptedData) {
        return null;
      }
      const decrypted = await Encryption.decryptData(
        encryptedData,
        encryptionKey,
      );
      return JSON.parse(decrypted);
    } catch (error: unknown) {
      throw error;
    }
  }

  // Clear Local Storage KEYS
  static async clearAllStorageKeys(): Promise<void> {
    try {
      for (const storage of this.instances.values()) {
        storage.clearAll();
      }
      this.instances.clear();
      await EncryptedStorage.clear();
    } catch (error: unknown) {
      let errorMessage = 'Failed to clear local storage.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
}
