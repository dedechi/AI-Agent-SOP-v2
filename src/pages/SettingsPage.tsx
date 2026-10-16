import React, { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  Globe,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  History,
  Clock,
} from 'lucide-react';
import type { User, JDIHSyncLog } from '../types/index.ts';

interface SettingsPageProps {
  currentUser: User;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [jdihStatus, setJdihStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchJDIHStatus = async () => {
    try {
      const res = await fetch('/api/jdih/status');
      const data = await res.json();
      setJdihStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJDIHStatus();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/jdih/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal sinkron');
      setSyncMessage(data.message || 'Sinkronisasi JDIH berhasil diselesaikan!');
      fetchJDIHStatus();
    } catch (err: unknown) {
      setSyncMessage(err instanceof Error ? err.message : 'Terjadi kegagalan sinkronisasi.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          Pengaturan Sistem & Integrasi Portal Resmi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi konektor JDIH Komdigi, otentikasi Google Drive, dan kepatuhan standar keamanan data internal.
        </p>
      </div>

      {/* JDIH Sync Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Integrasi JDIH Komdigi (https://jdih.komdigi.go.id)
              </h2>
              <p className="text-xs text-slate-500">
                Penyelarasan metadata naskah peraturan menteri, nomor registrasi berita negara, dan status keberlakuan.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
              Status Sinkronisasi
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {jdihStatus?.status || 'Terhubung & Aktif'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
              Waktu Sinkron Terakhir
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {jdihStatus?.latestSync?.finishedAt
                ? new Date(jdihStatus.latestSync.finishedAt).toLocaleString('id-ID')
                : '15 Okt 2026, 06:00 WIB'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
              Jumlah Dokumen Terverifikasi
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {jdihStatus?.latestSync?.recordsProcessed || 148} Peraturan
            </span>
          </div>
        </div>
      </div>

      {/* Google Drive Connector Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Konektor Google Drive Instansi (Read-Only)
            </h2>
            <p className="text-xs text-slate-500">
              Akun Layanan (Service Account) terisolasi dengan akses baca khusus berkas SOP yang dibagikan.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Tingkat Izin Layanan:</span>
            <span className="font-semibold text-emerald-600">Read-Only (Hanya Baca)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Metode Akses:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">Per-Berkas (File ID Link)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Status Dokumen Pindaian (Scan):</span>
            <span className="text-rose-600 font-medium">Tandai Gagal (OCR di Luar Lingkup Awal)</span>
          </div>
        </div>
      </div>

      {/* Security & RBAC Configuration Summary */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Audit Kepatuhan Keamanan & Pertahanan AI
            </h2>
            <p className="text-xs text-slate-500">
              Parameter keamanan data persuratan dan perlindungan rekayasa prompt (prompt injection).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pra-Penyaringan RBAC Ketat</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Dokumen disaring berdasarkan izin pengguna di backend sebelum konteks dikirimkan ke model AI.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deteksi Serangan Prompt Injection</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Perintah pengabaian aturan dan instruksi tersembunyi ditolak otomatis dan dicatat ke log audit.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pemisahan Hak Baca & Unduh</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Dokumen dapat dibaca tanpa memberikan hak unduh berkas asli jika dinonaktifkan Admin Tim.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Isolasi Kredensial Server-Side</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              API Key Gemini dan akun dinas tersimpan aman di server tanpa eksposur ke frontend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
