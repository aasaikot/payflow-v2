import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile,
  fetchSignInMethodsForEmail,
  setPersistence,
  browserLocalPersistence,
  signInWithCredential,
  User,
} from 'firebase/auth';
import { getDatabase, ref, set, get, onValue, update, remove, child } from 'firebase/database';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication instance
export const auth = getAuth(app);
// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence);

// Realtime Database instance - Using your specific Asia Southeast 1 URL
export const db = getDatabase(app, "https://salary-tracking-a1b5c-default-rtdb.asia-southeast1.firebasedatabase.app/");

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  console.error('Database Error: ', error);
  throw error;
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile,
  fetchSignInMethodsForEmail,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
  child,
};

export type { User };
