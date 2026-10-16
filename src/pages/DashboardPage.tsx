import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  MessageSquare,
  Users,
  Activity,
  CheckCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { User, Team, Document, AuditLog } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';

interface DashboardStats {
  totalIndexed: number;
  changedRegulations: number;
  outdatedDocs: number;
  needsEvaluation: number;
  totalQuestions: number;
  unansweredQuestions: number;
  activeUsersCount: number;
  lastJDIHSync: string;
  role: string;
  teamName: string;
}

interface DashboardPageProps {
  currentUser: User;
  onNavigateToDocument: (docId: string) => void;
  onNavigateToFeedback: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onNavigateToDocument,
  onNavigateToFeedback,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [impactedSOPs, setImpactedSOPs] = useState<Document[]>([]);
  const [changedRegs, setChangedRegs] = useState<Document[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, docsRes, logsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/documents'),
        fetch('/api/audit-logs'),
      ]);

      const statsData = await statsRes.json();
      const docsData = await docsRes.json();
      const logsData = await logsRes.json();

      setStats(statsData);

      const allDocs: Document[] = docsData.documents || [];
      // Impacted SOPs: documents with baseRegulations that are outdated, or status Tidak Berlaku / Belum Terverifikasi
      const impacted = allDocs.filter(
        (d) =>
          d.legalStatus === 'Tidak Berlaku' ||
          d.legalStatus === 'Belum Terverifikasi' ||
          d.indexStatus === 'Gagal' ||
          d.indexStatus === 'Menunggu'
      );
      setImpactedSOPs(impacted);

      // Changed regulations: JDIH regulations updated or replaced
      const regs = allDocs.filter((d) => d.sourceType === 'JDIH');
      setChangedRegs(regs);

      setRecentLogs((logsData.logs || []).slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const cards = [
    {
      label: 'Total Dokumen Terindeks',
      value: stats?.totalIndexed ?? 0,
      icon: FileCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900',
    },
    {
      label: 'Regulasi Berubah (JDIH)',
      value: stats?.changedRegulations ?? 0,
      icon: RotateCcw,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-900',
    },
    {
      label: 'SOP Terdampak / Dicabut',
      value: stats?.outdatedDocs ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-900',
    },
    {
      label: 'Dokumen Perlu Dievaluasi',
      value: stats?.needsEvaluation ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900',
    },
    {
      label: 'Jumlah Pertanyaan Pegawai',
      value: stats?.totalQuestions ?? 0,
      icon: MessageSquare,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-900',
    },
    {
      label: 'Pertanyaan Belum Terjawab',
      value: stats?.unansweredQuestions ?? 0,
      icon: Activity,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-800/60',
      border: 'border-slate-200 dark:border-slate-800',
    },
    {
      label: 'Pengguna Aktif',
      value: stats?.activeUsersCount ?? 0,
      icon: Users,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-900',
    },
    {
      label: 'Sinkron JDIH Terakhir',
      value: stats?.lastJDIHSync ? new Date(stats.lastJDIHSync).toLocaleTimeString('id-ID') : 'Hari ini',
      subValue: 'Otomatis tiap 12 jam',
      icon: CheckCircle,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-900',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {currentUser.role}
            </span>
            <span className="text-xs text-slate-300">
              Lingkup: <strong>{stats?.teamName}</strong>
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold">Dasbor Pemantauan Pembaruan SOP & Regulasi</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring perubahan peraturan kementerian, dampak terhadap naskah SOP, dan akurasi AI Agent.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Muat Ulang Data
        </button>
      </div>

      {/* 8 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${c.border} shadow-xs space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  {c.label}
                </span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {c.value}
              </div>
              {c.subValue && <div className="text-[11px] text-slate-400">{c.subValue}</div>}
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Impacted SOPs & Changed Regulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Impacted SOPs & Needs Evaluation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              SOP Terdampak & Perlu Dievaluasi
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {impactedSOPs.length} Dokumen
            </span>
          </div>

          <div className="space-y-2.5">
            {impactedSOPs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Seluruh SOP di bawah lingkup Anda saat ini berstatus valid dan terverifikasi.
              </p>
            ) : (
              impactedSOPs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigateToDocument(doc.id)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {doc.title}
                    </span>
                    <StatusBadge status={doc.legalStatus} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {doc.documentNumber || 'Tanpa Nomor'} • Catatan: {doc.legalStatusNote || 'Perlu evaluasi'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Changed Regulations (JDIH Updates) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-500" />
              Daftar Regulasi Terverifikasi JDIH
            </h2>
            <a
              href="https://jdih.komdigi.go.id"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              JDIH Web <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2.5">
            {changedRegs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigateToDocument(doc.id)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {doc.title}
                  </span>
                  <StatusBadge status={doc.legalStatus} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{doc.documentNumber || '-'}</span>
                  <span>Sinkron: {doc.lastSyncedAt ? new Date(doc.lastSyncedAt).toLocaleDateString('id-ID') : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Preview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            Log Aktivitas & Audit Keamanan Terkini
          </h2>
          <span className="text-xs text-slate-400">Pencatatan Berkelanjutan (Audit Trail)</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">
                  {log.action}
                </span>
                <span className="text-slate-500">
                  oleh {log.actorName} ({log.actorRole})
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(log.createdAt).toLocaleTimeString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
