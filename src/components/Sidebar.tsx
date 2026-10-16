import React from 'react';
import {
  Bot,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  ShieldCheck,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { User } from '../types/index.ts';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isSuperAdmin = currentUser.role === 'Super Admin';
  const isAdminTim = currentUser.role === 'Admin Tim';
  const canAccessAdmin = isSuperAdmin || isAdminTim;

  const navItems = [
    {
      id: 'agent',
      label: 'Tanya Agent',
      icon: Bot,
      access: true,
      badge: 'Utama',
    },
    {
      id: 'knowledge_base',
      label: 'Knowledge Base',
      icon: BookOpen,
      access: true,
    },
    {
      id: 'dashboard',
      label: 'Dasbor Pembaruan',
      icon: LayoutDashboard,
      access: canAccessAdmin,
    },
    {
      id: 'feedback',
      label: 'Umpan Balik & Reviu',
      icon: MessageSquare,
      access: canAccessAdmin,
    },
    {
      id: 'users_teams',
      label: 'Tim & Pengguna',
      icon: Users,
      access: canAccessAdmin,
    },
    {
      id: 'settings',
      label: 'Pengaturan & JDIH',
      icon: Settings,
      access: canAccessAdmin,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white leading-tight">
              AI Agent SOP
            </h1>
            <p className="text-[11px] text-blue-400 font-medium tracking-wider uppercase">
              dan Regulasi Instansi
            </p>
          </div>
        </div>

        {/* User Scope / Role Indicator */}
        <div className="mx-3 my-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Lingkup Akses
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                isSuperAdmin
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                  : isAdminTim
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{currentUser.position || 'Pegawai Instansi'}</p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu Utama
          </div>

          {navItems
            .filter((item) => item.access)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 font-semibold border border-blue-400/30">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-200 opacity-80" />
                  ) : null}
                </button>
              );
            })}
        </nav>

        {/* Integration Links / Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              JDIH Komdigi Live
            </span>
            <a
              href="https://jdih.komdigi.go.id"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="pt-1 text-[10px] text-slate-500 text-center">
            AI Agent SOP v2.4 • Komdigi RI
          </div>
        </div>
      </aside>
    </>
  );
};
