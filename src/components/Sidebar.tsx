import React from 'react';
import { ConnectedAccount, User, ActiveView, MainSection } from '../types';
import { formatBytes } from '../utils/seedData';
import { Leaf, Layers, Plus, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  accounts: ConnectedAccount[];
  activeView: ActiveView;
  mainSection: MainSection;
  user: User;
  onSelectView: (view: ActiveView) => void;
  onSelectSection: (section: MainSection) => void;
  onOpenConnectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  accounts,
  activeView,
  mainSection,
  user,
  onSelectView,
  onSelectSection,
  onOpenConnectModal,
}) => {
  const totalLimitBytes = accounts.reduce((acc, a) => acc + a.storageLimitBytes, 0);
  const totalUsedBytes = accounts.reduce((acc, a) => acc + a.storageUsedBytes, 0);
  const totalUsedPercent = totalLimitBytes > 0 ? Math.min(100, (totalUsedBytes / totalLimitBytes) * 100) : 0;

  return (
    <aside className="w-16 sm:w-20 md:w-60 lg:w-[248px] shrink-0 bg-[#1f3a2d] dark:bg-[#122018] text-white flex flex-col justify-between border-r border-[#2a4d3c] dark:border-[#1e3428] select-none h-screen transition-all duration-200">
      {/* Top Header & Accounts */}
      <div className="flex flex-col h-full min-h-0">
        {/* 1. Logo Block */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-[#2a4d3c] dark:border-[#1e3428] flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#4a7c4a] flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <span className="font-serif text-lg font-bold tracking-tight text-[#fafbf8] block truncate">
              Driveswitch
            </span>
            <span className="text-[11px] text-[#9bbca5] block truncate leading-none">
              All your Drives, one place
            </span>
          </div>
        </div>

        {/* 2. All Accounts Card */}
        <div className="p-2 sm:p-3 md:p-4 pb-2">
          <button
            type="button"
            onClick={() => {
              onSelectSection('drive');
              onSelectView('all');
            }}
            className={`w-full text-left rounded-xl p-2.5 md:p-3.5 transition-all duration-150 border ${
              mainSection === 'drive' && activeView === 'all'
                ? 'bg-[#2a4e3c] dark:bg-[#1b3225] border-[#4a7c4a] shadow-sm text-white'
                : 'bg-[#1a3227]/70 hover:bg-[#244334] border-[#2c4e3e] text-[#d6e5da]'
            }`}
            title="All Connected Accounts"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  mainSection === 'drive' && activeView === 'all'
                    ? 'bg-[#4a7c4a] text-white'
                    : 'bg-[#264434] text-[#a4c7ae]'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div className="hidden md:block min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide">All Accounts</span>
                  <span className="text-[10px] font-mono text-[#a3c4ab]">{accounts.length}</span>
                </div>
                <div className="text-[11px] text-[#9bbca5] truncate font-mono mt-0.5">
                  {formatBytes(totalUsedBytes)} / {formatBytes(totalLimitBytes)}
                </div>
              </div>
            </div>

            {/* Segmented or combined storage bar (visible on tablet/desktop) */}
            <div className="hidden md:block mt-2.5 w-full bg-[#14261d] rounded-full h-1.5 overflow-hidden flex">
              {accounts.length === 0 ? (
                <div className="w-0 bg-[#4a7c4a]" />
              ) : (
                accounts.map((acc) => {
                  const segWidth = totalLimitBytes > 0 ? (acc.storageUsedBytes / totalLimitBytes) * 100 : 0;
                  return (
                    <div
                      key={acc.id}
                      style={{ width: `${segWidth}%`, backgroundColor: acc.color }}
                      className="h-full transition-all duration-300"
                      title={`${acc.displayName}: ${formatBytes(acc.storageUsedBytes)}`}
                    />
                  );
                })
              )}
            </div>
          </button>
        </div>

        {/* 3. Section Title & Scrollable Accounts List */}
        <div className="px-3 md:px-4 pt-2 pb-1 hidden md:flex items-center justify-between text-[11px] font-medium text-[#7fa38a] uppercase tracking-wider">
          <span>Connected Drives</span>
          <span className="font-mono text-[10px]">{accounts.length}</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-3 md:px-4 py-1 space-y-1">
          {accounts.map((acc) => {
            const isSelected = mainSection === 'drive' && activeView === acc.id;
            const usedPercent = Math.min(100, (acc.storageUsedBytes / acc.storageLimitBytes) * 100);
            const initial = (acc.displayName || acc.email).charAt(0).toUpperCase();

            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  onSelectSection('drive');
                  onSelectView(acc.id);
                }}
                className={`w-full group text-left rounded-xl p-2 md:p-2.5 transition-all duration-150 flex items-center gap-2.5 border ${
                  isSelected
                    ? 'bg-[#294c3a] dark:bg-[#1a3124] border-[#4a7c4a] text-white shadow-xs'
                    : 'hover:bg-[#234233] border-transparent text-[#cde0d2]'
                }`}
                title={`${acc.displayName} (${acc.email})`}
              >
                {/* Colored Avatar */}
                <div
                  style={{ backgroundColor: acc.color }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs border border-white/20"
                >
                  {initial}
                </div>

                {/* Account Details (Hidden on phone/rail) */}
                <div className="hidden md:block min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-medium text-white truncate max-w-[95px]">
                        {acc.displayName}
                      </span>
                      {acc.isLive && (
                        <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#7fb27a]/20 text-[#a3e29f] border border-[#7fb27a]/30 shrink-0">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#a3c4ab] tabular-nums">
                      {usedPercent.toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-[#90b39b] truncate">{acc.email}</p>

                  {/* Thin storage bar */}
                  <div className="mt-1.5 w-full bg-[#13261c] rounded-full h-1 overflow-hidden">
                    <div
                      style={{
                        width: `${usedPercent}%`,
                        backgroundColor: usedPercent > 85 ? '#b5523f' : acc.color,
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </button>
            );
          })}

          {accounts.length === 0 && (
            <div className="hidden md:block py-6 px-2 text-center text-xs text-[#8aa994]">
              No accounts connected yet.
            </div>
          )}

          {/* 4. Dashed + Connect Account Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenConnectModal}
              className="w-full py-2.5 px-2 md:px-3 rounded-xl border border-dashed border-[#446d55] hover:border-[#6da181] hover:bg-[#254636] text-[#b6d6bf] hover:text-white text-xs font-medium flex items-center justify-center md:justify-start gap-2 transition-all"
              title="Connect another Google Drive account"
            >
              <div className="w-5 h-5 rounded-full bg-[#2d523e] flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="hidden md:inline">Connect account</span>
            </button>
          </div>
        </div>

        {/* 5. Pinned Profile Slot at Bottom */}
        <div className="p-2 sm:p-3 md:p-4 border-t border-[#2a4d3c] dark:border-[#1e3428] mt-auto">
          <button
            type="button"
            onClick={() => onSelectSection('profile')}
            className={`w-full group text-left rounded-xl p-2 transition-all flex items-center gap-2.5 border ${
              mainSection === 'profile'
                ? 'bg-[#2b4e3c] border-[#4a7c4a] text-white shadow-xs'
                : 'hover:bg-[#234233] border-transparent text-[#d4e4d8]'
            }`}
            title={`Signed in as ${user.name}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#39624b] text-[#cce5d4] flex items-center justify-center shrink-0 font-semibold text-xs border border-[#4a7c4a]/50">
              {user.name.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate block">
                {user.name}
              </span>
              <span className="text-[10px] text-[#90b39b] truncate block">
                {user.email}
              </span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};
