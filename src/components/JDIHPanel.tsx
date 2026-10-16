import React, { useState } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, ShieldAlert, Globe, Search } from 'lucide-react';

interface JDIHPanelProps {
  initialSearchQuery?: string;
  onClose?: () => void;
}

export const JDIHPanel: React.FC<JDIHPanelProps> = ({ initialSearchQuery = '', onClose }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const officialUrl = 'https://jdih.komdigi.go.id';
  const searchUrl = searchTerm.trim()
    ? `https://jdih.komdigi.go.id/pencarian?q=${encodeURIComponent(searchTerm.trim())}`
    : officialUrl;

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-blue-200" />
          <div>
            <h3 className="text-sm font-bold">Portal Resmi JDIH Komdigi</h3>
            <p className="text-[11px] text-blue-100">Jaringan Dokumentasi dan Informasi Hukum Resmi Instansi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={searchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <span>Buka di Tab Baru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs text-blue-200 hover:text-white rounded hover:bg-white/10"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Regulatory Warning Rule */}
      <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold">Ketentuan Integritas Data:</strong> Isi panel JDIH hanya disediakan
          sebagai verifikasi visual langsung bagi pengguna. Sesuai kebijakan keamanan, konten halaman ini tidak
          dapat dijadikan sumber langsung sintesis otomatis sebelum melalui proses sinkronisasi dan pengindeksan
          resmi.
        </p>
      </div>

      {/* Search Input for JDIH Portal */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kunci regulasi di portal JDIH..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span>Pencarian Teks JDIH</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Iframe View / Fallback */}
      <div className="relative h-96 w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        {!iframeBlocked ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Embedded frame with fallback notice */}
            <iframe
              src={officialUrl}
              title="JDIH Komdigi"
              className="w-full h-full border-0 rounded"
              onError={() => setIframeBlocked(true)}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
              <span>Jika halaman di atas tidak memuat karena kebijakan keamanan peramban (X-Frame-Options),</span>
              <a
                href={searchUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 font-medium underline"
              >
                klik di sini untuk membuka langsung JDIH
              </a>
            </div>
          </div>
        ) : (
          <div className="max-w-md space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pratinjau Tertanam Dibatasi oleh Situs Asal
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Situs resmi JDIH menerapkan proteksi keamanan bingkai (X-Frame-Options/CSP). Anda dapat mengakses
              seluruh naskah regulasi melalui tombol tautan langsung berikut.
            </p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <span>Buka Portal JDIH Komdigi Resmi</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
