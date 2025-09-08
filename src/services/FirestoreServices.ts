import { Notes } from '../types/Notes';
import { UserCredentials } from '../types/UserCredentials';
import { getFirestoreErrorMessage } from '../utils/firebaseErrorMessages';
import {
  collection,
  doc,
  FirebaseFirestoreTypes,
  getDocs,
  getFirestore,
  initializeFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import { isErrorWithCode } from '@react-native-google-signin/google-signin';

const cache = new Map<string, FirebaseFirestoreTypes.CollectionReference>();
type data = FirebaseFirestoreTypes.DocumentData | undefined;

export class FireStoreServices {
  

  // Returns a memoizable reference to the user's notes collection
  static getUserNotesCollectionRef(uid: string | null) {
    if (!uid) return null;
    if (cache.has(uid)) return cache.get(uid)!;

    const ref = collection(doc(getFirestore(), 'users', uid), 'notes');
    cache.set(uid, ref);
    return ref;
  }

  // Fetch notes from Firestore using the above reference
  static async getNotes(uid: string): Promise<Notes[]> {
    try {
      const collectionRef = this.getUserNotesCollectionRef(uid);
      if (!collectionRef) {
        throw new Error('Invalid user ID.');
      }

      const snapshot = await getDocs(collectionRef);
      return snapshot.docs.map((docs: FirebaseFirestoreTypes.DocumentData) =>
        docs.data(),
      ) as Notes[];
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch notes.';
      if (isErrorWithCode(error)) {
        errorMessage = getFirestoreErrorMessage(error.code);
        console.error(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        console.error(`Unknown Error: ${error}`);
      }
      throw new Error(errorMessage);
    }
  }

  // Upload notes at Firestore using the above reference
  static async uploadNotes(uid: string, note: Notes): Promise<void> {
    try {
      const collectionRef = this.getUserNotesCollectionRef(uid);
      if (!collectionRef) {
        throw new Error('Invalid user ID.');
      }

      await collectionRef.doc(note.id).set(note);
    } catch (error: unknown) {
      let errorMessage = 'Failed to upload user notes.';
      if (isErrorWithCode(error)) {
        errorMessage = getFirestoreErrorMessage(error.code);
        console.error(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        console.error(`Unknown Error: ${error}`);
      }
      throw new Error(errorMessage);
    }
  }

  // Update notes from Firestore using the above reference
  static async updateNotes(
    uid: string,
    id: string,
    data: Partial<Notes>,
  ): Promise<void> {
    try {
      const collectionRef = this.getUserNotesCollectionRef(uid);
      if (!collectionRef) {
        throw new Error('Invalid user ID.');
      }

      await collectionRef.doc(id).update(data);
    } catch (error: unknown) {
      let errorMessage = 'Failed to update notes.';
      if (isErrorWithCode(error)) {
        errorMessage = getFirestoreErrorMessage(error.code);
        console.error(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        console.error(`Unknown Error: ${error}`);
      }
      throw new Error(errorMessage);
    }
  }

  // Delete notes from Firestore using the above reference
  static async deleteNotes(uid: string, id: string): Promise<void> {
    try {
      const collectionRef = this.getUserNotesCollectionRef(uid);
      if (!collectionRef) {
        throw new Error('Invalid user ID.');
      }

      await collectionRef.doc(id).delete();
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete notes.';
      if (isErrorWithCode(error)) {
        errorMessage = getFirestoreErrorMessage(error.code);
        console.error(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        console.error(`Unknown Error: ${error}`);
      }
      throw new Error(errorMessage);
    }
  }

  static async checkUserCredentials(uid: string): Promise<data> {
    const docRef = doc(
      collection(doc(getFirestore(), 'users', uid), 'credentials'),
      'additional_info',
    );

    const docSnapshot = await getDocs(docRef);

    if (!docSnapshot.exists()) console.log('No user credentials found.');

    const data = docSnapshot.data();

    return data;
  }

  // Save additional data in Firestore
  static async uploadUserCredentials(
    uid: string,
    credentials: UserCredentials,
  ): Promise<void> {
    try {
      await setDoc(
        doc(getFirestore(), 'users', uid, 'credentials', 'additional_info'),
        credentials,
      );
    } catch (error: unknown) {
      let errorMessage = 'Failed to upload user credentials.';
      if (isErrorWithCode(error)) {
        errorMessage = getFirestoreErrorMessage(error.code);
        console.error(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        console.error(`Unknown Error: ${error}`);
      }
      throw new Error(errorMessage);
    }
  }
}
