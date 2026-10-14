import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  ConnectedAccount,
  DriveFile,
  ActiveView,
  MainSection,
  ThemeMode,
  ToastMessage,
  FileType,
} from './types';
import {
  getCurrentSessionUserId,
  setCurrentSessionUserId,
  getUserById,
  getUserData,
  saveUserData,
  updateUser,
  getStoredTheme,
  setStoredTheme,
} from './utils/storage';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StorageHero } from './components/StorageHero';
import { FileList } from './components/FileList';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DisconnectConfirmModal } from './components/DisconnectConfirmModal';
import { ProfileView } from './components/ProfileView';
import { LegalModal } from './components/LegalModal';
import { ToastContainer } from './components/Toast';
import {
  initAuth,
  logout,
  trashLiveDriveFile,
  getCachedToken,
  fetchDriveStorageQuota,
  fetchLiveDriveFilesPaginated,
} from './services/googleDriveService';

export default function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('all');
  const [mainSection, setMainSection] = useState<MainSection>('drive');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | FileType>('ALL');

  // Selection & Batch Action State
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    isBatch: boolean;
    singleFile?: DriveFile;
  }>({ isOpen: false, isBatch: false });
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Hash navigation for Google verification compliance (#privacy, #terms)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy') {
        setLegalModalType('privacy');
      } else if (hash === '#terms') {
        setLegalModalType('terms');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // 1. Initial Session Load & Firebase Auth sync
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser) => {
        const userId = firebaseUser.uid;
        let user = getUserById(userId);
        if (!user) {
          user = {
            id: userId,
            name: firebaseUser.displayName || 'Google User',
            email: (firebaseUser.email || '').toLowerCase(),
            passwordHash: 'google_oauth_session',
            createdAt: new Date().toISOString(),
          };
        }
        setCurrentUser(user);
        const data = getUserData(user.id, user.email);
        setAccounts(data.accounts);
        setFiles(data.files);
        setIsLoadingSession(false);
      },
      () => {
        const userId = getCurrentSessionUserId();
        if (userId) {
          const user = getUserById(userId);
          if (user) {
            setCurrentUser(user);
            const data = getUserData(user.id, user.email);
            setAccounts(data.accounts);
            setFiles(data.files);
          }
        }
        setIsLoadingSession(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else {
      // System mode
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    addToast(`Theme switched to ${nextTheme}`, 'info');
  };

  // Reset file selection when active view changes
  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    setSelectedFileIds(new Set());
    setSearchQuery('');
    setSelectedTypeFilter('ALL');
  };

  const handleSelectSection = (section: MainSection) => {
    setMainSection(section);
    setSelectedFileIds(new Set());
  };

  // Save changes to current user data
  const persistChanges = (newAccounts: ConnectedAccount[], newFiles: DriveFile[]) => {
    if (!currentUser) return;
    setAccounts(newAccounts);
    setFiles(newFiles);
    saveUserData(currentUser.id, { accounts: newAccounts, files: newFiles });
  };

  // Live Google Auth Success Handler
  const handleGoogleLoginSuccess = (
    user: User,
    primaryAccount: ConnectedAccount,
    liveFiles: DriveFile[]
  ) => {
    setCurrentUser(user);
    const existingData = getUserData(user.id, user.email);
    // Replace any pre-existing simulated account with the same email
    const filteredAccounts = existingData.accounts.filter(
      (a) => a.email.toLowerCase() !== primaryAccount.email.toLowerCase()
    );
    const filteredFiles = existingData.files.filter(
      (f) => f.accountId !== primaryAccount.id
    );

    const nextAccounts = [primaryAccount, ...filteredAccounts];
    const nextFiles = [...liveFiles, ...filteredFiles];

    persistChanges(nextAccounts, nextFiles);
    setActiveView(primaryAccount.id);
    setMainSection('drive');
    setSelectedFileIds(new Set());
    addToast(`Signed in as ${primaryAccount.displayName} (${liveFiles.length} files synced from Drive)`);
  };

  // Demo Login Handler
  const handleDemoLoginSuccess = (user: User) => {
    setCurrentUser(user);
    const data = getUserData(user.id, user.email);
    setAccounts(data.accounts);
    setFiles(data.files);
    setActiveView('all');
    setMainSection('drive');
    setSelectedFileIds(new Set());
    addToast(`Loaded demo session (${user.name})`);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error', err);
    }
    setCurrentSessionUserId(null);
    setCurrentUser(null);
    setAccounts([]);
    setFiles([]);
    setActiveView('all');
    setMainSection('drive');
    addToast('Signed out of Driveswitch', 'info');
  };

  const handleUpdateUserName = (newName: string) => {
    if (!currentUser) return;
    const updated = updateUser(currentUser.id, { name: newName });
    if (updated) {
      setCurrentUser(updated);
      addToast('Profile name updated');
    }
  };

  // Active Context Accounts & Files
  const selectedAccount = useMemo(() => {
    if (activeView === 'all') return null;
    return accounts.find((a) => a.id === activeView) || null;
  }, [accounts, activeView]);

  const contextFiles = useMemo(() => {
    if (activeView === 'all') {
      return files;
    }
    return files.filter((f) => f.accountId === activeView);
  }, [files, activeView]);

  // Selection Handlers
  const handleToggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const handleSelectAllVisible = (fileIds: string[]) => {
    setSelectedFileIds(new Set(fileIds));
  };

  const handleClearSelection = () => {
    setSelectedFileIds(new Set());
  };

  // Account Connect Handler
  const handleAccountConnected = (newAccount: ConnectedAccount, newFiles: DriveFile[]) => {
    const nextAccounts = [...accounts, newAccount];
    const nextFiles = [...files, ...newFiles];
    persistChanges(nextAccounts, nextFiles);
    setActiveView(newAccount.id);
    addToast(`Connected ${newAccount.displayName} (${newAccount.email}) with ${newFiles.length} files`);
  };

  // Account Disconnect Handler
  const handleConfirmDisconnect = () => {
    if (!selectedAccount) return;
    const removedId = selectedAccount.id;
    const removedName = selectedAccount.displayName;
    const nextAccounts = accounts.filter((a) => a.id !== removedId);
    const nextFiles = files.filter((f) => f.accountId !== removedId);
    persistChanges(nextAccounts, nextFiles);
    setActiveView('all');
    setSelectedFileIds(new Set());
    addToast(`Disconnected ${removedName}`, 'info');
  };

  // Sync / Refresh Google Drive Data
  const handleSyncDrive = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const targetAccounts = selectedAccount
      ? selectedAccount.isLive
        ? [selectedAccount]
        : []
      : accounts.filter((a) => a.isLive);

    if (targetAccounts.length === 0) {
      addToast('No live Google accounts to sync in this view', 'info');
      setIsSyncing(false);
      return;
    }

    try {
      let updatedAccounts = [...accounts];
      let updatedFiles = [...files];
      let totalFetchedFiles = 0;

      for (const acc of targetAccounts) {
        const token = getCachedToken(acc.email);
        if (!token) {
          addToast(`Access token needed for ${acc.email}. Reconnect via + Connect account.`, 'error');
          continue;
        }

        const { storageQuota, driveUser } = await fetchDriveStorageQuota(token);
        const quotaUsage = storageQuota.usage ? parseInt(storageQuota.usage, 10) : acc.storageUsedBytes;
        const quotaLimit = storageQuota.limit ? parseInt(storageQuota.limit, 10) : acc.storageLimitBytes;

        const freshFiles = await fetchLiveDriveFilesPaginated(token, acc.id);
        totalFetchedFiles += freshFiles.length;

        updatedAccounts = updatedAccounts.map((a) =>
          a.id === acc.id
            ? {
                ...a,
                storageUsedBytes: quotaUsage,
                storageLimitBytes: quotaLimit,
                displayName: driveUser?.displayName || a.displayName,
              }
            : a
        );

        updatedFiles = [
          ...updatedFiles.filter((f) => f.accountId !== acc.id),
          ...freshFiles,
        ];
      }

      persistChanges(updatedAccounts, updatedFiles);
      addToast(`Synced latest data from Google Drive (${totalFetchedFiles} files indexed)`);
    } catch (err: any) {
      console.error('Sync failed', err);
      addToast(err?.message || 'Sync failed. Please check connection.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete Actions
  const handleTriggerSingleDelete = (file: DriveFile) => {
    setDeleteModalState({
      isOpen: true,
      isBatch: false,
      singleFile: file,
    });
  };

  const handleTriggerBatchDelete = () => {
    if (selectedFileIds.size === 0) return;
    setDeleteModalState({
      isOpen: true,
      isBatch: true,
    });
  };

  const handleConfirmDelete = () => {
    let filesToDelete: DriveFile[] = [];

    if (deleteModalState.isBatch) {
      filesToDelete = files.filter((f) => selectedFileIds.has(f.id));
    } else if (deleteModalState.singleFile) {
      filesToDelete = [deleteModalState.singleFile];
    }

    if (filesToDelete.length === 0) return;

    const toDeleteIds = new Set(filesToDelete.map((f) => f.id));
    const nextFiles = files.filter((f) => !toDeleteIds.has(f.id));

    // Calculate reclaimed bytes per affected account
    const reclaimedByAccount: Record<string, number> = {};
    filesToDelete.forEach((f) => {
      reclaimedByAccount[f.accountId] = (reclaimedByAccount[f.accountId] || 0) + f.sizeBytes;
    });

    const nextAccounts = accounts.map((acc) => {
      const reclaimed = reclaimedByAccount[acc.id] || 0;
      if (reclaimed > 0) {
        return {
          ...acc,
          storageUsedBytes: Math.max(0, acc.storageUsedBytes - reclaimed),
        };
      }
      return acc;
    });

    // Execute real Google Drive trash calls for live accounts
    filesToDelete.forEach(async (f) => {
      const account = accounts.find((a) => a.id === f.accountId);
      if (account?.isLive) {
        const token = getCachedToken(account.email);
        if (token) {
          try {
            await trashLiveDriveFile(token, f.id);
          } catch (err) {
            console.warn(`Could not trash file ${f.id} on Google Drive`, err);
          }
        }
      }
    });

    persistChanges(nextAccounts, nextFiles);
    setSelectedFileIds(new Set());

    const count = filesToDelete.length;
    addToast(`${count} ${count === 1 ? 'file' : 'files'} moved to Drive Trash`);
  };

  const handleSimulateDownload = (file: DriveFile) => {
    addToast(`Downloading ${file.name}...`, 'info');
  };

  // Loading Screen
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#eef2ea] dark:bg-[#0f1a14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#4a7c4a] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in -> Show Google OAuth Auth Screen
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onGoogleLoginSuccess={handleGoogleLoginSuccess}
          onDemoLoginSuccess={handleDemoLoginSuccess}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#eef2ea] dark:bg-[#0f1a14] text-slate-800 dark:text-slate-100 transition-colors">
      {/* 1. Left Sidebar */}
      <Sidebar
        accounts={accounts}
        activeView={activeView}
        mainSection={mainSection}
        user={currentUser}
        onSelectView={handleSelectView}
        onSelectSection={handleSelectSection}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          selectedAccount={selectedAccount}
          onDisconnectClick={() => setIsDisconnectModalOpen(true)}
          onSyncClick={handleSyncDrive}
          isSyncing={isSyncing}
          isAllAccounts={activeView === 'all'}
          isProfileSection={mainSection === 'profile'}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[960px] mx-auto">
            {mainSection === 'profile' ? (
              <ProfileView
                user={currentUser}
                accounts={accounts}
                files={files}
                onUpdateUserName={handleUpdateUserName}
                onSignOut={handleSignOut}
              />
            ) : (
              <>
                {/* Storage Quota Overview Hero */}
                <StorageHero
                  accounts={accounts}
                  selectedAccount={selectedAccount}
                  isAllAccounts={activeView === 'all'}
                />

                {/* File List Component */}
                <FileList
                  files={contextFiles}
                  accounts={accounts}
                  selectedFileIds={selectedFileIds}
                  onToggleSelectFile={handleToggleSelectFile}
                  onSelectAllVisible={handleSelectAllVisible}
                  onClearSelection={handleClearSelection}
                  onDeleteSingle={handleTriggerSingleDelete}
                  onDeleteBatch={handleTriggerBatchDelete}
                  onPreviewFile={(file) => setPreviewFile(file)}
                  searchQuery={searchQuery}
                  selectedTypeFilter={selectedTypeFilter}
                  onSelectTypeFilter={setSelectedTypeFilter}
                  isAllAccounts={activeView === 'all'}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        userId={currentUser.id}
        existingAccounts={accounts}
        onAccountConnected={handleAccountConnected}
        onErrorToast={(msg) => addToast(msg, 'error')}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        account={
          previewFile ? accounts.find((a) => a.id === previewFile.accountId) : null
        }
        onClose={() => setPreviewFile(null)}
        onDelete={handleTriggerSingleDelete}
        onDownload={handleSimulateDownload}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, isBatch: false, singleFile: undefined })
        }
        onConfirm={handleConfirmDelete}
        count={
          deleteModalState.isBatch
            ? selectedFileIds.size
            : deleteModalState.singleFile
            ? 1
            : 0
        }
        singleFileName={deleteModalState.singleFile?.name}
        totalBytesReclaimed={
          deleteModalState.isBatch
            ? files
                .filter((f) => selectedFileIds.has(f.id))
                .reduce((acc, f) => acc + f.sizeBytes, 0)
            : deleteModalState.singleFile?.sizeBytes || 0
        }
      />

      {/* Disconnect Account Confirmation Modal */}
      <DisconnectConfirmModal
        isOpen={isDisconnectModalOpen}
        account={selectedAccount}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
      />

      {/* Global Legal Modal (Privacy & Terms) */}
      <LegalModal
        type={legalModalType}
        onClose={() => {
          setLegalModalType(null);
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />

      {/* Non-intrusive Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
