import React, { useRef, useEffect } from 'react';
import { ConnectedAccount, ThemeMode } from '../types';
import { Search, Sun, Moon, Unlink, X, Monitor, RefreshCw } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  selectedAccount?: ConnectedAccount | null;
  onDisconnectClick?: () => void;
  onSyncClick?: () => void;
  isSyncing?: boolean;
  isAllAccounts: boolean;
  isProfileSection: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  selectedAccount,
  onDisconnectClick,
  onSyncClick,
  isSyncing,
  isAllAccounts,
  isProfileSection,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 border-b border-[#d4ded0] dark:border-[#233a2c] bg-[#fafbf8] dark:bg-[#16251c] px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 transition-colors">
      {/* Left Context / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {isProfileSection ? (
          <div>
            <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Account Profile
            </span>
          </div>
        ) : isAllAccounts ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-serif text-lg font-bold text-slate-900 dark:text-white truncate">
              All Drives
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-sans">
              · Combined storage view
            </span>
          </div>
        ) : selectedAccount ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: selectedAccount.color }}
              className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white/50"
            />
            <div className="min-w-0">
              <span className="font-serif text-lg font-bold text-slate-900 dark:text-white truncate block">
                {selectedAccount.displayName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate hidden sm:block">
                {selectedAccount.email}
              </span>
            </div>
          </div>
        ) : (
          <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Drive Manager
          </span>
        )}
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Search input (visible only when not on profile) */}
        {!isProfileSection && (
          <div className="relative w-36 sm:w-56 md:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files (press /)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-lg bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4a7c4a] transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white/70 dark:bg-[#1a2d21] px-1.5 py-0.5 rounded border border-[#d4ded0] dark:border-[#233a2c] font-mono pointer-events-none">
                /
              </kbd>
            )}
          </div>
        )}

        {/* Sync Button for Live Google Drive */}
        {onSyncClick && (
          <button
            type="button"
            disabled={isSyncing}
            onClick={onSyncClick}
            className="py-1.5 px-2.5 rounded-lg border border-[#4a7c4a]/40 bg-[#4a7c4a]/10 hover:bg-[#4a7c4a]/20 text-[#2d5c2d] dark:text-[#a3e29f] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            title="Sync latest files and quota from Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Drive'}</span>
          </button>
        )}

        {/* Disconnect Button (visible ONLY when a single account is selected) */}
        {selectedAccount && !isAllAccounts && !isProfileSection && onDisconnectClick && (
          <button
            type="button"
            onClick={onDisconnectClick}
            className="py-1.5 px-3 rounded-lg border border-[#b5523f]/30 hover:border-[#b5523f]/60 bg-[#b5523f]/10 hover:bg-[#b5523f]/20 text-[#b5523f] dark:text-[#f87171] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title={`Disconnect ${selectedAccount.displayName}`}
          >
            <Unlink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-[#d4ded0] dark:border-[#233a2c] bg-[#eef2ea] dark:bg-[#0f1a14] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={`Theme: ${theme}. Click to switch theme.`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-[#7fb27a]" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-[#d97706]" />
          ) : (
            <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}
        </button>
      </div>
    </header>
  );
};
