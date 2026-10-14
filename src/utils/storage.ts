import { User, UserDataStore, ThemeMode } from '../types';
import { createInitialDemoData } from './seedData';

const USERS_KEY = 'driveswitch_users';
const SESSION_KEY = 'driveswitch_current_user_id';
const DATA_KEY_PREFIX = 'driveswitch_data_';
const THEME_KEY = 'driveswitch_theme';

export function getAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read users from localStorage', err);
    return [];
  }
}

export function saveUser(user: User): void {
  try {
    const users = getAllUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user to localStorage', err);
  }
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  try {
    const users = getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return null;
    const updated = { ...target, ...updates };
    saveUser(updated);
    return updated;
  } catch (err) {
    console.error('Failed to update user', err);
    return null;
  }
}

export function getUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
}

export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function getCurrentSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch (err) {
    console.error('Failed to read session from localStorage', err);
    return null;
  }
}

export function setCurrentSessionUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(SESSION_KEY, userId);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to save session to localStorage', err);
  }
}

export function getUserData(userId: string, userEmail: string): UserDataStore {
  try {
    const raw = localStorage.getItem(`${DATA_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as UserDataStore;
      if (Array.isArray(parsed.accounts) && Array.isArray(parsed.files)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read user data from localStorage', err);
  }

  // Pre-seed with demo data for new or empty user
  const initial = createInitialDemoData(userId, userEmail);
  saveUserData(userId, initial);
  return initial;
}

export function saveUserData(userId: string, data: UserDataStore): void {
  try {
    localStorage.setItem(`${DATA_KEY_PREFIX}${userId}`, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write user data to localStorage', err);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch {
    // Ignore error
  }
  return 'system';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore error
  }
}
