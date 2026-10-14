import { ConnectedAccount, DriveFile, FileType } from '../types';

export const FIFTEEN_GB = 15 * 1024 * 1024 * 1024; // 16,106,127,360 bytes

export const ACCOUNT_COLORS = [
  '#4a7c4a', // Moss
  '#2d7a78', // Teal
  '#a05a42', // Clay
  '#b38b46', // Sand
  '#6f4c78', // Plum
  '#4a6582', // Slate Blue
  '#6b7d3f', // Olive
];

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(val >= 10 || i === 0 ? 1 : 2)} ${sizes[i]}`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Simple deterministic hash from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

const SAMPLE_TEMPLATES: Array<{
  name: string;
  type: FileType;
  minBytes: number;
  maxBytes: number;
  daysAgo: number;
}> = [
  { name: 'Drone_Footage_Coastal_4K.mp4', type: 'VID', minBytes: 2.8 * 1024 * 1024 * 1024, maxBytes: 4.6 * 1024 * 1024 * 1024, daysAgo: 3 },
  { name: 'Brand_Identity_Guidelines_2026.pdf', type: 'PDF', minBytes: 45 * 1024 * 1024, maxBytes: 120 * 1024 * 1024, daysAgo: 8 },
  { name: 'Quarterly_Financial_Model_Q3.xlsx', type: 'XLS', minBytes: 18 * 1024 * 1024, maxBytes: 65 * 1024 * 1024, daysAgo: 14 },
  { name: 'Raw_Studio_Photoshoot_Batch_04.zip', type: 'ZIP', minBytes: 1.9 * 1024 * 1024 * 1024, maxBytes: 3.4 * 1024 * 1024 * 1024, daysAgo: 21 },
  { name: 'Product_Roadmap_Strategy.docx', type: 'DOC', minBytes: 12 * 1024 * 1024, maxBytes: 35 * 1024 * 1024, daysAgo: 28 },
  { name: 'Podcast_Interview_Episode_42_Master.wav', type: 'AUD', minBytes: 420 * 1024 * 1024, maxBytes: 890 * 1024 * 1024, daysAgo: 35 },
  { name: 'Architecture_System_Diagram_HighRes.png', type: 'IMG', minBytes: 24 * 1024 * 1024, maxBytes: 78 * 1024 * 1024, daysAgo: 42 },
  { name: 'Contract_Master_Services_Agreement_Signed.pdf', type: 'PDF', minBytes: 8 * 1024 * 1024, maxBytes: 22 * 1024 * 1024, daysAgo: 50 },
  { name: 'Year_End_Tax_Documentation_Archive.zip', type: 'ZIP', minBytes: 620 * 1024 * 1024, maxBytes: 1.4 * 1024 * 1024 * 1024, daysAgo: 65 },
  { name: 'Keynote_Investor_Pitch_Final_V3.pdf', type: 'PDF', minBytes: 85 * 1024 * 1024, maxBytes: 210 * 1024 * 1024, daysAgo: 70 },
  { name: 'Field_Recording_Ambient_Forest.flac', type: 'AUD', minBytes: 210 * 1024 * 1024, maxBytes: 520 * 1024 * 1024, daysAgo: 82 },
  { name: 'Product_Catalog_Summer_Line.xlsx', type: 'XLS', minBytes: 14 * 1024 * 1024, maxBytes: 45 * 1024 * 1024, daysAgo: 95 },
];

/**
 * Deterministically generates files for a given account email.
 */
export function generateFilesForAccount(accountId: string, email: string): DriveFile[] {
  const seed = hashString(email);
  const now = Date.now();
  const fileCount = 6 + (seed % 5); // 6 to 10 files
  const files: DriveFile[] = [];

  for (let i = 0; i < fileCount; i++) {
    const templateIdx = (seed + i * 3) % SAMPLE_TEMPLATES.length;
    const template = SAMPLE_TEMPLATES[templateIdx];
    const varianceRatio = ((seed * (i + 1)) % 100) / 100;
    const sizeBytes = Math.floor(
      template.minBytes + varianceRatio * (template.maxBytes - template.minBytes)
    );
    const dateOffsetMs = (template.daysAgo + (i % 7)) * 24 * 60 * 60 * 1000;
    const updatedAt = new Date(now - dateOffsetMs).toISOString();

    // Customize name slightly per account to avoid identical duplicate titles
    const prefix = email.split('@')[0].slice(0, 4);
    const name = `${prefix}_${template.name}`;

    files.push({
      id: `file_${accountId}_${i}_${(seed + i).toString(36)}`,
      accountId,
      name,
      type: template.type,
      sizeBytes,
      updatedAt,
      shared: i % 3 === 0,
    });
  }

  return files;
}

/**
 * Creates initial demo accounts and files for a newly signed up user.
 */
export function createInitialDemoData(userId: string, userEmail: string): {
  accounts: ConnectedAccount[];
  files: DriveFile[];
} {
  const primaryUsername = userEmail.split('@')[0] || 'alex';

  const personalEmail = `${primaryUsername}.personal@gmail.com`;
  const workEmail = `${primaryUsername}.work@gmail.com`;

  const personalId = `acc_pers_${userId}`;
  const workId = `acc_work_${userId}`;

  const personalFiles = generateFilesForAccount(personalId, personalEmail);
  const workFiles = generateFilesForAccount(workId, workEmail);

  const personalUsed = personalFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const workUsed = workFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

  const accounts: ConnectedAccount[] = [
    {
      id: personalId,
      userId,
      email: personalEmail,
      displayName: 'Personal Drive',
      color: ACCOUNT_COLORS[0], // Moss
      storageLimitBytes: FIFTEEN_GB,
      storageUsedBytes: personalUsed,
      connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: workId,
      userId,
      email: workEmail,
      displayName: 'Work Workspace',
      color: ACCOUNT_COLORS[1], // Teal
      storageLimitBytes: FIFTEEN_GB,
      storageUsedBytes: workUsed,
      connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    accounts,
    files: [...personalFiles, ...workFiles],
  };
}
