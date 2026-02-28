'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Sends a passwordless login link to the user's email.
 * This is the secure equivalent of an OTP via email.
 */
export async function sendLoginLink(authInstance: Auth, email: string): Promise<void> {
  const actionCodeSettings = {
    // The URL to redirect back to. The domain must be whitelisted in Firebase Console.
    url: window.location.origin + '/auth/action',
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(authInstance, email, actionCodeSettings);
    // Save the email locally so we don't have to ask the user for it again on the same device.
    window.localStorage.setItem('emailForSignIn', email);
  } catch (error) {
    throw error;
  }
}

/** Completes the sign-in using the link from the email. */
export async function completeEmailLinkSignIn(authInstance: Auth): Promise<void> {
  if (isSignInWithEmailLink(authInstance, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    
    // If the user opened the link on a different device, we might not have the email in localStorage.
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    if (email) {
      try {
        await signInWithEmailLink(authInstance, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
      } catch (error) {
        throw error;
      }
    }
  }
}
