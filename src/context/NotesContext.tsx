import {
    ENCRYPTED_NOTES_KEY,
    ENCRYPTED_NOTES_PASSWORD_KEY
} from "../constant/keys";
import { NotificationService } from "../services/NotificationServices";
import { SecureStorage } from "../storage/SecureStorage";
import { Notes } from "../types/Notes";
import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react";

type NotesContextType = {
    getNotesToastMessage: (message: string | null) => void;
    noteToastMessage: string | null;
    notes: Notes[];
    addNote: (note: Notes) => void;
    updateNote: (id: string, updatedNote: Partial<Notes>) => void;
    deleteNote: (note: Notes) => void;
    clearNotes: () => void;
    syncNotesFromCloud: (cloudNotes: Notes[]) => void;
};

export const NotesContext = createContext<NotesContextType>({
    getNotesToastMessage: () => { },
    noteToastMessage: null,
    notes: [],
    addNote: () => { },
    updateNote: () => { },
    deleteNote: () => { },
    clearNotes: () => { },
    syncNotesFromCloud: () => { },
});

const NotesProvider = ({ children }: { children: React.ReactNode }) => {
    const [noteToastMessage, setToastMessage] = useState<string | null>(null);
    const [notes, setNotes] = useState<Notes[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const verifyCleanup = async () => {
        const keys = await SecureStorage.verifyCleanUp();
        console.log(`Verification: ${keys?.length === 0
            ? '✅ Keys have been cleared.'
            : '❌ Keys are not completely cleared.'}`);
    };

    // Debounced persistence
    const persistNotes = useCallback(async (notesToSave: Notes[]) => {
        try {
            await SecureStorage.saveSecureItem<Notes[]>(
                ENCRYPTED_NOTES_KEY,
                notesToSave,
                ENCRYPTED_NOTES_PASSWORD_KEY
            );
        } catch (error: unknown) {
            let errorMessage = "Failed to persist saving notes into local storage."
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }, []);

    // Load notes on mount
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const decrypted = await SecureStorage.getSecureItem<Notes[]>(
                    ENCRYPTED_NOTES_KEY,
                    ENCRYPTED_NOTES_PASSWORD_KEY
                ) ?? [];
                setNotes(decrypted)
            } catch (error: unknown) {
                let errorMessage = "Failed to persist getting notes from local storage."
                if (error instanceof Error) {
                    errorMessage = error.message;
                }

                throw new Error(errorMessage);
            } finally {
                setIsInitialized(true);
            };
        };

        loadNotes();
    }, []);

    // Auto-persist with debouncing
    useEffect(() => {
        if (!isInitialized || notes.length === 0) return;

        const timer = setTimeout(() => persistNotes(notes), 500);
        return () => clearTimeout(timer);
    }, [notes, isInitialized, persistNotes]);

    const getNotesToastMessage = (message: string | null) => {
        setToastMessage(message);
    };

    const addNote = async (note: Notes) => {
        setNotes(prev => [...prev, note]);
        if (note.Time) {
            await NotificationService.scheduleNoteNotification(note);
        }
    };

    const updateNote = async (id: string, updates: Partial<Notes>) => {
        const currentNote = notes.find(n => n.id === id);
        if (!currentNote) return;

        const updatedNote = { ...currentNote, ...updates };
        setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));

        if (updates.Time !== null && updates.Time !== currentNote.Time) {
            await NotificationService.updateNoteNotification(updatedNote);
        }
    };

    const deleteNote = async (note: Notes) => {
        setNotes(prev => prev.filter(n => n.id !== note.id));
        await NotificationService.cancelNoteNotification(note.id);
    };

    const clearNotes = async () => {
        try {
            await NotificationService.cancelAllNotifications();
            setNotes([]);
            await verifyCleanup();
        } catch (error) {
            console.error("Failed to clear notes:", error);
        }
    };

    const syncNotesFromCloud = (cloudNotes: Notes[]) => {
        setNotes(cloudNotes);
    };

    return (
        <NotesContext.Provider value={{
            getNotesToastMessage,
            noteToastMessage,
            notes,
            addNote,
            updateNote,
            deleteNote,
            clearNotes,
            syncNotesFromCloud,
        }}>
            {children}
        </NotesContext.Provider>
    );
};

export default NotesProvider;