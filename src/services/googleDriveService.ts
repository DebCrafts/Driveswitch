import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { FileType, DriveFile, ConnectedAccount } from '../types';
import { FIFTEEN_GB, ACCOUNT_COLORS } from '../utils/seedData';

// Mandatory SCOPES array configured for Google Drive
export const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In-memory token storage (DO NOT store in localStorage or sessionStorage per security guidelines)
// Map: email (lowercase) -> OAuth Access Token
const tokenCache = new Map<string, string>();
let primaryAccessToken: string | null = null;
let isSigningIn = false;

export function setCachedToken(email: string, token: string): void {
  tokenCache.set(email.toLowerCase().trim(), token);
  if (!primaryAccessToken) {
    primaryAccessToken = token;
  }
}

export function getCachedToken(email: string): string | null {
  return tokenCache.get(email.toLowerCase().trim()) || primaryAccessToken || null;
}

/**
 * Initializes Firebase Auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      const email = user.email ? user.email.toLowerCase().trim() : '';
      const cached = tokenCache.get(email) || primaryAccessToken;
      if (onAuthSuccess) {
        onAuthSuccess(user, cached);
      }
    } else {
      primaryAccessToken = null;
      tokenCache.clear();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Primary Sign-In with Google using Firebase Auth & Google Drive scope.
 */
export async function googleSignIn(): Promise<{
  user: FirebaseUser;
  accessToken: string;
  account: ConnectedAccount;
  files: DriveFile[];
}> {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    SCOPES.forEach((s) => provider.addScope(s));
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Google did not return an access token. Please verify Drive permissions.');
    }

    const user = result.user;
    const email = (user.email || 'user@gmail.com').toLowerCase().trim();
    setCachedToken(email, accessToken);
    primaryAccessToken = accessToken;

    // Fetch live storage quota
    const { storageQuota, driveUser } = await fetchDriveStorageQuota(accessToken);

    const accountId = `live_${user.uid}`;
    const limitBytes = storageQuota.limit ? parseInt(storageQuota.limit, 10) : FIFTEEN_GB;
    const usedBytes = storageQuota.usage ? parseInt(storageQuota.usage, 10) : 0;
    const displayName = driveUser?.displayName || user.displayName || email.split('@')[0];

    const account: ConnectedAccount = {
      id: accountId,
      userId: user.uid,
      email,
      displayName,
      color: ACCOUNT_COLORS[0], // Moss
      storageLimitBytes: limitBytes,
      storageUsedBytes: usedBytes,
      connectedAt: new Date().toISOString(),
      isLive: true,
    };

    // Fetch real files with pagination
    const files = await fetchLiveDriveFilesPaginated(accessToken, accountId);

    return { user, accessToken, account, files };
  } finally {
    isSigningIn = false;
  }
}

/**
 * Connect an additional Google Account to link multiple Drives in one session.
 */
export async function connectAdditionalGoogleAccount(existingAccountsCount: number): Promise<{
  account: ConnectedAccount;
  files: DriveFile[];
  accessToken: string;
}> {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach((s) => provider.addScope(s));
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  if (!accessToken) {
    throw new Error('Google did not return an access token for this account.');
  }

  const user = result.user;
  const email = (user.email || 'account@gmail.com').toLowerCase().trim();
  setCachedToken(email, accessToken);

  // Fetch live quota
  const { storageQuota, driveUser } = await fetchDriveStorageQuota(accessToken);

  const accountId = `live_${user.uid}_${Date.now()}`;
  const limitBytes = storageQuota.limit ? parseInt(storageQuota.limit, 10) : FIFTEEN_GB;
  const usedBytes = storageQuota.usage ? parseInt(storageQuota.usage, 10) : 0;
  const displayName = driveUser?.displayName || user.displayName || email.split('@')[0];
  const color = ACCOUNT_COLORS[existingAccountsCount % ACCOUNT_COLORS.length];

  const account: ConnectedAccount = {
    id: accountId,
    userId: user.uid,
    email,
    displayName,
    color,
    storageLimitBytes: limitBytes,
    storageUsedBytes: usedBytes,
    connectedAt: new Date().toISOString(),
    isLive: true,
  };

  const files = await fetchLiveDriveFilesPaginated(accessToken, accountId);

  return { account, files, accessToken };
}

