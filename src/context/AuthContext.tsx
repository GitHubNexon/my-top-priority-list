import { CommonActions } from '@react-navigation/native';
import {
    ENCRYPTED_AUTH_STATES_KEY,
    ENCRYPTED_AUTH_STATES_PASSWORD_KEY,
    MMKV_AUTH_STATES_ID,
    MMKV_AUTH_STATES_KEY
} from '../constant/keys';
import { navigationRef } from '../hooks/useNavigation';
import { AuthServices } from '../services/AuthServices';
import { FireStoreServices } from '../services/FirestoreServices';
import { SecureStorage } from '../storage/SecureStorage';
import { AuthStateType } from '../types/AuthStateType';
import { UserCredentials } from '../types/UserCredentials';
import { FirebaseAuthTypes, reload } from '@react-native-firebase/auth';
import {
    createContext,
    PropsWithChildren,
    useEffect,
    useState
} from 'react';
import BootSplash from 'react-native-bootsplash';

type AuthContextType = {
    isLoggedIn: boolean;
    isReady: boolean;
    uid: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        userCredentials: UserCredentials
    ) => Promise<void>;
    signOut: () => Promise<void>;
    googleSignIn: () => void;
    facebookSignIn: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isReady: false,
    uid: null,
    signIn: async () => { },
    signOut: async () => { },
    signUp: async () => { },
    googleSignIn: async () => { },
    facebookSignIn: async () => { },
});

const AuthProvider = ({ children }: PropsWithChildren) => {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [uid, setUid] = useState<string | null>(null);
    const [credentials, setCredentials] = useState<UserCredentials>({
        FullName: null,
        BirthDate: null,
        CreatedAt: null,
    });
    const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.UserCredential | null>(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const storeAuthState = async (newState: AuthStateType) => {
        try {
            await SecureStorage.saveSecureItem<AuthStateType>(
                MMKV_AUTH_STATES_ID,
                MMKV_AUTH_STATES_KEY,
                ENCRYPTED_AUTH_STATES_KEY,
                newState,
                ENCRYPTED_AUTH_STATES_PASSWORD_KEY
            );
        } catch (error: unknown) {
            let errorMessage = 'Error saving auth state';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error(`Error: ${errorMessage}`);
            throw errorMessage;
        }
    };

    const applyAuthState = async (userUid: string): Promise<void> => {
        setUid(userUid)
        setIsLoggedIn(true)
        try {
            return await storeAuthState({ isLoggedIn: true, uid: userUid });
        } catch (error: unknown) {
            let errorMessage = 'Error saving auth state.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error(`Error: ${errorMessage}`);
            throw errorMessage;
        }
    };

    // Load from local storage first
    useEffect(() => {
        const getAuthStateFromStorage = async () => {
            try {
                const value = await SecureStorage.getSecureItem<AuthStateType>(
                    MMKV_AUTH_STATES_ID,
                    MMKV_AUTH_STATES_KEY,
                    ENCRYPTED_AUTH_STATES_KEY,
                    ENCRYPTED_AUTH_STATES_PASSWORD_KEY
                );
                if (value !== null) {
                    if (value.isLoggedIn) {
                        setIsLoggedIn(value.isLoggedIn);
                        setUid(value.uid);
                    }
                }
            } catch (error: unknown) {
                let errorMessage = 'Error fetching auth state from local storage';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }

                console.error(`Error: ${errorMessage}`);
                throw errorMessage;
            }
            setIsReady(true);
        };

        getAuthStateFromStorage();
    }, []);

    // Auto-refresh email verification every 5 seconds if not verified
    useEffect(() => {
        if (!currentUser || isEmailVerified) return;

        let isMounted = true;
        let interval: ReturnType<typeof setInterval>;

        const checkVerification = async () => {
            try {
                await reload(currentUser.user);

                const updatedUser = AuthServices.getCurrentUser();
                if (!isMounted || !updatedUser) return;

                const verified = AuthServices.verifyCurrentUserEmail();
                setIsEmailVerified(verified ?? false);

                if (verified) {
                    clearInterval(interval);
                    const userID = AuthServices.getcurrentUserUid();
                    await applyAuthState(userID);
                    await FireStoreServices.uploadUserCredentials(
                        userID,
                        credentials
                    );
                }
            } catch (error: unknown) {
                let errorMessage = 'Verification check failed:';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                console.error(`Error: ${errorMessage}`);
                throw error;
            }
        };

        interval = setInterval(checkVerification, 5000);

        // Immediate first check
        checkVerification();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [
        currentUser,
        isEmailVerified,
        credentials,
    ]);

    // Hide splash
    useEffect(() => {
        if (isReady) {
            BootSplash.hide({ fade: true });
        }
    }, [isReady]);

    // Sign In
    const signIn = async (email: string, password: string) => {
        try {
            const result = await AuthServices.signIn(
                email,
                password,
            );
            if (!result?.user?.uid) {
                throw new Error('Invalid sign-in result: missing UID.');
            }
            const userUid = result.user.uid;
            await applyAuthState(userUid);
        } catch (error: unknown) {
            throw error;
        };
    };

    // Sign Up
    const signUp = async (
        email: string,
        password: string,
        userCredentials: UserCredentials
    ) => {
        try {
            const currentDate = new Date().toLocaleString();
            setCredentials({
                ...userCredentials,
                CreatedAt: currentDate,
            });
            const result = await AuthServices.signUp(email, password);
            setCurrentUser(result);
            setIsEmailVerified(result.user.emailVerified);
        } catch (error: unknown) {
            throw error;
        };
    };

    // Sign Out
    const signOut = async () => {
        try {
            await SecureStorage.clearAllStorageKeys();
            /**
             * Clear all notes after logout
             * And clear local storage including
             * keys, passkey and encrypted notes
            */
            await AuthServices.signOut();
            setUid(null);
            setCredentials({
                FullName: null,
                BirthDate: null,
                CreatedAt: null,
            });
            await storeAuthState({ isLoggedIn: false, uid: null });
            setIsLoggedIn(false);
        } catch (error: unknown) {
            throw error;
        };
    };

    // Sign In with Facebook
    const facebookSignIn = async () => {
        try {
            const result = await AuthServices.signInWithfacebook();
            const userUid = result.user.uid
            await applyAuthState(userUid);
        } catch (error: unknown) {
            throw error;
        };
    };

    // Sign In with Google
    const googleSignIn = async () => {
        try {
            const result = await AuthServices.signInWithGoogle();
            const userID = result.firebaseUser.uid;
            const userFullName = result.fullName;
            const currentDate = new Date().toLocaleString();
            const getCurrentUserData = await FireStoreServices.checkUserCredentials(userID);
            if (!getCurrentUserData?.CreatedAt) {
                const newCredentials = {
                    FullName: userFullName,
                    CreatedAt: currentDate,
                };

                await FireStoreServices.uploadUserCredentials(
                    userID,
                    newCredentials
                );
            };
            await applyAuthState(userID);
        } catch (error: unknown) {
            throw error;
        };
    };

    return (
        <AuthContext.Provider
            value={{
                isReady,
                isLoggedIn,
                uid,
                signIn,
                signOut,
                signUp,
                googleSignIn,
                facebookSignIn
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;