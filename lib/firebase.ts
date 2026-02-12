import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy-initialize Firebase to avoid SSR/SSG errors (no API key at build time)
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  if (!_auth) {
    _auth = getAuth(_app);
  }
  return _auth;
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize an invisible reCAPTCHA verifier on a given element.
 * Call this once before sending an OTP.
 */
export function setupRecaptcha(elementId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  const auth = getFirebaseAuth();

  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved — will proceed with sendOtp
    },
  });

  return recaptchaVerifier;
}

/**
 * Send an SMS OTP to the given phone number using Firebase.
 * Returns a ConfirmationResult that can be used to verify the OTP.
 */
export async function sendFirebaseOtp(
  phoneNumber: string
): Promise<ConfirmationResult> {
  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not initialized. Call setupRecaptcha first.");
  }

  const auth = getFirebaseAuth();

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    recaptchaVerifier
  );

  return confirmationResult;
}

/**
 * Verify the OTP code using the ConfirmationResult from sendFirebaseOtp.
 * Returns the Firebase ID token on success.
 */
export async function verifyFirebaseOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<string> {
  const userCredential = await confirmationResult.confirm(otpCode);
  const idToken = await userCredential.user.getIdToken();
  return idToken;
}

/**
 * Clean up the reCAPTCHA verifier.
 */
export function clearRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}