/**
 * Signs out from Firebase and purges cached in-memory access tokens.
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
  tokenCache.clear();
  primaryAccessToken = null;
}

/**
 * Fetches Google Drive storage quota using Drive API v3 about.get.
 */
export async function fetchDriveStorageQuota(accessToken: string): Promise<{
  storageQuota: {
    limit?: string;
    usage?: string;
    usageInDrive?: string;
    usageInDriveTrash?: string;
  };
  driveUser?: {
    displayName?: string;
    emailAddress?: string;
    photoLink?: string;
  };
}> {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/about?fields=storageQuota,user(displayName,emailAddress,photoLink)',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch Drive storage quota (${res.status})`
    );
  }

  const data = await res.json();
  return {
    storageQuota: data.storageQuota || {},
    driveUser: data.user || {},
  };
}

/**
 * Maps standard Google Drive MIME types to application FileType badges.
 */
export function mapMimeTypeToFileType(mimeType: string, filename: string): FileType {
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) return 'PDF';
  if (
    lowerMime.includes('image/') ||
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff|heic|raw)$/i.test(lowerName)
  ) return 'IMG';
  if (
    lowerMime.includes('video/') ||
    /\.(mp4|mov|avi|mkv|webm|m4v|flv|wmv)$/i.test(lowerName)
  ) return 'VID';
  if (
    lowerMime.includes('spreadsheet') ||
    lowerMime.includes('excel') ||
    /\.(xlsx?|csv|tsv|numbers|ods)$/i.test(lowerName)
  ) return 'XLS';
  if (
    lowerMime.includes('audio/') ||
    /\.(mp3|wav|flac|m4a|aac|ogg|wma)$/i.test(lowerName)
  ) return 'AUD';
  if (
    lowerMime.includes('zip') ||
    lowerMime.includes('tar') ||
    lowerMime.includes('compressed') ||
    /\.(zip|tar|gz|7z|rar|bz2)$/i.test(lowerName)
  ) return 'ZIP';
  if (
    lowerMime.includes('document') ||
    lowerMime.includes('word') ||
    lowerMime.includes('text/') ||
    /\.(docx?|txt|md|rtf|odt)$/i.test(lowerName)
  ) return 'DOC';

  return 'DOC';
}

/**
 * Fetches real files from user's Google Drive with FULL PAGINATION support.
 * Iterates through `nextPageToken` until all files are retrieved (up to 1,000 files).
 */
export async function fetchLiveDriveFilesPaginated(
  accessToken: string,
  accountId: string,
  maxPages = 10 // 10 pages * 100 files = up to 1,000 files
): Promise<DriveFile[]> {
  const allFiles: DriveFile[] = [];
  let pageToken: string | null = null;
  let pageCount = 0;

  const query = encodeURIComponent("trashed = false and mimeType != 'application/vnd.google-apps.folder'");

  do {
    pageCount++;
    let url = `https://www.googleapis.com/drive/v3/files?pageSize=100&fields=nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,shared)&q=${query}&orderBy=modifiedTime desc`;

    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `Failed to fetch Drive files on page ${pageCount} (${res.status})`
      );
    }

    const data = await res.json();
    const rawFiles: any[] = data.files || [];

    for (const f of rawFiles) {
      // Default to 1MB estimate for Google Docs / Sheets where Google doesn't return raw byte size
      const sizeBytes = f.size ? parseInt(f.size, 10) : 1024 * 1024;
      const type = mapMimeTypeToFileType(f.mimeType || '', f.name || '');

      allFiles.push({
        id: f.id || `live_f_${allFiles.length}`,
        accountId,
        name: f.name || 'Untitled File',
        type,
        sizeBytes,
        updatedAt: f.modifiedTime || new Date().toISOString(),
        shared: Boolean(f.shared),
      });
    }

    pageToken = data.nextPageToken || null;
  } while (pageToken && pageCount < maxPages);

  return allFiles;
}

/**
 * Trashes a file on Google Drive (recoverable for 30 days) using files.update.
 */
export async function trashLiveDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to trash file on Google Drive (${res.status})`);
  }
}
