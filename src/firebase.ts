import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  }, dbId);
} catch (e) {
  firestoreDb = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = firestoreDb;

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system_settings', 'connection_test'));
  } catch (err) {
    console.warn('Firestore connection check:', err);
  }
}

export default app;
