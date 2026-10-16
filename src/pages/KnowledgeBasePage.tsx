import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Download,
  Eye,
  Bot,
  ExternalLink,
  Layers,
  FileText,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import type { User, Team, Document } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { AddDriveDocModal } from '../components/AddDriveDocModal.tsx';

interface KnowledgeBasePageProps {
  currentUser: User;
  teams: Team[];
  onSelectDocument: (docId: string) => void;
  onAskDocument: (doc: Document) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  currentUser,
  teams,
  onSelectDocument,
  onAskDocument,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState('Semua');
  const [selectedTeam, setSelectedTeam] = useState('Semua');
  const [selectedType, setSelectedType] = useState('Semua');
  const [selectedLegalStatus, setSelectedLegalStatus] = useState('Semua');
  const [selectedIndexStatus, setSelectedIndexStatus] = useState('Semua');
  const [selectedVisibility, setSelectedVisibility] = useState('Semua');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const canAddDocument = currentUser.role === 'Super Admin' || currentUser.role === 'Admin Tim';

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedSourceType !== 'Semua') params.set('sourceType', selectedSourceType);
      if (selectedTeam !== 'Semua') params.set('teamId', selectedTeam);
      if (selectedType !== 'Semua') params.set('type', selectedType);
      if (selectedLegalStatus !== 'Semua') params.set('legalStatus', selectedLegalStatus);
      if (selectedIndexStatus !== 'Semua') params.set('indexStatus', selectedIndexStatus);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [
    searchQuery,
    selectedSourceType,
    selectedTeam,
    selectedType,
    selectedLegalStatus,
    selectedIndexStatus,
  ]);

  const handleDocumentAdded = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return 'Lintas Instansi';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.name : 'Tim Terkait';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Knowledge Base Dokumen & Regulasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pusat naskah SOP resmi, tata naskah, dan peraturan perundang-undangan terindeks sesuai hak akses Anda.
          </p>
        </div>

        {canAddDocument && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tautan Drive</span>
          </button>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul dokumen, nomor, tahun, kata kunci atau isi teks..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Sumber
            </label>
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Sumber</option>
              <option value="Google Drive">Google Drive</option>
              <option value="JDIH">JDIH</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Tim Pemilik
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Tim</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Jenis
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="SOP">SOP</option>
              <option value="Peraturan Menteri">Peraturan Menteri</option>
              <option value="Surat Edaran">Surat Edaran</option>
              <option value="Petunjuk Teknis">Petunjuk Teknis</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Keberlakuan
            </label>
            <select
              value={selectedLegalStatus}
              onChange={(e) => setSelectedLegalStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Status</option>
              <option value="Berlaku">Berlaku</option>
              <option value="Tidak Berlaku">Tidak Berlaku</option>
              <option value="Belum Terverifikasi">Belum Terverifikasi</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Status Indeks
            </label>
            <select
              value={selectedIndexStatus}
              onChange={(e) => setSelectedIndexStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Indeks</option>
              <option value="Terindeks">Terindeks</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Gagal">Gagal</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSourceType('Semua');
                setSelectedTeam('Semua');
                setSelectedType('Semua');
                setSelectedLegalStatus('Semua');
                setSelectedIndexStatus('Semua');
              }}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-medium text-xs transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Menampilkan <strong>{documents.length}</strong> dokumen yang dapat Anda akses</span>
        <span className="italic">Hak akses dihitung otomatis berdasarkan peran: {currentUser.role}</span>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Memuat katalog dokumen resmi...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak ada dokumen yang cocok dengan filter atau dapat Anda akses
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Dokumen dengan tingkat visibilitas 'Hanya Tim' dari tim lain tidak akan dimuat demi mematuhi
              kebijakan kerahasiaan naskah dinas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Judul Dokumen & Nomor</th>
                  <th className="px-3 py-3">Jenis</th>
                  <th className="px-3 py-3">Sumber</th>
                  <th className="px-3 py-3">Tim Pemilik</th>
                  <th className="px-3 py-3">Visibilitas</th>
                  <th className="px-3 py-3">Versi</th>
                  <th className="px-3 py-3">Status Indeks</th>
                  <th className="px-3 py-3">Keberlakuan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-4 py-3 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {doc.documentNumber || 'Tanpa Nomor'} • Tahun {doc.year || '-'}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {doc.documentType}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          doc.sourceType === 'JDIH'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {doc.sourceType}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {getTeamName(doc.ownerTeamId)}
                    </td>

                    {/* Visibility */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          doc.visibility === 'Publik'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : doc.visibility === 'Terbagi'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {doc.visibility}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="px-3 py-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      v{doc.version}
                    </td>

                    {/* Index Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={doc.indexStatus} />
                    </td>

                    {/* Legal Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={doc.legalStatus} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => onAskDocument(doc)}
                        title="Tanya Dokumen Ini di AI Agent"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Tanya</span>
                      </button>

                      <button
                        onClick={() => onSelectDocument(doc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Detail</span>
                      </button>

                      {/* Download button strictly checking downloadAllowed */}
                      {doc.downloadAllowed ? (
                        <a
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Unduh Berkas Asli"
                          className="inline-flex items-center p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span
                          title="Izin unduh dinonaktifkan"
                          className="inline-flex items-center p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        >
                          <Download className="w-3.5 h-3.5 opacity-40" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      <AddDriveDocModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        teams={teams}
        baseRegulations={documents.filter((d) => d.documentType === 'Peraturan Menteri' || d.sourceType === 'JDIH')}
        onDocumentAdded={handleDocumentAdded}
      />
    </div>
  );
};
