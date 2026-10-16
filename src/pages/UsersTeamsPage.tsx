import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, CheckCircle2, XCircle, Building2, UserPlus } from 'lucide-react';
import type { User, Team } from '../types/index.ts';

interface UsersTeamsPageProps {
  currentUser: User;
}

export const UsersTeamsPage: React.FC<UsersTeamsPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const fetchData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([fetch('/api/users'), fetch('/api/teams')]);
      const uData = await uRes.json();
      const tData = await tRes.json();
      setUsers(uData.users || []);
      setTeams(tData.teams || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTeamName = (teamId: string) => {
    const t = teams.find((item) => item.id === teamId);
    return t ? t.name : teamId;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Manajemen Tim & Pengguna Instansi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengaturan peran RBAC instansi (Super Admin, Admin Tim, Pegawai User) dan penetapan anggota unit kerja.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Daftar Pengguna ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'teams'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Daftar Tim Unit Kerja ({teams.length})
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nama Pegawai & NIP</th>
                  <th className="px-3 py-3">Akun Posel Resmi</th>
                  <th className="px-3 py-3">Jabatan</th>
                  <th className="px-3 py-3">Peran Akses</th>
                  <th className="px-3 py-3">Unit Tim</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NIP: {u.nip || '-'}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{u.position || '-'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === 'Super Admin'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : u.role === 'Admin Tim'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                      {u.teamIds.map((tid) => getTeamName(tid)).join(', ') || '-'}
                    </td>
                    <td className="px-3 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Nonaktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
                      Kode: {t.code}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">{t.description}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500">
                <span>
                  Admin Tim: <strong>{t.adminUserIds.length}</strong>
                </span>
                <span>
                  Total Anggota: <strong>{t.memberUserIds.length}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
