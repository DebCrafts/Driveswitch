export type FileType = 'PDF' | 'IMG' | 'DOC' | 'XLS' | 'VID' | 'ZIP' | 'AUD';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  color: string;
  storageLimitBytes: number; // 15 GB
  storageUsedBytes: number;
  connectedAt: string;
  isLive?: boolean;
}

export interface DriveFile {
  id: string;
  accountId: string;
  name: string;
  type: FileType;
  sizeBytes: number;
  updatedAt: string;
  shared?: boolean;
}

export type ActiveView = 'all' | string; // 'all' or specific accountId

export type MainSection = 'drive' | 'profile';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface UserDataStore {
  accounts: ConnectedAccount[];
  files: DriveFile[];
}
