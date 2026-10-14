import React, { useMemo } from 'react';
import { DriveFile, ConnectedAccount, FileType } from '../types';
import { formatBytes, formatDate } from '../utils/seedData';
import {
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  Video,
  Archive,
  Music,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  SearchX,
  Sparkles,
} from 'lucide-react';

interface FileListProps {
  files: DriveFile[];
  accounts: ConnectedAccount[];
  selectedFileIds: Set<string>;
  onToggleSelectFile: (fileId: string) => void;
  onSelectAllVisible: (fileIds: string[]) => void;
  onClearSelection: () => void;
  onDeleteSingle: (file: DriveFile) => void;
  onDeleteBatch: () => void;
  onPreviewFile: (file: DriveFile) => void;
  searchQuery: string;
  selectedTypeFilter: 'ALL' | FileType;
  onSelectTypeFilter: (type: 'ALL' | FileType) => void;
  isAllAccounts: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  accounts,
  selectedFileIds,
  onToggleSelectFile,
  onSelectAllVisible,
  onClearSelection,
  onDeleteSingle,
  onDeleteBatch,
  onPreviewFile,
  searchQuery,
  selectedTypeFilter,
  onSelectTypeFilter,
  isAllAccounts,
}) => {
  // Map accountId to account for quick lookup
  const accountMap = useMemo(() => {
    const map = new Map<string, ConnectedAccount>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Compute available types and their counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: files.length };
    files.forEach((f) => {
      counts[f.type] = (counts[f.type] || 0) + 1;
    });
    return counts;
  }, [files]);

  // Filter files by type and search query, then SORT BY SIZE (largest first)
  const visibleFiles = useMemo(() => {
    let result = files;

    // Filter by type
    if (selectedTypeFilter !== 'ALL') {
      result = result.filter((f) => f.type === selectedTypeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }

    // MANDATORY REQUIREMENT: Sort by size, largest first
    return [...result].sort((a, b) => b.sizeBytes - a.sizeBytes);
  }, [files, selectedTypeFilter, searchQuery]);

  // Determine selection status for visible files
  const visibleSelectedCount = useMemo(() => {
    return visibleFiles.filter((f) => selectedFileIds.has(f.id)).length;
  }, [visibleFiles, selectedFileIds]);

  const allVisibleSelected = visibleFiles.length > 0 && visibleSelectedCount === visibleFiles.length;

  const handleSelectAllToggle = () => {
    if (allVisibleSelected) {
      onClearSelection();
    } else {
      onSelectAllVisible(visibleFiles.map((f) => f.id));
    }
  };

  const getBadgeStyle = (type: FileType) => {
    switch (type) {
      case 'PDF':
        return 'bg-[#a05a42]/15 text-[#a05a42] dark:text-[#f87171] border-[#a05a42]/30';
      case 'IMG':
        return 'bg-[#4a7c4a]/15 text-[#2d5c2d] dark:text-[#7fb27a] border-[#4a7c4a]/30';
      case 'DOC':
        return 'bg-[#4a6582]/15 text-[#3b526b] dark:text-[#93c5fd] border-[#4a6582]/30';
      case 'XLS':
        return 'bg-[#6b7d3f]/15 text-[#526030] dark:text-[#a3e635] border-[#6b7d3f]/30';
      case 'VID':
        return 'bg-[#6f4c78]/15 text-[#5a3e62] dark:text-[#d8b4fe] border-[#6f4c78]/30';
      case 'ZIP':
        return 'bg-[#b38b46]/15 text-[#8c6b30] dark:text-[#fde047] border-[#b38b46]/30';
      case 'AUD':
        return 'bg-[#2d7a78]/15 text-[#23605e] dark:text-[#5eead4] border-[#2d7a78]/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-[#a05a42]" />;
      case 'IMG':
        return <Image className="w-4 h-4 text-[#4a7c4a]" />;
      case 'DOC':
        return <FileCode className="w-4 h-4 text-[#4a6582]" />;
      case 'XLS':
        return <FileSpreadsheet className="w-4 h-4 text-[#6b7d3f]" />;
      case 'VID':
        return <Video className="w-4 h-4 text-[#6f4c78]" />;
      case 'ZIP':
        return <Archive className="w-4 h-4 text-[#b38b46]" />;
      case 'AUD':
        return <Music className="w-4 h-4 text-[#2d7a78]" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const availableTypes: Array<'ALL' | FileType> = ['ALL', 'PDF', 'IMG', 'DOC', 'XLS', 'VID', 'ZIP', 'AUD'].filter(
    (t) => t === 'ALL' || (typeCounts[t] && typeCounts[t] > 0)
  ) as Array<'ALL' | FileType>;

  return (
    <div className="space-y-4">
      {/* Filter Chips & Batch Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {availableTypes.map((t) => {
            const isActive = selectedTypeFilter === t;
            const count = typeCounts[t] || 0;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onSelectTypeFilter(t)}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[#1f3a2d] dark:bg-[#4a7c4a] text-white border-transparent shadow-xs'
                    : 'bg-[#fafbf8] dark:bg-[#16251c] text-slate-700 dark:text-slate-300 border-[#d4ded0] dark:border-[#233a2c] hover:bg-[#eef2ea] dark:hover:bg-[#1e3428]'
                }`}
              >
                <span>{t === 'ALL' ? 'All files' : t}</span>
                <span
                  className={`ml-1.5 font-mono text-[10px] ${
                    isActive ? 'text-[#cce5d4]' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Batch Selection Action Bar (appears when items are selected) */}
        {selectedFileIds.size > 0 && (
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#e2ede0] dark:bg-[#1d3527] border border-[#bcd3be] dark:border-[#2d523c] px-3 py-1.5 rounded-xl shadow-xs transition-all">
            <span className="text-xs font-semibold text-[#1f3a2d] dark:text-[#a3e29f] font-mono tabular-nums">
              {selectedFileIds.size} selected
            </span>
            <div className="w-px h-4 bg-[#bcd3be] dark:bg-[#2d523c]" />
            <button
              type="button"
              onClick={onDeleteBatch}
              className="py-1 px-2.5 rounded-lg bg-[#b5523f] hover:bg-[#9d4433] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete selected</span>
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="py-1 px-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main File Table Container */}
      <div className="bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl border border-[#d4ded0] dark:border-[#233a2c] overflow-hidden shadow-xs transition-colors">
        {visibleFiles.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#eef2ea] dark:bg-[#0f1a14] text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
              {searchQuery ? <SearchX className="w-6 h-6" /> : <Sparkles className="w-6 h-6 text-[#4a7c4a]" />}
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-1">
              {searchQuery ? 'No matching files found' : 'No files in this drive'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No files matching "${searchQuery}". Try clearing your search query or switching filters.`
                : 'This account currently holds no files or all files have been trashed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#e2ede0] dark:border-[#233a2c] bg-[#f5f8f3] dark:bg-[#14231a] text-slate-500 dark:text-slate-400 select-none">
                  <th className="py-3 px-3 sm:px-4 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAllToggle}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#4a7c4a]"
                      title={allVisibleSelected ? 'Deselect all visible' : `Select all visible (${visibleFiles.length})`}
                      aria-label="Select all visible files"
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#2d5c2d] dark:text-[#7fb27a]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-2 sm:px-3 font-semibold uppercase tracking-wider text-[11px]">
                    Type
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                    File Name
                  </th>
                  {isAllAccounts && (
                    <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] hidden sm:table-cell">
                      Account
                    </th>
                  )}
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] hidden md:table-cell">
                    Last Modified
                  </th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-right">
                    Size (Largest First)
                  </th>
                  <th className="py-3 px-3 sm:px-4 w-20 text-center font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3eb] dark:divide-[#1d3225]">
                {visibleFiles.map((file) => {
                  const isSelected = selectedFileIds.has(file.id);
                  const account = accountMap.get(file.accountId);

                  return (
                    <tr
                      key={file.id}
                      className={`group transition-colors duration-150 ${
                        isSelected
                          ? 'bg-[#e2ede0] dark:bg-[#1d3527]'
                          : 'hover:bg-[#f3f7f0] dark:hover:bg-[#182a20]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 sm:px-4">
                        <button
                          type="button"
                          onClick={() => onToggleSelectFile(file.id)}
                          className="p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#4a7c4a] transition-colors"
                          aria-label={`Select ${file.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2d5c2d] dark:text-[#7fb27a]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* File Type Badge */}
                      <td className="py-3 px-2 sm:px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getBadgeStyle(
                            file.type
                          )}`}
                        >
                          {file.type}
                        </span>
                      </td>

                      {/* File Name */}
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100 max-w-[200px] sm:max-w-[280px] md:max-w-[340px] truncate">
                        <button
                          type="button"
                          onClick={() => onPreviewFile(file)}
                          className="hover:text-[#2d5c2d] dark:hover:text-[#7fb27a] hover:underline text-left truncate block w-full transition-colors flex items-center gap-2"
                          title="Click to view file details"
                        >
                          {getFileIcon(file.type)}
                          <span className="truncate">{file.name}</span>
                        </button>
                      </td>

                      {/* Account Tag (shown in All accounts view) */}
                      {isAllAccounts && (
                        <td className="py-3 px-3 whitespace-nowrap hidden sm:table-cell">
                          {account ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <span
                                style={{ backgroundColor: account.color }}
                                className="w-2 h-2 rounded-full shrink-0"
                              />
                              <span className="truncate max-w-[120px] font-sans">
                                {account.displayName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Unknown</span>
                          )}
                        </td>
                      )}

                      {/* Last Modified Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs font-mono hidden md:table-cell">
                        {formatDate(file.updatedAt)}
                      </td>

                      {/* File Size (tabular nums) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono text-slate-800 dark:text-slate-200 font-medium tabular-nums text-xs">
                        {formatBytes(file.sizeBytes)}
                      </td>

                      {/* Actions: Preview & Single Delete */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewFile(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#233a2c] transition-colors"
                            title="Preview file details"
                            aria-label={`Preview ${file.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSingle(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#b5523f] dark:hover:text-[#f87171] hover:bg-[#b5523f]/10 transition-colors"
                            title="Delete file"
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
