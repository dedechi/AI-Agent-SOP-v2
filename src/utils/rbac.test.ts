import test from 'node:test';
import assert from 'node:assert/strict';
import { canReadDocument, canDownloadDocument, canEditDocument, filterAccessibleDocuments } from './rbac.ts';
import type { User, Document } from '../types/index.ts';

const superAdmin: User = {
  id: 'u-super',
  name: 'Super Admin Instansi',
  email: 'admin@komdigi.go.id',
  role: 'Super Admin',
  teamIds: ['team-kepegawaian'],
  isActive: true,
  createdAt: '2026-01-01',
  lastLoginAt: '2026-10-15',
};

const adminKepegawaian: User = {
  id: 'u-admin-peg',
  name: 'Admin Kepegawaian',
  email: 'admin.peg@komdigi.go.id',
  role: 'Admin Tim',
  teamIds: ['team-kepegawaian'],
  isActive: true,
  createdAt: '2026-01-01',
  lastLoginAt: '2026-10-15',
};

const userHukum: User = {
  id: 'u-user-hukum',
  name: 'Pegawai Tim Hukum',
  email: 'staff.hukum@komdigi.go.id',
  role: 'User',
  teamIds: ['team-hukum'],
  isActive: true,
  createdAt: '2026-01-01',
  lastLoginAt: '2026-10-15',
};

const publicDoc: Document = {
  id: 'doc-1',
  title: 'Peraturan Menteri Komdigi Nomor 1 Tahun 2026',
  documentNumber: 'Permen 01/2026',
  year: 2026,
  documentType: 'Peraturan Menteri',
  sourceType: 'JDIH',
  sourceUrl: 'https://jdih.komdigi.go.id/dok/permen-1-2026',
  ownerTeamId: 'team-hukum',
  visibility: 'Publik',
  sharedTeamIds: [],
  sharedUserIds: [],
  downloadAllowed: true,
  indexStatus: 'Terindeks',
  legalStatus: 'Berlaku',
  legalStatusNote: null,
  baseRegulationIds: [],
  replacementDocumentId: null,
  version: 1,
  indexedText: 'Ketentuan umum tata kelola digital instansi...',
  tags: ['tata kelola', 'digital'],
  lastSyncedAt: '2026-10-15T10:00:00Z',
  createdBy: 'u-super',
  updatedAt: '2026-10-15T10:00:00Z',
};

const kepegawaianPrivateDoc: Document = {
  id: 'doc-2',
  title: 'SOP Penilaian Kinerja Khusus Tim Kepegawaian',
  documentNumber: 'SOP-PEG-002',
  year: 2026,
  documentType: 'SOP',
  sourceType: 'Google Drive',
  sourceUrl: 'https://drive.google.com/open?id=sop-peg-002',
  ownerTeamId: 'team-kepegawaian',
  visibility: 'Hanya Tim',
  sharedTeamIds: [],
  sharedUserIds: [],
  downloadAllowed: false, // Notice download is strictly FALSE
  indexStatus: 'Terindeks',
  legalStatus: 'Berlaku',
  legalStatusNote: null,
  baseRegulationIds: [],
  replacementDocumentId: null,
  version: 1,
  indexedText: 'Tahapan penilaian kinerja internal tim kepegawaian...',
  tags: ['kinerja', 'internal'],
  lastSyncedAt: '2026-10-14T08:00:00Z',
  createdBy: 'u-admin-peg',
  updatedAt: '2026-10-14T08:00:00Z',
};

test('Super Admin has access to all documents and actions', () => {
  assert.equal(canReadDocument(superAdmin, publicDoc), true);
  assert.equal(canReadDocument(superAdmin, kepegawaianPrivateDoc), true);
  assert.equal(canDownloadDocument(superAdmin, kepegawaianPrivateDoc), true);
  assert.equal(canEditDocument(superAdmin, kepegawaianPrivateDoc), true);
});

test('Admin Tim can read and edit own team documents, but not edit other team documents', () => {
  assert.equal(canReadDocument(adminKepegawaian, kepegawaianPrivateDoc), true);
  assert.equal(canEditDocument(adminKepegawaian, kepegawaianPrivateDoc), true);
  // Admin Kepegawaian reading a public document owned by team-hukum
  assert.equal(canReadDocument(adminKepegawaian, publicDoc), true);
  // But cannot edit other team's document
  assert.equal(canEditDocument(adminKepegawaian, publicDoc), false);
});

test('Regular user cannot read "Hanya Tim" document from other team', () => {
  // Pegawai Tim Hukum should NOT be able to read Kepegawaian "Hanya Tim" document
  assert.equal(canReadDocument(userHukum, kepegawaianPrivateDoc), false);
  // Filtered list should exclude it completely
  const accessible = filterAccessibleDocuments(userHukum, [publicDoc, kepegawaianPrivateDoc]);
  assert.equal(accessible.length, 1);
  assert.equal(accessible[0].id, 'doc-1');
});

test('Download permission is strictly separate from read permission', () => {
  // Admin Kepegawaian can read kepegawaianPrivateDoc, but downloadAllowed is false!
  // Normal Admin Tim check:
  assert.equal(canReadDocument(adminKepegawaian, kepegawaianPrivateDoc), true);
  assert.equal(canDownloadDocument(adminKepegawaian, kepegawaianPrivateDoc), false);
});
