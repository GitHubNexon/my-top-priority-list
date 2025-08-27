import {
    ENCRYPTED_FAILED_NOTES_ID_KEY,
    ENCRYPTED_FAILED_NOTES_ID_PASSWORD_KEY
} from "../constant/keys";
import { FireStoreServices } from "../services/FirestoreServices";
import { SyncLocalNotes } from "../services/SyncLocalNotes";
import { SecureStorage } from "../storage/SecureStorage";
import {
    Notes,
    successfulSync,
    SyncFailedNotesId
} from "../types/Notes";
import { UserCredentials } from "../types/UserCredentials";
import {
    createContext,
    PropsWithChildren,
} from "react";
import { useAuth, useNotes } from "../hooks";

type FirestoreContextType = {
    getNotesFromFirestore: () => Promise<Notes[]>;
    uploadNoteInFirestore: (note: Notes) => Promise<void>;
    updateNoteInFirestore: (userID: string, id: string, data: Partial<Notes>) => Promise<void>;
    deleteNoteFromFirestore: (uid: string, id: string) => Promise<void>;
    updateUserCredentials: (id: string, data: Partial<UserCredentials>) => Promise<void>;
    syncAllData: (uid: string) => Promise<void>;
};

export const FirestoreContext = createContext<FirestoreContextType>({
    updateUserCredentials: async () => { },
    getNotesFromFirestore: async () => [],
    uploadNoteInFirestore: async () => { },
    deleteNoteFromFirestore: async () => { },
    updateNoteInFirestore: async () => { },
    syncAllData: async () => { },
});

const FirestoreProvider = ({ children }: PropsWithChildren) => {
    const { uid } = useAuth();
    const { notes } = useNotes();

    const saveFailedNote = async (type: keyof SyncFailedNotesId, id: string) => {
        try {
            const syncFailedNotesId = await SecureStorage.getSecureItem<SyncFailedNotesId>(
                ENCRYPTED_FAILED_NOTES_ID_KEY,
                ENCRYPTED_FAILED_NOTES_ID_PASSWORD_KEY
            );

            if (!syncFailedNotesId) return;

            if (type === "deletedNotesId") {
                syncFailedNotesId.updatedNotesId =
                    syncFailedNotesId.updatedNotesId.filter((noteId) => noteId !== id);
                syncFailedNotesId.uploadedNotesId =
                    syncFailedNotesId.uploadedNotesId.filter((noteId) => noteId !== id);
            }

            if (!syncFailedNotesId[type].includes(id)) {
                syncFailedNotesId[type].push(id);
            }

            await SecureStorage.saveSecureItem<SyncFailedNotesId>(
                ENCRYPTED_FAILED_NOTES_ID_KEY,
                syncFailedNotesId,
                ENCRYPTED_FAILED_NOTES_ID_PASSWORD_KEY
            );
        } catch (e) {
            console.error("Failed to save failed note id:", e);
        }
    };

    const getNotesFromFirestore = async (): Promise<Notes[]> => {
        try {
            if (!uid) return [];
            return await FireStoreServices.getNotes(uid);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            };
            return [];
        };
    };

    const uploadNoteInFirestore = async (note: Notes) => {
        try {
            if (!uid) return;
            await FireStoreServices.uploadNotes(uid, note);
        } catch (error: unknown) {
            if (error instanceof Error) {
                await saveFailedNote('uploadedNotesId', note.id);
                throw new Error(error.message);
            };
        };
    };

    const updateNoteInFirestore = async (
        userID = uid,
        id: string,
        data: Partial<Notes>
    ) => {
        try {
            if (!userID) return;
            await FireStoreServices.updateNotes(userID, id, data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                await saveFailedNote('updatedNotesId', id);
                throw new Error(error.message);
            };
        };
    };

    const deleteNoteFromFirestore = async (userID = uid, id: string) => {
        try {
            if (!userID) return;
            await FireStoreServices.deleteNotes(userID, id);
        } catch (error: unknown) {
            if (error instanceof Error) {
                await saveFailedNote('deletedNotesId', id);
                throw new Error(error.message);
            }
        };
    };

    const syncAllData = async (userID = uid) => {
        try {
            if (!userID) return;
            await SyncLocalNotes.syncFailedDeletedNotes(userID);
            await SyncLocalNotes.syncFailedCreatedNotes(userID, notes);
            await SyncLocalNotes.syncFailedUpdatedNotes(userID, notes);
            successfulSync.length = 0; // clear the arrays
        } catch (error: unknown) {
            let errorMessage = "Error syncing local data.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    };

    const updateUserCredentials = async (
        userID = uid,
        updateCredentials: UserCredentials
    ) => {
        try {
            if (!userID) return;
            await FireStoreServices.uploadUserCredentials(
                userID,
                updateCredentials
            );
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            };
        };
    };

    return (
        <FirestoreContext.Provider
            value={{
                updateUserCredentials,
                getNotesFromFirestore,
                uploadNoteInFirestore,
                deleteNoteFromFirestore,
                updateNoteInFirestore,
                syncAllData,
            }}
        >
            {children}
        </FirestoreContext.Provider>
    );
};

export default FirestoreProvider;