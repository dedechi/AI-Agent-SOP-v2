import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Check,
  FileText,
} from 'lucide-react';
import type { User, Feedback } from '../types/index.ts';

interface FeedbackPageProps {
  currentUser: User;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ currentUser }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Review modal / action
  const [selectedFb, setSelectedFb] = useState<Feedback | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'Baru' | 'Ditinjau' | 'Ditindaklanjuti'>('Ditinjau');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/feedbacks');
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (e) {
      console.error('Failed to load feedbacks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [currentUser]);

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFb) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feedbacks/${selectedFb.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus,
          followUpNote: followUpNote.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status');
      setSelectedFb(null);
      setFollowUpNote('');
      fetchFeedbacks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = feedbacks.filter((fb) => {
    if (filterType !== 'Semua' && fb.type !== filterType) return false;
    if (filterStatus !== 'Semua' && fb.reviewStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Umpan Balik & Evaluasi Jawaban AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reviu masukan pegawai mengenai ketepatan jawaban, kutipan naskah, dan tindak lanjut perbaikan SOP.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
          >
            <option value="Semua">Semua Jenis Masukan</option>
            <option value="Membantu">Membantu</option>
            <option value="Tidak membantu">Tidak membantu</option>
            <option value="Laporan kekeliruan">Laporan Kekeliruan</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
          >
            <option value="Semua">Semua Status Reviu</option>
            <option value="Baru">Baru</option>
            <option value="Ditinjau">Ditinjau</option>
            <option value="Ditindaklanjuti">Ditindaklanjuti</option>
          </select>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs">Belum ada umpan balik yang cocok dengan filter saat ini.</p>
          </div>
        ) : (
          filtered.map((fb) => (
            <div
              key={fb.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {fb.type === 'Membantu' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ThumbsUp className="w-3.5 h-3.5" /> Membantu
                    </span>
                  ) : fb.type === 'Tidak membantu' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <ThumbsDown className="w-3.5 h-3.5" /> Tidak Membantu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5" /> Laporan Kekeliruan
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {new Date(fb.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    fb.reviewStatus === 'Baru'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      : fb.reviewStatus === 'Ditinjau'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}
                >
                  {fb.reviewStatus}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Pengirim: {fb.userName}
                </p>
                {fb.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{fb.note}"
                  </p>
                )}
              </div>

              {fb.followUpNote && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200">
                  <strong className="block font-semibold">Tindak Lanjut Admin:</strong>
                  {fb.followUpNote}
                </div>
              )}

              {/* Action Button for Admin */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedFb(fb);
                    setReviewStatus(fb.reviewStatus);
                    setFollowUpNote(fb.followUpNote || '');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                >
                  Tinjau & Catat Tindak Lanjut
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Dialog Modal */}
      {selectedFb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Reviu Umpan Balik Pengguna
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <p>
                <strong>Pengirim:</strong> {selectedFb.userName}
              </p>
              <p>
                <strong>Jenis:</strong> {selectedFb.type}
              </p>
              {selectedFb.note && (
                <p>
                  <strong>Catatan:</strong> "{selectedFb.note}"
                </p>
              )}
            </div>

            <form onSubmit={handleUpdateReview} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Status Peninjauan</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Baru">Baru</option>
                  <option value="Ditinjau">Ditinjau</option>
                  <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan Tindak Lanjut Perbaikan SOP</label>
                <textarea
                  rows={3}
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Contoh: Dokumen SOP Cuti telah diperbarui ke versi 2 dengan mencantumkan Permen terbaru."
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedFb(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Reviu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
