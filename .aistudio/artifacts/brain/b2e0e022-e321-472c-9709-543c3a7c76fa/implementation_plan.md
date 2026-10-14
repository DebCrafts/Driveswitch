# Driveswitch — Unified Multi-Account Google Drive Manager

Driveswitch brings multiple Google accounts into a single calm, unified workspace—allowing users to view combined Drive storage quotas, switch accounts with one click, search and filter files across all drives, inspect previews, and batch-delete files with real-time quota reclamation.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 and govern the implementation:

- **Confirmed Decision 1 (Architecture)**: Modern React 19 with Tailwind CSS inside the Vite workspace, structured in clean modular components for effortless transition to Phase 2 (OAuth 2.0 & Drive REST API).
- **Confirmed Decision 2 (File Interactivity)**: Full interactive File Preview Modal supporting file inspection (name, size, type, account source, last modified, simulated download, and deletion).
- **Confirmed Decision 3 (Initial Data Seeding)**: Pre-seeded with two realistic demo accounts ("Personal" Gmail and "Work" Google Workspace) containing varied documents, photos, spreadsheets, presentations, and archives totaling realistic Drive usage.
- **Visual Palette Confirmed**: Calming forest & sage visual design system with automatic system dark mode plus explicit manual toggle, Fraunces serif headings, and Figtree body text.

---

### 1. Overview & Core Concept

- **What It Does**: Solves the friction of managing fragmented 15 GB Google Drive storage quotas across personal, work, and secondary accounts. Users get a centralized sidebar listing all connected accounts with individual storage meters, an aggregated "All accounts" view with combined capacity, live file search and type filtering, batch deletion, and account connection/disconnection.
- **Target Audience / Persona**: Freelancers, students, creatives, and power users who maintain 2–5+ Google accounts and waste time toggling tabs to locate or clean up files.
- **Key Value**: Instant multi-account visibility, frictionless one-click account switching, unified search across all storage silos, and immediate storage reclamation.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Authentication Screen**:
   - Split hero layout with deep forest background, subtle organic contour lines, and the headline *"Every Google Drive. One login."*
   - Sign In vs. Sign Up tab switcher with client-side validation (email format, minimum 6-character password, full name for signups).
   - Clear inline error states and demo disclaimer banner (*"Prototype Mode: Data is saved to your browser session"*).
2. **Main Application Workspace**:
   - **Left Sidebar**:
     - Header: Leaf insignia mark, "Driveswitch" title, and subtitle *"All your Drives, one place"*.
     - "All accounts" overview card displaying aggregate account count and composite storage meter with multi-account color segments.
     - Scrollable connected accounts list: colored circular initial avatars, email labels, storage progress bars, and used/15 GB status. Clicking switches active context immediately.
     - "+ Connect account" dashed button triggering the account connection modal.
     - Bottom profile slot displaying user avatar, name, and quick navigation to Profile view.
   - **Top Navigation Bar**:
     - Global search field with live keyboard shortcut (`/`) and instant filtering.
     - Account indicator / breadcrumb showing current view context.
     - Disconnect Account button (visible exclusively when an individual account is active, complete with confirmation safeguard).
     - Light/Dark theme toggle button.
   - **Content View**:
     - Dynamic storage hero banner with detailed breakdown (Used GB, Free GB, Total Capacity, Percentage).
     - Filter chip bar (`All`, `PDF`, `IMG`, `DOC`, `XLS`, `VID`, `ZIP`, `AUD`) with file counts.
     - Batch action toolbar that appears dynamically when items are selected ("N selected", "Delete selected", "Clear selection").
     - Sortable high-density data table (checkbox, file type badge, file name, account source dot/name, last modified date, file size). Default sort: largest files first.
     - Empty states when search produces no matches or when no accounts/files are present.
