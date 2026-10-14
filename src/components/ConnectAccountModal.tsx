import React, { useState } from 'react';
import { ConnectedAccount, DriveFile } from '../types';
import { generateFilesForAccount, ACCOUNT_COLORS, FIFTEEN_GB } from '../utils/seedData';
import { connectAdditionalGoogleAccount } from '../services/googleDriveService';
import { X, Plus, ShieldCheck, Mail, AlertCircle, Loader2, Globe } from 'lucide-react';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  existingAccounts: ConnectedAccount[];
  onAccountConnected: (newAccount: ConnectedAccount, newFiles: DriveFile[]) => void;
  onErrorToast?: (message: string) => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  isOpen,
  onClose,
  userId,
  existingAccounts,
  onAccountConnected,
  onErrorToast,
}) => {
  const [tab, setTab] = useState<'live' | 'manual'>('live');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    ACCOUNT_COLORS[existingAccounts.length % ACCOUNT_COLORS.length]
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  if (!isOpen) return null;

  // Live Google Account Connection via Google OAuth
  const handleConnectLive = async () => {
    setIsLoadingLive(true);
    setError(null);
    try {
      const { account, files } = await connectAdditionalGoogleAccount(existingAccounts.length);

      // Check if already connected
      const isDuplicate = existingAccounts.some(
        (a) => a.email.toLowerCase().trim() === account.email.toLowerCase().trim()
      );

      if (isDuplicate) {
        setError(`The Google account ${account.email} is already connected to Driveswitch.`);
        return;
      }

      account.isLive = true;
      account.userId = userId;
      onAccountConnected(account, files);
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User closed or dismissed popup, no error
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        const msg = 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
        setError(msg);
        onErrorToast?.(msg);
        return;
      }
      const msg = err?.message || 'Failed to connect Google account. Please try again.';
      setError(msg);
      onErrorToast?.(msg);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Simulated Manual Account Connection
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter a Gmail or Google Workspace email address.');
      return;
    }

    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.includes('@googlemail.com')) {
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        setError('Please enter a valid Gmail address (e.g. name@gmail.com).');
        return;
      }
    }

    const isDuplicate = existingAccounts.some(
      (a) => a.email.toLowerCase().trim() === cleanEmail
    );
    if (isDuplicate) {
      setError('This Google account is already connected to Driveswitch.');
      return;
    }

    const defaultName = displayName.trim() || cleanEmail.split('@')[0];
    const newAccountId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const generatedFiles = generateFilesForAccount(newAccountId, cleanEmail);
    const totalUsedBytes = generatedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

    const newAccount: ConnectedAccount = {
      id: newAccountId,
      userId,
      email: cleanEmail,
      displayName: defaultName,
      color: selectedColor,
      storageLimitBytes: FIFTEEN_GB,
      storageUsedBytes: totalUsedBytes,
      connectedAt: new Date().toISOString(),
      isLive: false,
    };

    onAccountConnected(newAccount, generatedFiles);
    setEmail('');
    setDisplayName('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl border border-[#d4ded0] dark:border-[#233a2c] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4a7c4a]/15 text-[#2d5c2d] dark:text-[#7fb27a] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Connect Google Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link real Google Drive storage or simulate a test drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center bg-[#eef2ea] dark:bg-[#0f1a14] p-1 rounded-xl border border-[#d8e2d4] dark:border-[#233a2c]">
            <button
              type="button"
              onClick={() => {
                setTab('live');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'live'
                  ? 'bg-white dark:bg-[#1f3a2d] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#4a7c4a] dark:text-[#7fb27a]" />
              <span>Live Google Drive (Real)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('manual');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'manual'
                  ? 'bg-white dark:bg-[#1f3a2d] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Demo Account (Simulated)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-[#b5523f]/10 border border-[#b5523f]/30 text-xs text-[#b5523f] dark:text-[#f87171] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Live Google Drive OAuth */}
        {tab === 'live' ? (
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#4a7c4a]" />
                <span>Google OAuth 2.0 Integration Active</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click below to select any of your Google / Gmail accounts. Driveswitch will fetch your real storage quota (<code className="font-mono text-[11px]">about.get</code>) and live files with user permission.
              </p>
            </div>

            {/* Official Google Sign-in button format */}
            <button
              type="button"
              disabled={isLoadingLive}
              onClick={handleConnectLive}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a2d21] hover:bg-slate-50 dark:hover:bg-[#233a2c] text-slate-800 dark:text-white text-sm font-semibold flex items-center justify-center gap-3 shadow-xs transition-all disabled:opacity-50"
            >
              {isLoadingLive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#4a7c4a]" />
                  <span>Connecting to Google Drive...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Connect with Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
              You can connect multiple Google accounts one by one to monitor all your Drives in one place.
            </p>

            <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-amber-900 dark:text-amber-200 block mb-1">
                Notice for new Google accounts:
              </span>
              Google requires non-developer accounts to be added under{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials/consent?project=alien-iterator-447511-h3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 dark:text-amber-400 underline font-semibold"
              >
                Google Cloud Test Users
              </a>{' '}
              while the app is in Testing mode. Or switch to the &ldquo;Demo Account&rdquo; tab to simulate instantly.
            </div>
          </div>
        ) : (
          /* Tab 2: Simulated Demo Account */
          <form onSubmit={handleManualSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="manual-gmail">
                Gmail Address
              </label>
              <input
                id="manual-gmail"
                type="email"
                placeholder="project.storage@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#d4ded0] dark:border-[#233a2c] bg-white dark:bg-[#0f1a14] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a7c4a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="manual-nickname">
                Nickname / Label
              </label>
              <input
                id="manual-nickname"
                type="text"
                placeholder="e.g. Photography Archive"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#d4ded0] dark:border-[#233a2c] bg-white dark:bg-[#0f1a14] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a7c4a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color Tag
              </label>
              <div className="flex items-center gap-3">
                {ACCOUNT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      selectedColor === color
                        ? 'scale-115 ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-[#16251c]'
                        : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#e2ede0] dark:border-[#233a2c]">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-lg border border-[#d4ded0] dark:border-[#233a2c] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2d21]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-lg bg-[#1f3a2d] dark:bg-[#4a7c4a] hover:bg-[#162a20] dark:hover:bg-[#3d693d] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Simulated Account</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
