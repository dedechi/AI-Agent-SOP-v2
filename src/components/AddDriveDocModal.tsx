import React, { useState } from 'react';
import { X, Link2, Upload, AlertCircle, FileText, Check } from 'lucide-react';
import type { User, Team, Document } from '../types/index.ts';

interface AddDriveDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  teams: Team[];
  baseRegulations: Document[];
  onDocumentAdded: (newDoc: Document) => void;
}

export const AddDriveDocModal: React.FC<AddDriveDocModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  teams,
  baseRegulations,
  onDocumentAdded,
}) => {
  const isSuperAdmin = currentUser.role === 'Super Admin';
  const userTeamId = currentUser.teamIds[0] || 'team-kepegawaian';

  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [documentType, setDocumentType] = useState('SOP');
  const [ownerTeamId, setOwnerTeamId] = useState(isSuperAdmin ? teams[0]?.id || userTeamId : userTeamId);
  const [visibility, setVisibility] = useState<'Publik' | 'Terbagi' | 'Hanya Tim'>('Publik');
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [selectedBaseRegId, setSelectedBaseRegId] = useState('');
  const [tags, setTags] = useState('');
  const [simulatedContent, setSimulatedContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sourceUrl.trim()) {
      setErrorMsg('Judul dan tautan Google Drive wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          sourceUrl: sourceUrl.trim(),
          documentNumber: documentNumber.trim() || null,
          year: parseInt(year, 10) || new Date().getFullYear(),
          documentType,
          sourceType: 'Google Drive',
          ownerTeamId: isSuperAdmin ? ownerTeamId : userTeamId,
          visibility,
          downloadAllowed,
          baseRegulationIds: selectedBaseRegId ? [selectedBaseRegId] : [],
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          simulatedContent: simulatedContent.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan dokumen');
      }

      onDocumentAdded(data.document);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Dokumen Tautan Google Drive
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan naskah dinas atau SOP resmi dari Google Drive instansi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drive Link & Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tautan Google Drive (Berkas SOP/Naskah) *
            </label>
            <input
              type="url"
              required
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/1.../view"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Pastikan akun layanan instansi memiliki izin akses baca (read-only) pada berkas tersebut.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Judul Resmi Dokumen / SOP *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: SOP Penanganan Pengaduan Layanan Informasi Publik"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nomor, Tahun, Jenis Dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nomor Dokumen
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Contoh: SOP/15/KOMDIGI/2026"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tahun
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jenis Dokumen
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SOP">SOP</option>
                <option value="Petunjuk Teknis">Petunjuk Teknis (Juknis)</option>
                <option value="Surat Edaran">Surat Edaran</option>
                <option value="Pedoman Teknis">Pedoman Teknis</option>
              </select>
            </div>
          </div>

          {/* Tim Pengampu & Visibilitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tim Pengampu / Pemilik
              </label>
              <select
                disabled={!isSuperAdmin}
                value={ownerTeamId}
                onChange={(e) => setOwnerTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {!isSuperAdmin && (
                <p className="text-[10px] text-slate-500">Admin Tim mengelola dokumen unitnya sendiri.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tingkat Visibilitas Dokumen
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'Publik' | 'Terbagi' | 'Hanya Tim')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Publik">Publik (Seluruh Pegawai Instansi)</option>
                <option value="Terbagi">Terbagi (Tim Pengampu & Tim Tertentu)</option>
                <option value="Hanya Tim">Hanya Tim (Rahasia Khusus Tim Pemilik)</option>
              </select>
            </div>
          </div>

          {/* Izin Unduh Terpisah */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Izinkan Pengguna Mengunduh Berkas Asli
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hak baca terpisah dari hak unduh. Jika dinonaktifkan, pegawai hanya dapat membaca dan bertanya via AI Agent.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={downloadAllowed}
                onChange={(e) => setDownloadAllowed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Regulasi Dasar & Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Regulasi Dasar Acuan (Opsional)
            </label>
            <select
              value={selectedBaseRegId}
              onChange={(e) => setSelectedBaseRegId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Tanpa Regulasi Dasar Terkait --</option>
              {baseRegulations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.documentNumber || '-'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kata Kunci / Tag (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="cuti, persuratan, pengadaan, permohonan"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Text preview for indexing simulation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ringkasan Cuplikan / Teks Terindeks (Simulasi Ekstraksi Teks)
            </label>
            <textarea
              rows={3}
              value={simulatedContent}
              onChange={(e) => setSimulatedContent(e.target.value)}
              placeholder="Contoh: Pasal 1: Ketentuan pelaksanaan... Prosedur 1: Mengisi formulir..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                <>Menyimpan & Mengindeks...</>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Simpan Dokumen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
