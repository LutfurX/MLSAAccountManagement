import { AppUser } from '../types';

const STORAGE_KEYS = {
  USERS: 'mlsa_app_users_v1',
  CURRENT_USER: 'mlsa_current_user_v1',
};

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_admin_headmaster',
    username: 'admin',
    password: 'admin123',
    fullName: 'প্রধান শিক্ষক',
    role: 'admin',
    designation: 'প্রধান শিক্ষক / হিসাব নিয়ন্ত্রক',
    phone: '০১৭০০-০০০০০০',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_committee_member',
    username: 'committee',
    password: 'user123',
    fullName: 'ম্যানেজিং কমিটি সদস্য',
    role: 'user',
    designation: 'ম্যানেজিং কমিটি সদস্য / নিরীক্ষক',
    phone: '০১৮০০-০০০০০০',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const users = JSON.parse(raw);
    if (!Array.isArray(users) || users.length === 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return users;
  } catch (err) {
    console.error('Failed to load users:', err);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
}

export function setCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}

export function authenticateUser(username: string, password: string): { success: boolean; user?: AppUser; message?: string } {
  const users = loadUsers();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const found = users.find(
    (u) => u.username.toLowerCase() === cleanUsername
  );

  if (!found) {
    return { success: false, message: 'এই ইউজার নেইম দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' };
  }

  if (found.password !== cleanPassword) {
    return { success: false, message: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
  }

  setCurrentUser(found);
  return { success: true, user: found };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// Generate simple readable custom password for committee members
export function generateRandomPassword(length = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Suggest username from Bengali/English name
export function generateSuggestedUsername(name: string): string {
  if (!name.trim()) return `user${Math.floor(100 + Math.random() * 900)}`;
  const transliterated = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (transliterated.length >= 3) {
    return `${transliterated}${Math.floor(10 + Math.random() * 90)}`;
  }
  return `member_${Math.floor(100 + Math.random() * 900)}`;
}
