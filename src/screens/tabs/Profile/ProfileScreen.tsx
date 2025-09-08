import {
  useAuth,
  useFirestore,
  useNotes,
  useTheme,
} from "../../../hooks";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useProfileNavigation } from "../../../hooks/useNavigation";
import Toast from "../../../components/ToastMessage";

const ProfileScreen = () => {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();
  const { uid, signOut } = useAuth();
  const { getNotesFromFirestore, syncAllData } = useFirestore();
  const { syncNotesFromCloud, clearNotes } = useNotes();
  const navigation = useProfileNavigation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const themeColor = theme.myColors?.triadic;
  const primaryFontColor = theme.fontColors?.primary

  const syncMyData = async () => {
    setIsSyncing(true);
    try {
      // First sync local changes to Firestore
      if(!uid) {
        setShowToast(true);
        setToastMessage('Error: You need to sign in first.');
        return;
      }
      await syncAllData(uid);

      // Then get the latest from Firestore
      const cloudNotes = await getNotesFromFirestore();

      // Finally update local storage with merged data
      syncNotesFromCloud(cloudNotes);
    } catch (error: unknown) {
      let errorMessage = "Synching failed, check your internet connection.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setShowToast(true);
      setToastMessage(errorMessage);

      throw errorMessage
    } finally {
      setIsSyncing(false);
    };
  };


  const handleSignOut = async () => {
    setIsSyncing(true);
    try {
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

  const faqHandle = () => {
    navigation.push("FaQScreen");
  };

  return (
    <View style={[styles.container, {
      backgroundColor: themeColor,
    }]}>
      {!!isSyncing &&
        <ActivityIndicator
          size={'large'}
          color={'#2E6F40'}
          style={[styles.loading, {
            right: (width * .5) - 18,
            bottom: height * .6,
          }]}
        />
      }
      <Toast
        message={toastMessage ?? ''}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      <Text style={[styles.text, {
        color: primaryFontColor,
      }]}>My Profile</Text>

      <Pressable
        onPress={faqHandle}
        style={styles.loginButton}
      >
        <Text style={styles.loginText}>
          FaQ
        </Text>
      </Pressable>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
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