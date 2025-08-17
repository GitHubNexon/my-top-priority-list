import {
  ENCRYPTED_FAILED_NOTES_ID_KEY,
  ENCRYPTED_FAILED_NOTES_ID_PASSWORD_KEY,
} from '../constant/keys';
import { SecureStorage } from '../storage/SecureStorage';
import { Notes, successfulSync, SyncFailedNotesId } from '../types/Notes';
import { FireStoreServices } from "./FirestoreServices";

export class SyncLocalNotes {
  // Initialized first and get current save failed notes Id
  static async getSyncFailedNotesId(): Promise<SyncFailedNotesId | null> {
    return await SecureStorage.getSecureItem<SyncFailedNotesId>(
      ENCRYPTED_FAILED_NOTES_ID_KEY,
      ENCRYPTED_FAILED_NOTES_ID_PASSWORD_KEY
    );
  }

  // Save filtered failed notes Id
  static async saveSyncFailedNotesId(
    failedNotes: SyncFailedNotesId
  ): Promise<void> {
    await SecureStorage.saveSecureItem<SyncFailedNotesId>(
      ENCRYPTED_FAILED_NOTES_ID_KEY,
      failedNotes,
      ENCRYPTED_FAILED_NOTES_ID_PASSWORD_KEY
    );
  }

  // Sync failed delete operation into firestore
  static async syncFailedDeletedNotes(uid: string) {
    const syncFailedNotesId = await this.getSyncFailedNotesId();

    if (!syncFailedNotesId) return [];

    for (const id of syncFailedNotesId.deletedNotesId) {
      try {
        await FireStoreServices.deleteNotes(uid, id);
        successfulSync.push(id);
        console.log("Deleted from Firestore:", id);
      } catch (error: unknown) {
        let errorMessage = "Failed to delete again";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    }
    // Update failedIds by removing successful deletions
    syncFailedNotesId.deletedNotesId = syncFailedNotesId.deletedNotesId.filter(
      (id) => !successfulSync.includes(id)
    );

    await this.saveSyncFailedNotesId(syncFailedNotesId);
  }

  // Sync failed create operation into firestore
  static async syncFailedCreatedNotes(uid: string, notes: Notes[]) {
    const syncFailedNotesId = await this.getSyncFailedNotesId();

    if (!syncFailedNotesId) return [];

    for (const id of syncFailedNotesId.uploadedNotesId) {
      try {
        const currentNote = notes.find((n) => n.id === id);
        if (!currentNote) continue;
        await FireStoreServices.uploadNotes(uid, currentNote);
        successfulSync.push(id);
        console.log("Deleted from Firestore:", id);
      } catch (error: unknown) {
        let errorMessage = "Failed to delete again";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    }

    // Update failedIds by removing successful deletions
    syncFailedNotesId.uploadedNotesId =
      syncFailedNotesId.uploadedNotesId.filter(
        (id) => !successfulSync.includes(id)
      );

    await this.saveSyncFailedNotesId(syncFailedNotesId);
  }

  // Sync failed update operation into firestore
  static async syncFailedUpdatedNotes(uid: string, notes: Partial<Notes[]>) {
    const syncFailedNotesId = await this.getSyncFailedNotesId();

    if (!syncFailedNotesId) return [];

    for (const id of syncFailedNotesId.updatedNotesId) {
      try {
        const currentNote = notes.find((n) => n?.id === id);
        if (!currentNote) continue;
        await FireStoreServices.updateNotes(uid, id, currentNote);
        successfulSync.push(id);
        console.log("Deleted from Firestore:", id);
      } catch (error: unknown) {
        let errorMessage = "Failed to delete again";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    }

    // Update failedIds by removing successful deletions
    syncFailedNotesId.updatedNotesId = syncFailedNotesId.updatedNotesId.filter(
      (id) => !successfulSync.includes(id)
    );

    await this.saveSyncFailedNotesId(syncFailedNotesId);
  }
}