3. **Connect Account Modal**:
   - Accepts Gmail/Google Workspace address with `@gmail.com` or custom domain validation.
   - Rejects duplicate email connections.
   - Generates realistic seeded files and assigns a unique earthy color token (moss, teal, sand, plum, clay, olive, slate blue).
4. **File Preview & Inspection Modal**:
   - Displays file details, account attribution, mime-type icon, simulated download action, and direct delete trigger.
5. **Delete Confirmation Dialog & Toast System**:
   - Confirms deletion count with an explicit message that Drive trash API simulation will recover space.
   - Animates removal, updates storage bars instantly, and triggers an undoable toast notice.
6. **Profile View**:
   - Displays account metadata, joined date, aggregated statistics (connected accounts, total files, storage used/free).
   - Inline editable display name with persistence.
   - Safe Sign Out button returning to authentication screen.

#### Visual Identity & Theme
- **Color Palette & Tokens**:
  - *Light Mode*: Sage canvas (`#eef2ea`), pure panel surfaces (`#fafbf8`), deep forest sidebar (`#1f3a2d`), muted moss accent (`#4a7c4a`), selected row sage tint (`#e2ede0`), destructive earthy terracotta (`#b5523f`), subtle borders (`#d8e2d4`).
  - *Dark Mode ("Forest at Night")*: Deep night canvas (`#0f1a14`), panel surfaces (`#16251c`), sidebar night tint (`#122018`), vibrant moss accent (`#7fb27a`), subtle borders (`#233a2c`).
  - *Account Color Swatches*: Moss (`#4a7c4a`), Teal (`#2d7a78`), Clay (`#a05a42`), Sand (`#b38b46`), Plum (`#6f4c78`), Slate Blue (`#4a6582`), Olive (`#6b7d3f`).
- **Typography**:
  - Display & Logo: `Fraunces` (soft humanist serif with optical weight sizing).
  - Body & UI Controls: `Figtree` (clean, friendly, high-legibility sans-serif).
  - Metrics & Numbers: Tabular figures (`tabular-nums font-mono`) for exact vertical alignment of file sizes and storage quotas.
- **Spatial Geometry & Hierarchy**:
  - Soft radii: 12px for cards/buttons, 16px for modals, 6px for compact tags.
  - Hairline borders (`1px solid`) with single-elevation depth.
  - Zero-pill metadata: file sizes, dates, and account tags use unboxed clean text separated by typographic middots (`·`).
  - Strict responsive behavior: 248px desktop sidebar, responsive tablet layout hiding secondary columns, and 64px collapsed icon rail on mobile.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Modular React Architecture over Single-File HTML**
  - *Chosen Approach*: Build as a modular, typed React 19 application with Tailwind CSS and Lucide icons.
  - *Why*: Provides clean state encapsulation, proper event handling, accessible dialogs, and a ready foundation for Phase 2 Google Workspace OAuth and Cloud SQL/backend integration.
  - *Alternatives Considered*: Single-file HTML/vanilla JS was proposed in prompt section 6, but clarified with the user as preferred to use React + Tailwind for production readiness.
- **Decision 2: Isolated LocalStorage Multi-User Sandbox**
  - *Chosen Approach*: Keyed localStorage storage schema (`driveswitch_users`, `driveswitch_session`, `driveswitch_data_<userId>`) wrapped in strict try/catch blocks with automatic fallback.
  - *Why*: Allows realistic multi-user sign-up, sign-in, and independent accounts/files per user without requiring server infrastructure in Phase 1.
  - *Alternatives Considered*: In-memory only (loses state on page reload) or global shared state (mixes users).
- **Decision 3: Seeded Deterministic File Generation for Realistic Storage Quotas**
  - *Chosen Approach*: A deterministic hash-based generator that yields believable file trees (e.g. 4K Drone Footage, Q3 Financial Model, Product Pitch Deck, RAW Photo Batch) calibrated to realistic 15 GB quotas (e.g. 9.4 GB used, 12.1 GB used).
  - *Why*: Gives users immediate visual feedback on multi-account management with large files, varied mime types, and distinct storage pressure.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### System Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Driveswitch Application                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐             ┌──────────────────────────────────┐  │
