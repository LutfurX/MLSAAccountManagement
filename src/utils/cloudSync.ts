import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { StudentFee, SchoolExpense, BankTransaction, AppUser } from '../types';
import { DEFAULT_USERS } from './auth';

const COLLECTIONS = {
  USERS: 'app_users',
  FEES: 'student_fees',
  EXPENSES: 'school_expenses',
  BANK: 'bank_transactions',
  SETTINGS: 'system_settings',
};

// Deeply sanitize object so no undefined values are sent to Firestore
export function sanitizeForFirestore<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    return data;
  }
}

// Seed initial users into Firestore if collection is empty
export async function seedInitialUsersIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (snap.empty) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      for (const u of DEFAULT_USERS) {
        batch.set(doc(db, COLLECTIONS.USERS, u.id), sanitizeForFirestore(u));
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Could not seed initial users to Firestore (might be offline):', err);
  }
}

// Fetch single user by username directly from Firestore
export async function getCloudUserByUsername(username: string): Promise<AppUser | null> {
  try {
    const clean = username.trim().toLowerCase();
    const q = query(collection(db, COLLECTIONS.USERS), where('username', '==', clean));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as AppUser;
    }
    // Fallback: check all docs case-insensitively
    const allSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    for (const d of allSnap.docs) {
      const u = d.data() as AppUser;
      if (u.username.toLowerCase() === clean) {
        return u;
      }
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user from Firestore:', err);
    return null;
  }
}

// Save or update user in Firestore
export async function saveUserToCloud(user: AppUser): Promise<void> {
  const clean = sanitizeForFirestore(user);
  await setDoc(doc(db, COLLECTIONS.USERS, user.id), clean, { merge: true });
}

// Delete user from Firestore (Admin cannot be deleted)
export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    if (userId === 'user_admin_headmaster') {
      console.warn('Cannot delete primary admin user.');
      return;
    }
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (err) {
    console.error('Error deleting user from Firestore:', err);
  }
}

// Subscribe to all users from Firestore
export function subscribeToUsers(
  callback: (users: AppUser[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.USERS),
    (snap) => {
      if (!snap.empty) {
        const list: AppUser[] = [];
        snap.forEach((d) => list.push(d.data() as AppUser));
        callback(list);
      } else {
        // If empty on cloud, trigger seeding
        seedInitialUsersIfEmpty();
      }
    },
    (err) => {
      console.warn('Users Firestore subscription error:', err);
    }
  );
}

// Subscribe to Student Fees
export function subscribeToFees(
  callback: (fees: StudentFee[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.FEES),
    (snap) => {
      const list: StudentFee[] = [];
      snap.forEach((d) => list.push(d.data() as StudentFee));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      callback(list);
    },
    (err) => {
      console.warn('Fees Firestore subscription error:', err);
    }
  );
}

// Save Fee to Cloud
export async function saveFeeToCloud(fee: StudentFee): Promise<void> {
  try {
    const clean = sanitizeForFirestore(fee);
    await setDoc(doc(db, COLLECTIONS.FEES, fee.id), clean, { merge: true });
  } catch (err) {
    console.error('Error saving fee to Firestore:', err);
  }
}

// Delete Fee from Cloud
export async function deleteFeeFromCloud(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.FEES, id));
  } catch (err) {
    console.error('Error deleting fee from Firestore:', err);
  }
}

// Subscribe to School Expenses
export function subscribeToExpenses(
  callback: (expenses: SchoolExpense[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.EXPENSES),
    (snap) => {
      const list: SchoolExpense[] = [];
      snap.forEach((d) => list.push(d.data() as SchoolExpense));
      list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      callback(list);
    },
    (err) => {
      console.warn('Expenses Firestore subscription error:', err);
    }
  );
}

// Save Expense to Cloud
export async function saveExpenseToCloud(expense: SchoolExpense): Promise<void> {
  try {
    const clean = sanitizeForFirestore(expense);
    await setDoc(doc(db, COLLECTIONS.EXPENSES, expense.id), clean, { merge: true });
  } catch (err) {
    console.error('Error saving expense to Firestore:', err);
  }
}

// Delete Expense from Cloud
export async function deleteExpenseFromCloud(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
  } catch (err) {
    console.error('Error deleting expense from Firestore:', err);
  }
}

// Subscribe to Bank Transactions
export function subscribeToBankTransactions(
  callback: (txs: BankTransaction[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.BANK),
    (snap) => {
      const list: BankTransaction[] = [];
      snap.forEach((d) => list.push(d.data() as BankTransaction));
      list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      callback(list);
    },
    (err) => {
      console.warn('Bank Firestore subscription error:', err);
    }
  );
}

// Save Bank Transaction to Cloud
export async function saveBankTxToCloud(tx: BankTransaction): Promise<void> {
  try {
    const clean = sanitizeForFirestore(tx);
    await setDoc(doc(db, COLLECTIONS.BANK, tx.id), clean, { merge: true });
  } catch (err) {
    console.error('Error saving bank transaction to Firestore:', err);
  }
}

// Delete Bank Transaction from Cloud
export async function deleteBankTxFromCloud(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BANK, id));
  } catch (err) {
    console.error('Error deleting bank transaction from Firestore:', err);
  }
}
