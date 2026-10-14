import React from 'react';
import { ConnectedAccount } from '../types';
import { formatBytes } from '../utils/seedData';
import { HardDrive, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface StorageHeroProps {
  accounts: ConnectedAccount[];
  selectedAccount?: ConnectedAccount | null;
  isAllAccounts: boolean;
}

export const StorageHero: React.FC<StorageHeroProps> = ({
  accounts,
  selectedAccount,
  isAllAccounts,
}) => {
  if (isAllAccounts) {
    const totalLimitBytes = accounts.reduce((acc, a) => acc + a.storageLimitBytes, 0);
    const totalUsedBytes = accounts.reduce((acc, a) => acc + a.storageUsedBytes, 0);
    const freeBytes = Math.max(0, totalLimitBytes - totalUsedBytes);
    const usedPercent = totalLimitBytes > 0 ? (totalUsedBytes / totalLimitBytes) * 100 : 0;

    return (
      <div className="bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl p-5 sm:p-6 border border-[#d4ded0] dark:border-[#233a2c] shadow-xs mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4a7c4a]/10 dark:bg-[#4a7c4a]/20 text-[#2d5c2d] dark:text-[#7fb27a] flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Combined Google Drive Storage
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aggregated capacity across {accounts.length} connected Google {accounts.length === 1 ? 'account' : 'accounts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start sm:self-auto">
            <div>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                Used
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatBytes(totalUsedBytes)}
              </span>
            </div>
            <div className="w-px h-8 bg-[#d4ded0] dark:bg-[#233a2c]" />
            <div>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                Free Space
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-[#2d5c2d] dark:text-[#7fb27a] tabular-nums">
                {formatBytes(freeBytes)}
              </span>
            </div>
            <div className="w-px h-8 bg-[#d4ded0] dark:bg-[#233a2c]" />
            <div>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                Total Pool
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                {formatBytes(totalLimitBytes)}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Account Segmented Storage Bar */}
        <div className="w-full bg-[#e6ede4] dark:bg-[#0f1a14] rounded-full h-3 overflow-hidden flex shadow-inner">
          {accounts.length === 0 ? (
            <div className="w-full bg-slate-200 dark:bg-slate-800" />
          ) : (
            accounts.map((acc) => {
              const segPct = totalLimitBytes > 0 ? (acc.storageUsedBytes / totalLimitBytes) * 100 : 0;
              return (
                <div
                  key={acc.id}
                  style={{ width: `${segPct}%`, backgroundColor: acc.color }}
                  className="h-full transition-all duration-300 hover:opacity-90 relative group"
                  title={`${acc.displayName}: ${formatBytes(acc.storageUsedBytes)} (${segPct.toFixed(1)}% of total)`}
                />
              );
            })
          )}
        </div>

        {/* Legend / Accounts breakdown tags */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-[#eef2ea] dark:border-[#1e3428] text-xs">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center gap-2">
              <span
                style={{ backgroundColor: acc.color }}
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{acc.displayName}</span>
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] tabular-nums">
                ({formatBytes(acc.storageUsedBytes)})
              </span>
            </div>
          ))}
          {accounts.length === 0 && (
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              No accounts connected. Click "+ Connect account" in the sidebar to add your first drive.
            </span>
          )}
        </div>
      </div>
    );
  }

  // Single Account View
  if (!selectedAccount) return null;

  const usedPercent = Math.min(
    100,
    (selectedAccount.storageUsedBytes / selectedAccount.storageLimitBytes) * 100
  );
  const freeBytes = Math.max(0, selectedAccount.storageLimitBytes - selectedAccount.storageUsedBytes);
  const isHighStorage = usedPercent > 80;

  return (
    <div className="bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl p-5 sm:p-6 border border-[#d4ded0] dark:border-[#233a2c] shadow-xs mb-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: selectedAccount.color }}
            className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs"
          >
            {selectedAccount.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{selectedAccount.displayName}</span>
              {selectedAccount.isLive && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#7fb27a]/20 text-[#2d5c2d] dark:text-[#a3e29f] border border-[#7fb27a]/30">
                  Live Drive
                </span>
              )}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                ({selectedAccount.email})
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedAccount.isLive
                ? 'Synced live via Google Drive REST API'
                : 'Standard Google account allocation (15 GB free quota)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-start sm:self-auto">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
              Used
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                isHighStorage ? 'text-[#b5523f]' : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatBytes(selectedAccount.storageUsedBytes)}
            </span>
          </div>
          <div className="w-px h-8 bg-[#d4ded0] dark:bg-[#233a2c]" />
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
              Free Space
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-[#2d5c2d] dark:text-[#7fb27a] tabular-nums">
              {formatBytes(freeBytes)}
            </span>
          </div>
          <div className="w-px h-8 bg-[#d4ded0] dark:bg-[#233a2c]" />
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
              Account Quota
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
              {formatBytes(selectedAccount.storageLimitBytes)}
            </span>
          </div>
        </div>
      </div>

      {/* Storage Progress Bar */}
      <div className="w-full bg-[#e6ede4] dark:bg-[#0f1a14] rounded-full h-3 overflow-hidden shadow-inner">
        <div
          style={{
            width: `${usedPercent}%`,
            backgroundColor: isHighStorage ? '#b5523f' : selectedAccount.color,
          }}
          className="h-full rounded-full transition-all duration-300"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-mono tabular-nums">
          {usedPercent.toFixed(1)}% capacity utilized
        </span>
        {isHighStorage ? (
          <span className="flex items-center gap-1.5 text-[#b5523f] dark:text-[#f87171] font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Storage running high. Consider deleting unneeded large files below.
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[#2d5c2d] dark:text-[#7fb27a]">
            <CheckCircle className="w-3.5 h-3.5" />
            Healthy storage space available
          </span>
        )}
      </div>
    </div>
  );
};
