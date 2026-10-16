import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bot,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Layers,
  History,
  FileCheck,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';
import type { User, Team, Document, DocumentVersion } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';

interface DocumentDetailPageProps {
  documentId: string;
  currentUser: User;
  teams: Team[];
  onBack: () => void;
  onAskDocument: (doc: Document) => void;
  onDocumentUpdated?: () => void;
}

export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({
  documentId,
  currentUser,
  teams,
  onBack,
  onAskDocument,
  onDocumentUpdated,
}) => {
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [baseRegulations, setBaseRegulations] = useState<Array<{ id: string; title: string; documentNumber?: string }>>([]);
  const [replacementDoc, setReplacementDoc] = useState<{ id: string; title: string; documentNumber?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editVisibility, setEditVisibility] = useState<'Publik' | 'Terbagi' | 'Hanya Tim'>('Publik');
  const [editDownloadAllowed, setEditDownloadAllowed] = useState(true);
  const [editLegalStatus, setEditLegalStatus] = useState<'Berlaku' | 'Tidak Berlaku' | 'Belum Terverifikasi'>('Berlaku');
  const [editLegalStatusNote, setEditLegalStatusNote] = useState('');
  const [editSourceUrl, setEditSourceUrl] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error('Akses Ditolak: Anda tidak memiliki wewenang membaca dokumen ini.');
        if (res.status === 404) throw new Error('Dokumen tidak ditemukan.');
        throw new Error('Gagal memuat detail dokumen.');
      }
      const data = await res.json();
      setDoc(data.document);
      setVersions(data.versions || []);
      setBaseRegulations(data.baseRegulations || []);
      setReplacementDoc(data.replacementDocument || null);

      // Populate edit fields
      setEditTitle(data.document.title);
      setEditVisibility(data.document.visibility);
      setEditDownloadAllowed(data.document.downloadAllowed);
      setEditLegalStatus(data.document.legalStatus);
      setEditLegalStatusNote(data.document.legalStatusNote || '');
      setEditSourceUrl(data.document.sourceUrl);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [documentId]);

  const handleSaveEdit = async () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          visibility: editVisibility,
          downloadAllowed: editDownloadAllowed,
          legalStatus: editLegalStatus,
          legalStatusNote: editLegalStatusNote,
          sourceUrl: editSourceUrl,
          changeSummary: changeSummary || undefined,
        }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui metadata dokumen.');
      setIsEditing(false);
      setChangeSummary('');
      fetchDetail();
      if (onDocumentUpdated) onDocumentUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus/mengarsipkan dokumen "${doc.title}"? Tindakan ini akan dicatat pada Log Audit.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus dokumen');
      alert('Dokumen berhasil dihapus.');
      onBack();
      if (onDocumentUpdated) onDocumentUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs">Memuat naskah dinas resmi...</p>
      </div>
    );
  }

  if (errorMsg || !doc) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-rose-600" />
          <h2 className="text-base font-bold text-rose-800 dark:text-rose-200">{errorMsg}</h2>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Sesuai prinsip least privilege, dokumen Hanya Tim tidak dapat diakses di luar anggota tim pengampu.
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </button>
      </div>
    );
  }

  const ownerTeam = teams.find((t) => t.id === doc.ownerTeamId);
  const canUserEdit = doc.canUserEdit;
  const canUserDelete = doc.canUserDelete;
  const canUserDownload = doc.canUserDownload;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Knowledge Base
        </button>

        <div className="flex items-center gap-2">
          {canUserEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Metadata</span>
            </button>
          )}

          {canUserDelete && !isEditing && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}

          <button
            onClick={() => onAskDocument(doc)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Tanya Dokumen Ini</span>
          </button>
        </div>
      </div>

      {/* Warning Banner if Not Valid */}
      {doc.legalStatus === 'Tidak Berlaku' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">
              Dokumen ini berstatus TIDAK BERLAKU
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              {doc.legalStatusNote || 'Peraturan/SOP ini telah dicabut atau digantikan dan tidak boleh dijadikan acuan operasional aktif.'}
            </p>
            {replacementDoc && (
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-100 pt-1">
                Dokumen Pengganti Resmi:{' '}
                <span className="underline cursor-pointer">{replacementDoc.title}</span> (
                {replacementDoc.documentNumber || '-'})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Metadata Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Title & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={doc.legalStatus} />
            <StatusBadge status={doc.indexStatus} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {doc.documentType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {doc.sourceType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Visibilitas: {doc.visibility}
            </span>
          </div>

          {!isEditing ? (
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {doc.title}
            </h1>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Judul Dokumen</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Nomor: <strong>{doc.documentNumber || 'Tanpa Nomor'}</strong></span>
            <span>Tahun: <strong>{doc.year || '-'}</strong></span>
            <span>Tim Pengampu: <strong>{ownerTeam ? ownerTeam.name : 'Instansi'}</strong></span>
            <span>Versi Aktif: <strong>v{doc.version}</strong></span>
          </div>
        </div>

        {/* Edit Form Mode Details */}
        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Edit className="w-4 h-4 text-blue-600" />
              Perbarui Metadata dan Pengaturan Izin
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Tingkat Visibilitas</label>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Publik">Publik</option>
                  <option value="Terbagi">Terbagi</option>
                  <option value="Hanya Tim">Hanya Tim</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Status Keberlakuan Hukum</label>
                <select
                  value={editLegalStatus}
                  onChange={(e) => setEditLegalStatus(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Berlaku">Berlaku</option>
                  <option value="Tidak Berlaku">Tidak Berlaku</option>
                  <option value="Belum Terverifikasi">Belum Terverifikasi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Catatan Keberlakuan</label>
              <input
                type="text"
                value={editLegalStatusNote}
                onChange={(e) => setEditLegalStatusNote(e.target.value)}
                placeholder="Contoh: Dicabut oleh Permen Komdigi No. 3 Tahun 2025"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Tautan Sumber Berkas (Google Drive / JDIH)</label>
              <input
                type="url"
                value={editSourceUrl}
                onChange={(e) => setEditSourceUrl(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Jika tautan diubah, sistem akan secara otomatis membuat rekaman riwayat versi baru (tidak menimpa versi lama).
              </p>
            </div>

            {editSourceUrl !== doc.sourceUrl && (
              <div>
                <label className="font-semibold block mb-1 text-blue-600">
                  Ringkasan Perubahan Versi Baru (Wajib Diisi)
                </label>
                <input
                  type="text"
                  required
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Contoh: Pembaruan formulir lampiran II dan tenggat pelaporan"
                  className="w-full p-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-semibold block">Izinkan Pegawai Mengunduh Berkas Asli</span>
                <span className="text-[11px] text-slate-500">Izin unduh terpisah dari izin membaca/bertanya.</span>
              </div>
              <input
                type="checkbox"
                checked={editDownloadAllowed}
                onChange={(e) => setEditDownloadAllowed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Source link & download buttons */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Tautan Dokumen Asli Resmi
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-lg">
              {doc.sourceUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={doc.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <span>Buka di Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {canUserDownload ? (
              <a
                href={doc.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </a>
            ) : (
              <span
                title="Admin tim menonaktifkan izin unduh berkas untuk dokumen ini."
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 font-medium cursor-not-allowed text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Izin Unduh Terkunci</span>
              </span>
            )}
          </div>
        </div>

        {/* Document Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Kata Kunci & Indeks
            </p>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Indexed Content Preview */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Cuplikan Naskah Resmi yang Terindeks oleh Sistem RAG:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
            {doc.indexedText || '(Teks belum diekstraksi ke indeks atau dokumen gagal diindeks)'}
          </div>
        </div>

        {/* Version History Table */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-500" />
            Riwayat Versi Dokumen (Tanpa Penimpaan Versi Lama)
          </h3>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Versi</th>
                  <th className="px-3 py-2">Catatan Perubahan</th>
                  <th className="px-3 py-2">Dibuat Oleh</th>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2 text-right">Tautan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {versions.map((ver) => (
                  <tr key={ver.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono font-bold text-blue-600">v{ver.version}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      {ver.changeSummary || 'Rilis dokumen'}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{ver.createdBy}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(ver.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <a
                        href={ver.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end gap-1"
                      >
                        Buka <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