│  │   Auth Gate & State  │ ──(Logged)─▶│        App Shell Layout          │  │
│  │  (Sign In / Sign Up) │             └──────────────────────────────────┘  │
│  └──────────────────────┘                               │                   │
│                                       ┌─────────────────┴────────────────┐  │
│                                       ▼                                  ▼  │
│                         ┌───────────────────────────┐      ┌─────────────┴┐ │
│                         │       Left Sidebar        │      │   Top Bar    │ │
│                         │ ───────────────────────── │      │ ──────────── │ │
│                         │ • Brand & Tagline         │      │ • Search Input││
│                         │ • "All Accounts" Card     │      │ • Theme Switch││
│                         │ • Account List & Quotas   │      │ • Disconnect │ │
│                         │ • "+ Connect" Trigger     │      └──────────────┘ │
│                         │ • User Profile Pin        │             │         │
│                         └───────────────────────────┘             ▼         │
│                                       │                   ┌──────────────┐  │
│                                       ▼                   │ Main Content │  │
│                         ┌───────────────────────────┐     │ ──────────── │  │
│                         │ Modals & Overlays         │     │ • Storage Bar│  │
│                         │ ───────────────────────── │     │ • Type Chips │  │
│                         │ • Connect Account Modal   │     │ • Batch Bar  │  │
│                         │ • File Preview Modal      │     │ • File Table │  │
│                         │ • Delete Confirm Modal    │     │ • Empty State│  │
│                         │ • Toast Notifications     │     │ • Profile Vw │  │
│                         └───────────────────────────┘     └──────────────┘  │
│                                       │                                     │
│                                       ▼                                     │
│                         ┌───────────────────────────┐                       │
│                         │ Storage Service & Engine  │                       │
│                         │ (localStorage Persistence)│                       │
│                         └───────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface ConnectedAccount {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  color: string; // e.g. '#4a7c4a'
  storageLimitBytes: number; // 15 GB = 15 * 1024 * 1024 * 1024
  storageUsedBytes: number;
  connectedAt: string;
}

type FileType = 'PDF' | 'IMG' | 'DOC' | 'XLS' | 'VID' | 'ZIP' | 'AUD';

interface DriveFile {
  id: string;
  accountId: string;
  name: string;
  type: FileType;
  sizeBytes: number;
  updatedAt: string;
  thumbnailUrl?: string;
  shared?: boolean;
}
```

#### Interactive State & View Transitions
- **Active View Context**: Either `'all'` (aggregated view) or specific `accountId: string`, or `'profile'`.
- **Search & Filter State**: Live substring query + active type filter (`all` | `PDF` | `IMG` | etc.).
- **Selection State**: Set of selected file IDs (`Set<string>`). Auto-prunes when switching account context or when files are filtered out.
- **Batch Actions**: Bulk deletion calculates total reclaimed bytes, updates each affected account's `storageUsedBytes`, records the change in localStorage, and triggers a dismissal toast with file count.

#### Phase 2 Roadmap & Production Architecture
1. **Server Backend**: Node.js/Express or Next.js server with PostgreSQL (via Cloud SQL) and Drizzle ORM.
2. **Google OAuth 2.0 Integration**: Client-side OAuth flow with the `https://www.googleapis.com/auth/drive` scope, encrypting tokens per account.
3. **Live Drive API Endpoints**:
   - `GET https://www.googleapis.com/drive/v3/about?fields=storageQuota` for live storage limits and usage.
   - `GET https://www.googleapis.com/drive/v3/files` (paginated) for file metadata.
   - `PATCH https://www.googleapis.com/drive/v3/files/{fileId}` with body `{ trashed: true }` for non-destructive 30-day recoverable deletion.
