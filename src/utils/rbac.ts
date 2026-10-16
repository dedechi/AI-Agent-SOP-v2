import type { User, Document, AuditLog, Feedback } from '../types/index.ts';

/**
 * Checks if a user has permission to read/view a document.
 * Follows strict RBAC and Team boundaries.
 */
export function canReadDocument(user: User, doc: Document): boolean {
  if (!user || !user.isActive) return false;

  // Super Admin can read all documents
  if (user.role === 'Super Admin') {
    return true;
  }

  // Admin Tim
  if (user.role === 'Admin Tim') {
    // If document is public
    if (doc.visibility === 'Publik') return true;

    // If belongs to their team
    if (doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId)) return true;

    // If explicitly shared to their team
    if (doc.sharedTeamIds?.some((tid) => user.teamIds.includes(tid))) return true;

    // If explicitly shared to this user
    if (doc.sharedUserIds?.includes(user.id)) return true;

    return false;
  }

  // Regular User (Pegawai)
  if (user.role === 'User') {
    if (doc.visibility === 'Publik') return true;

    // If marked "Hanya Tim", user must belong to that team
    if (doc.visibility === 'Hanya Tim') {
      return Boolean(doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId));
    }

    // If marked "Terbagi", user must be in owner team, shared team, or shared user list
    if (doc.visibility === 'Terbagi') {
      if (doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId)) return true;
      if (doc.sharedTeamIds?.some((tid) => user.teamIds.includes(tid))) return true;
      if (doc.sharedUserIds?.includes(user.id)) return true;
      return false;
    }
  }

  return false;
}

/**
 * Checks if a user has permission to download a document.
 * Note: Download permission is strictly checked separately from read permission!
 */
export function canDownloadDocument(user: User, doc: Document): boolean {
  if (!canReadDocument(user, doc)) return false;

  // Super Admin can download
  if (user.role === 'Super Admin') return true;

  // If downloadAllowed is false, regular users and even admin of other teams cannot download
  return Boolean(doc.downloadAllowed);
}

/**
 * Checks if a user can edit/update document metadata or Drive links.
 */
export function canEditDocument(user: User, doc: Document): boolean {
  if (!user || !user.isActive) return false;
  if (user.role === 'Super Admin') return true;
  if (user.role === 'Admin Tim') {
    return Boolean(doc.ownerTeamId && user.teamIds.includes(doc.ownerTeamId));
  }
  return false;
}

/**
 * Checks if a user can delete/archive a document.
 */
export function canDeleteDocument(user: User, doc: Document): boolean {
  return canEditDocument(user, doc);
}

/**
 * Filter document list so that no unauthorized documents leak into searches, summaries, or AI context.
 */
export function filterAccessibleDocuments(user: User, docs: Document[]): Document[] {
  return docs.filter((doc) => canReadDocument(user, doc));
}

/**
 * Checks if an actor can view an audit log item based on scope.
 */
export function canViewAuditLog(user: User, log: AuditLog): boolean {
  if (user.role === 'Super Admin') return true;
  if (user.role === 'Admin Tim') {
    if (!log.teamId) return false;
    return user.teamIds.includes(log.teamId);
  }
  return false;
}

/**
 * Checks if user can review feedback.
 */
export function canReviewFeedback(user: User, feedback: Feedback, doc?: Document): boolean {
  if (user.role === 'Super Admin') return true;
  if (user.role === 'Admin Tim') {
    if (!doc || !doc.ownerTeamId) return false;
    return user.teamIds.includes(doc.ownerTeamId);
  }
  return false;
}
