import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface FirestoreUserRecord {
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Normalizes email to be used as a safe document ID
 */
export function sanitizeEmailKey(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

/**
 * Checks Firestore if an account already exists for this email address.
 * Ensures across ANY mobile or desktop device, an existing user cannot sign up again.
 */
export async function checkUserExistsInFirebase(email: string): Promise<boolean> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return true;
    }

    // Secondary fallback query by email field
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    return !querySnap.empty;
  } catch (error) {
    console.warn('[Firebase] Warning checking user existence:', error);
    return false;
  }
}

/**
 * Registers or updates a user in Firestore.
 */
export async function saveUserToFirebase(email: string, name: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      email: cleanEmail,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[Firebase] User record saved for ${cleanEmail}`);
  } catch (error) {
    console.warn('[Firebase] Warning saving user to Firestore:', error);
  }
}

/**
 * Updates last login timestamp in Firestore.
 */
export async function recordUserLoginInFirebase(email: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {}
}
