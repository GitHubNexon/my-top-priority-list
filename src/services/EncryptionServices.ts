import Aes from "react-native-aes-crypto";
import EncryptedStorage from "react-native-encrypted-storage";

export class Encryption {
  // Generate a key for password.
  static async generateRandomPassword(): Promise<string> {
    return await Aes.randomKey(32); // 256-bit random string;
  }

  // Secure key management
  static async setupEncryption(key: string): Promise<string> {
    try {
      let password = await EncryptedStorage.getItem(key);

      if (!password) {
        password = await this.generateRandomPassword();
        await EncryptedStorage.setItem(key, password);
      }

      return password;
    } catch (error: unknown) {
      let errorMessage = "Encryption setup failed.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Encryption
  static async encryptData(notes: string, key: string): Promise<string> {
    try {
      const password = await this.setupEncryption(key);
      const iv = await Aes.randomKey(16);
      const encrypted = await Aes.encrypt(notes, password, iv, "aes-256-cbc");
      return `${iv}:${encrypted}`;
    } catch (error: unknown) {
      let errorMessage = "Failed to encrypt data.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Decryption with validation
  static async decryptData(ciphertext: string, key: string): Promise<string> {
    try {
      if (!ciphertext.includes(":")) {
        throw new Error("Invalid ciphertext format");
      }

      const password = await this.setupEncryption(key);
      const [iv, data] = ciphertext.split(":");

      if (!iv || !data) {
        throw new Error("Malformed ciphertext");
      }

      return await Aes.decrypt(data, password, iv, "aes-256-cbc");
    } catch (error: unknown) {
      let errorMessage = "Failed to decrypt data.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
}
