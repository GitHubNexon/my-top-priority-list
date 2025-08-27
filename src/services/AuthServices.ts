import { WEB_CLIENT_ID } from "../constant/keys";
import {
  getFirebaseGoogleSignInErrorMessage,
  getFirebaseSignInErrorMessage,
  getFirebaseSignUpErrorMessage,
} from '../utils/firebaseErrorMessages';
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  FirebaseAuthTypes,
  getAuth,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
} from "@react-native-google-signin/google-signin";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";

export class AuthServices {
  // Initializing Google SDK
  static initializeGoogleSDK() {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true, // Optional: If you need server-side access
      forceCodeForRefreshToken: true, // Optional: For refresh token
      scopes: ["https://www.googleapis.com/auth/userinfo.profile"],
    });
  }

  // Sign In
  static async signIn(
    email: string,
    password: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      return await signInWithEmailAndPassword(getAuth(), email, password);
    } catch (error: unknown) {
      let errorMessage = "Sign in failed. Please check your credentials";

      if (isErrorWithCode(error)) {
        errorMessage = getFirebaseSignInErrorMessage(error.code);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  // Sign Up
  static async signUp(
    email: string,
    password: string
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const response = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      if (response.user) {
        await sendEmailVerification(response.user);
      }

      return response;
    } catch (error: unknown) {
      let errorMessage = "Sign up failed. Please check your credentials.";

      if (isErrorWithCode(error)) {
        errorMessage = getFirebaseSignUpErrorMessage(error.code);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  // Get Current User
  static getCurrentUser() {
    return getAuth().currentUser;
  }

  // Verify Email of Current User
  static verifyCurrentUserEmail(): boolean {
    return this.getCurrentUser()?.emailVerified ?? false;
  }

  // Get UID
  static getcurrentUserUid(): string {
    const uid = this.getCurrentUser()?.uid;
    if (!uid) {
      throw new Error("No authenticated user");
    }
    return uid;
  }

  // Sign Out
  static async signOut(): Promise<void> {
    try {
      await signOut(getAuth());
      await GoogleSignin.signOut();
    } catch (error: unknown) {
      let message = "Sign out failed.";

      if (error instanceof Error) {
        message = error.message;
      }

      throw new Error(message);
    }
  }

  // Password Reset
  static async resetPassword(email: string): Promise<void> {
    try {
      console.log("Password reset email sent.");
      await sendPasswordResetEmail(getAuth(), email);
    } catch (error: unknown) {
      let errorMessage = "Failed to send reset email";
      if (isErrorWithCode(error)) {
        errorMessage = error.code;
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Facebook Sign In
  static async signInWithfacebook(): Promise<FirebaseAuthTypes.UserCredential> {
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      throw "User cancelled the login process";
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw "Something went wrong obtaining access token";
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = FacebookAuthProvider.credential(
      data.accessToken
    );

    // Sign-in the user with the credential
    return await signInWithCredential(getAuth(), facebookCredential);
  }

  // Google Sign In
  static async signInWithGoogle(): Promise<{
    firebaseUser: FirebaseAuthTypes.User;
    fullName: string | null;
  }> {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the user and ID token
      const userInfo = await GoogleSignin.signIn();
      const { data } = userInfo;

      if (!data) throw new Error("No ID token returned");

      const fullName = data.user.name;

      // Create Firebase credential with Google token
      const googleCredential = GoogleAuthProvider.credential(data.idToken);

      // Sign in to Firebase
      const userCredential =
        await signInWithCredential(getAuth(), googleCredential);

      return {
        firebaseUser: userCredential.user,
        fullName,
      };
    } catch (error: unknown) {
      let errorMessage = "Sign in failed. Please try again.";

      if (isErrorWithCode(error)) {
        errorMessage = getFirebaseGoogleSignInErrorMessage(error.code);
        throw new Error(errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
}
