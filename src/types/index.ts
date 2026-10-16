export type Role = 'Super Admin' | 'Admin Tim' | 'User';

export type Visibility = 'Publik' | 'Terbagi' | 'Hanya Tim';

export type LegalStatus = 'Berlaku' | 'Tidak Berlaku' | 'Belum Terverifikasi';

export type IndexStatus = 'Terindeks' | 'Menunggu' | 'Gagal';

export type SourceType = 'Google Drive' | 'JDIH';

export interface User {
  id: string;
  name: string;
  email: string;
  nip?: string;
  position?: string;
  role: Role;
  teamIds: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description: string;
  adminUserIds: string[];
  memberUserIds: string[];
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  documentNumber: string | null;
  year: number | null;
  documentType: string; // e.g. "SOP", "Peraturan Menteri", "Keputusan Menteri", "Surat Edaran", "Petunjuk Teknis"
  sourceType: SourceType;
  sourceUrl: string;
  ownerTeamId: string | null;
  visibility: Visibility;
  sharedTeamIds: string[];
  sharedUserIds: string[];
  downloadAllowed: boolean;
  indexStatus: IndexStatus;
  legalStatus: LegalStatus;
  legalStatusNote: string | null;
  baseRegulationIds: string[]; // SOP derives from these regulations
  replacementDocumentId: string | null; // If Tidak Berlaku, replaced by this document
  version: number;
  indexedText: string | null;
  tags: string[];
  lastSyncedAt: string | null;
  createdBy: string;
  updatedAt: string;
  canUserDownload?: boolean;
  canUserEdit?: boolean;
  canUserDelete?: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  sourceUrl: string;
  changeSummary: string | null;
  createdBy: string;
  createdAt: string;
}

export interface SourceReference {
  documentId: string;
  title: string;
  documentNumber?: string | null;
  year?: number | null;
  section?: string | null;
  quote?: string | null;
  legalStatus: LegalStatus;
  sourceType: SourceType;
  sourceUrl?: string;
  downloadAllowed?: boolean;
  ownerTeamId?: string | null;
}

export interface AIConversation {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer: string;
  sourceDocumentIds: string[];
  sourceReferences: SourceReference[];
  mode: 'Ringkas' | 'Rinci';
  scope: 'Semua sumber' | 'SOP (Drive)' | 'Regulasi (JDIH)' | 'Satu dokumen';
  targetDocumentId?: string;
  createdAt: string;
  feedback?: 'Membantu' | 'Tidak membantu' | null;
  feedbackNote?: string | null;
  isErrorReported?: boolean;
}

export interface Feedback {
  id: string;
  conversationId: string;
  documentId?: string | null;
  userId: string;
  userName: string;
  type: 'Membantu' | 'Tidak membantu' | 'Laporan kekeliruan';
  note: string | null;
  reviewStatus: 'Baru' | 'Ditinjau' | 'Ditindaklanjuti';
  followUpNote?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  teamId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface JDIHSyncLog {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'Berhasil' | 'Gagal' | 'Parsial';
  recordsProcessed: number;
  errorMessage?: string | null;
}
