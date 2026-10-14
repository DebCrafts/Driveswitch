import React, { useState } from 'react';
import { User, ConnectedAccount, DriveFile } from '../types';
import { formatBytes, formatDate } from '../utils/seedData';
import {
  User as UserIcon,
  HardDrive,
  Layers,
  FileText,
  LogOut,
  Save,
  Check,
  Calendar,
  Mail,
  Shield,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  accounts: ConnectedAccount[];
  files: DriveFile[];
  onUpdateUserName: (newName: string) => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  accounts,
  files,
  onUpdateUserName,
  onSignOut,
}) => {
  const [displayName, setDisplayName] = useState(user.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalLimitBytes = accounts.reduce((acc, a) => acc + a.storageLimitBytes, 0);
  const totalUsedBytes = accounts.reduce((acc, a) => acc + a.storageUsedBytes, 0);
  const totalFreeBytes = Math.max(0, totalLimitBytes - totalUsedBytes);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      onUpdateUserName(displayName.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Card Header */}
      <div className="bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl p-6 sm:p-8 border border-[#d4ded0] dark:border-[#233a2c] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#e2ede0] dark:border-[#233a2c]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1f3a2d] dark:bg-[#4a7c4a] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase() || <UserIcon className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="py-2 px-4 rounded-xl border border-[#b5523f]/30 hover:bg-[#b5523f]/10 text-[#b5523f] dark:text-[#f87171] text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Aggregate Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c]">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-[#4a7c4a]" />
              Drives Connected
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {accounts.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c]">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#2d7a78]" />
              Files Tracked
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {files.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c]">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-[#a05a42]" />
              Total Storage Used
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatBytes(totalUsedBytes)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c]">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-[#4a7c4a]" />
              Total Free Space
            </span>
            <span className="text-xl font-bold font-mono text-[#2d5c2d] dark:text-[#7fb27a] tabular-nums">
              {formatBytes(totalFreeBytes)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl p-6 sm:p-8 border border-[#d4ded0] dark:border-[#233a2c] shadow-xs">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
          Profile Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Update your public display name across the Driveswitch workspace.
        </p>

        <form onSubmit={handleSave} className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="display-name-input">
              Display Name
            </label>
            <input
              id="display-name-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#d4ded0] dark:border-[#233a2c] bg-white dark:bg-[#0f1a14] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4a7c4a]"
              placeholder="Your full name"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-lg bg-[#1f3a2d] dark:bg-[#4a7c4a] hover:bg-[#162a20] dark:hover:bg-[#3d693d] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-[#7fb27a]" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
            </button>
            {savedSuccess && (
              <span className="text-xs text-[#2d5c2d] dark:text-[#7fb27a] font-medium animate-in fade-in">
                Display name updated successfully.
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Global Publishing Guide */}
      <div className="bg-[#1f3a2d] text-white rounded-2xl p-6 sm:p-8 border border-[#2a4d3c] relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#4a7c4a] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Make Driveswitch Work Globally for Everyone
            </h3>
            <p className="text-xs text-[#a4c7ae]">
              How to transition from Testing mode to Public / In Production
            </p>
          </div>
        </div>

        <p className="text-xs text-[#c6dbcd] leading-relaxed mb-4 max-w-2xl">
          By default, Google Cloud OAuth keeps apps in &ldquo;Testing&rdquo; mode (where only developer-approved test accounts can log in). To let <strong>anyone with any Google Drive account</strong> sign in:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs mb-5">
          <div className="p-4 rounded-xl bg-[#284838] border border-[#355b47] space-y-1.5">
            <span className="font-bold text-white block">Step 1: Open Consent Screen</span>
            <p className="text-[#a4c7ae] text-[11px] leading-relaxed">
              Open your project in Google Cloud Console under APIs &amp; Services &rarr; OAuth consent screen.
            </p>
            <div className="pt-1">
              <a
                href="https://console.cloud.google.com/apis/credentials/consent?project=alien-iterator-447511-h3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#7fb27a] hover:underline font-semibold"
              >
                <span>Go to Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#284838] border border-[#355b47] space-y-1.5">
            <span className="font-bold text-white block">Step 2: Click &ldquo;Publish App&rdquo;</span>
            <p className="text-[#a4c7ae] text-[11px] leading-relaxed">
              Under <strong>Publishing status</strong>, click the <strong>&ldquo;PUBLISH APP&rdquo;</strong> button. This switches the status to <strong>&ldquo;In Production&rdquo;</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#284838] border border-[#355b47] space-y-1.5">
            <span className="font-bold text-white block">Step 3: Verification &amp; Access</span>
            <p className="text-[#a4c7ae] text-[11px] leading-relaxed">
              Once published, anyone can connect! Google displays an &ldquo;Unverified app&rdquo; screen where users click <strong>Advanced &rarr; Go to Driveswitch</strong> until Google review completes.
            </p>
          </div>
        </div>

        {/* Legal URLs to paste into Google Cloud Console */}
        <div className="p-4 rounded-xl bg-[#162a20] border border-[#2d523e] text-xs space-y-2">
          <span className="font-bold text-white block">Google Cloud OAuth Links to Enter:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#9bbca5] block font-mono">Application Home Page:</span>
              <code className="text-[#7fb27a] font-mono break-all text-[10px]">
                https://ais-pre-yv26eqku4pfimfzypeznrg-242104816998.asia-southeast1.run.app
              </code>
            </div>
            <div>
              <span className="text-[#9bbca5] block font-mono">Privacy Policy URL:</span>
              <code className="text-[#7fb27a] font-mono break-all text-[10px]">
                https://ais-pre-yv26eqku4pfimfzypeznrg-242104816998.asia-southeast1.run.app#privacy
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
