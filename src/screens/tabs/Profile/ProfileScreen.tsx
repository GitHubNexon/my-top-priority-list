import { useAuth } from "../../../hooks/useAuths";
import { useFirestore } from "../../../context/FirestoreContext";
import { useNotes } from "../../../context/NotesContext";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions
} from "react-native";

const ProfileScreen = () => {
  const { width, height } = useWindowDimensions();

  const [isSyncing, setIsSyncing] = useState(false);
  const { syncNotesFromCloud, clearNotes } = useNotes();
  const { uid, signOut } = useAuth();
  const {
    getNotesFromFirestore,
    syncAllData,
  } = useFirestore();

  const syncMyData = async () => {
    try {
      setIsSyncing(true);

      // First sync local changes to Firestore
      await syncAllData(uid ?? '');

      // Then get the latest from Firestore
      const cloudNotes = await getNotesFromFirestore();

      // Finally update local storage with merged data
      syncNotesFromCloud(cloudNotes);
    } catch (error) {
      console.error("Sync error:", error);
      // Consider showing an error to the user
    } finally {
      setIsSyncing(false);
    }
  };


  const handleSignOut = async () => {
    try {
      setIsSyncing(true);
      /**
       * Execute both operations sequentially
       * 1. Clear notes first
       * 2. Clear storage keys of failed CRUD operation
       * from being offline
       */
      clearNotes();

      // 2. Then handle auth signout
      await signOut();
    } catch (error) {
      Alert.alert(`Logout error: ${error}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      /**
       * Required this for
       * the KB avoiding view
       * to work
       */
      behavior='height'
      /**
       * Need exactly at 70
       * or it cause some bugs
       * flickering at the bottom screen
       */
      keyboardVerticalOffset={0}
      style={styles.container}
    >
      {!!isSyncing &&
        <ActivityIndicator
          size={'large'}
          color={'#2E6F40'}
          style={[styles.loading, {
            right: (width / 2) - 18,
            bottom: height / 2,
          }]}
        />
      }
      <Text style={styles.text}>My Profile</Text>

      <Pressable
        onPress={syncMyData}
        style={styles.loginButton}
      >
        <Text style={styles.loginText}>
          Sync Data
        </Text>
      </Pressable>

      <Pressable
        onPress={handleSignOut}
        style={styles.loginButton}
      >
        <Text style={styles.loginText}>
          Log Out
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 50,
  },
  loginButton: {
    justifyContent: 'center',
    width: 320,
    height: 60,
    marginBottom: 50,
    paddingHorizontal: 30,
    borderRadius: 30,
    outlineWidth: 2,
    outlineColor: '#e9e9e942',
    backgroundColor: '#68BA7F',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 2,
  },
  loading: {
    position: 'absolute',
    transform: [{ scale: 2 }],
    zIndex: 1000
  },
});

export default ProfileScreen;