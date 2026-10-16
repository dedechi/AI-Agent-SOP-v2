import React, { useState, useEffect } from 'react';
import type { User, Team, Document } from './types/index.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { AgentPage } from './pages/AgentPage.tsx';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage.tsx';
import { DocumentDetailPage } from './pages/DocumentDetailPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { FeedbackPage } from './pages/FeedbackPage.tsx';
import { UsersTeamsPage } from './pages/UsersTeamsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('agent');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [targetDocForAgent, setTargetDocForAgent] = useState<Document | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load session user and teams
  const fetchSession = async () => {
    setIsLoadingUser(true);
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/session/user'),
        fetch('/api/teams'),
      ]);
      const uData = await uRes.json();
      const tData = await tRes.json();

      setCurrentUser(uData.user);
      setAvailableUsers(uData.availableUsers || []);
      setTeams(tData.teams || []);
    } catch (err) {
      console.error('Failed to load session user', err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/session/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        // If current tab is restricted and user is now regular User, route back to agent
        if (
          data.user.role === 'User' &&
          ['dashboard', 'feedback', 'users_teams', 'settings'].includes(currentTab)
        ) {
          setCurrentTab('agent');
        }
      }
    } catch (err) {
      console.error('Failed to switch user', err);
    }
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setCurrentTab('document_detail');
  };

  const handleAskDocument = (doc: Document) => {
    setTargetDocForAgent(doc);
    setCurrentTab('agent');
  };

  if (isLoadingUser || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg animate-pulse">
          SOP
        </div>
        <p className="text-sm font-semibold tracking-wide">Memuat Sistem AI Agent SOP & Regulasi...</p>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'agent':
        return 'Tanya Agent SOP & Regulasi';
      case 'knowledge_base':
        return 'Katalog Knowledge Base';
      case 'document_detail':
        return 'Detail Dokumen & Riwayat Versi';
      case 'dashboard':
        return 'Dasbor Pembaruan & Evaluasi';
      case 'feedback':
        return 'Umpan Balik & Evaluasi AI';
      case 'users_teams':
        return 'Manajemen Tim & Pengguna';
      case 'settings':
        return 'Pengaturan & Integrasi JDIH';
      default:
        return 'AI Agent SOP';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'document_detail') setSelectedDocId(null);
        }}
        currentUser={currentUser}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header */}
        <Header
          currentUser={currentUser}
          availableUsers={availableUsers}
          onSwitchUser={handleSwitchUser}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          title={getPageTitle()}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-x-hidden">
          {currentTab === 'agent' && (
            <AgentPage
              currentUser={currentUser}
              onNavigateToDocument={handleSelectDocument}
              targetDoc={targetDocForAgent}
              onClearTargetDoc={() => setTargetDocForAgent(null)}
            />
          )}

          {currentTab === 'knowledge_base' && (
            <KnowledgeBasePage
              currentUser={currentUser}
              teams={teams}
              onSelectDocument={handleSelectDocument}
              onAskDocument={handleAskDocument}
            />
          )}

          {currentTab === 'document_detail' && selectedDocId && (
            <DocumentDetailPage
              documentId={selectedDocId}
              currentUser={currentUser}
              teams={teams}
              onBack={() => setCurrentTab('knowledge_base')}
              onAskDocument={handleAskDocument}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              onNavigateToDocument={handleSelectDocument}
              onNavigateToFeedback={() => setCurrentTab('feedback')}
            />
          )}

          {currentTab === 'feedback' && <FeedbackPage currentUser={currentUser} />}

          {currentTab === 'users_teams' && <UsersTeamsPage currentUser={currentUser} />}

          {currentTab === 'settings' && <SettingsPage currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
}
