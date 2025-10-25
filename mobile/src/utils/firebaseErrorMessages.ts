import { statusCodes } from "@react-native-google-signin/google-signin";

// Firebase Sign In Error
export function getFirebaseSignInErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is badly formatted.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "The password is incorrect.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/internal-error":
      return "Internal error occurred. Please try again.";
    default:
      return code;
  }
}

// Firebase Create an Email Error
export function getFirebaseSignUpErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already associated with an account.";
    case "auth/invalid-email":
      return "The email address is badly formatted.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger one.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/internal-error":
      return "Internal error occurred. Please try again.";
    case "auth/missing-email":
      return "Please enter an email address.";
    case "auth/missing-password":
      return "Please enter a password.";
    case "auth/too-many-requests":
      return "Too many sign-up attempts. Please try again later.";
    default:
      return code;
  }
}

// Firebase Sign In with Google Error
export function getFirebaseGoogleSignInErrorMessage(code: string): string {
  switch (code) {
    case statusCodes.SIGN_IN_CANCELLED:
      return "Sign-in was cancelled.";
    case statusCodes.IN_PROGRESS:
      return "Sign-in already in progress.";
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return "Google Play Services are unavailable.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in method.";
    case "auth/invalid-credential":
      return "The provided Google credentials are invalid or expired.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/internal-error":
      return "An internal error occurred. Please try again.";
    default:
      return code;
  }
}

// Firebase Firestore Fetching Error
export function getFirestoreErrorMessage(code: string): string {
  switch (code) {
    case "permission-denied":
      return "You do not have permission to access these notes.";
    case "unavailable":
      return "Service is currently unavailable. Please try again later.";
    case "deadline-exceeded":
      return "The request took too long to complete. Please try again.";
    case "not-found":
      return "The notes collection was not found.";
    case "resource-exhausted":
      return "Quota exceeded. Please reduce your usage or try again later.";
    case "unauthenticated":
      return "You need to be signed in to access notes.";
    case "aborted":
      return "The operation was aborted. Please retry.";
    case "internal":
      return "An internal error occurred. Please try again.";
    case "cancelled":
      return "The operation was cancelled.";
    case "invalid-argument":
      return "Invalid argument provided. Please check your request.";
    case "failed-precondition":
      return "The operation was rejected due to a failed precondition.";
    case "data-loss":
      return "Data loss or corruption occurred.";
    case "already-exists":
      return "A document with the same ID already exists.";
    case "out-of-range":
      return "The request specified a value out of the allowed range.";
    case "unknown":
    default:
      return code;
  }
}
