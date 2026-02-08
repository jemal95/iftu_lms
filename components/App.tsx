import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from './DashboardView';
import { UserListView } from './UserListView';
import { CoursesView } from './CoursesView';
import { SchoolsView } from './SchoolsView';
import { AIAssistant } from './AIAssistant';
import { VideoStudioView } from './VideoStudioView';
import { LoginView } from './LoginView';
import { DocumentationView } from './DocumentationView';
import { ProfileView } from './ProfileView';
import { AboutView } from './AboutView';
import { ExamsView } from './ExamsView';
import { MaterialsView } from './MaterialsView';
import { NewsView } from './NewsView';
import { ResultsView } from './ResultsView';
import { GradebookView } from './GradebookView';
import { ReportsView } from './ReportsView';
import { PaymentsView } from './PaymentsView';
import { TranscriptView } from './TranscriptView';
import { CertificateView } from './CertificateView';
import { NavSection, AuthUser } from '../types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('iftu_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to load user session");
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('iftu_user', JSON.stringify(user));
    setActiveSection(NavSection.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('iftu_user');
  };

  const handleUpdateProfile = (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('iftu_user', JSON.stringify(updatedUser));
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sky-500 font-black uppercase tracking-[0.3em] text-[10px]">Initializing IFTU LMS</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case NavSection.DASHBOARD: return <DashboardView onNavigate={setActiveSection} />;
      case NavSection.COURSES: return <CoursesView />;
      case NavSection.TEACHERS: return <UserListView role="Teacher" currentUser={currentUser} />;
      case NavSection.STUDENTS: return <UserListView role="Student" currentUser={currentUser} />;
      case NavSection.SCHOOLS: return <SchoolsView />;
      case NavSection.AI_ASSISTANT: return <AIAssistant user={currentUser} />;
      case NavSection.VIDEO_STUDIO: return <VideoStudioView user={currentUser} />;
      case NavSection.DOCUMENTATION: return <DocumentationView onBack={() => setActiveSection(NavSection.DASHBOARD)} />;
      case NavSection.PROFILE: return <ProfileView user={currentUser} onUpdate={handleUpdateProfile} />;
      case NavSection.ABOUT: return <AboutView onNavigate={setActiveSection} />;
      case NavSection.EXAMS: return <ExamsView user={currentUser} />;
      case NavSection.MATERIALS: return <MaterialsView user={currentUser} />;
      case NavSection.NEWS: return <NewsView user={currentUser} />;
      case NavSection.RESULTS: return <ResultsView user={currentUser} />;
      case NavSection.GRADEBOOK: return <GradebookView user={currentUser} />;
      case NavSection.REPORTS: return <ReportsView user={currentUser} />;
      case NavSection.PAYMENTS: return <PaymentsView user={currentUser} />;
      case NavSection.TRANSCRIPT: return <TranscriptView user={currentUser} />;
      case NavSection.CERTIFICATE: return <CertificateView user={currentUser} />;
      default: return <DashboardView onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#f4f7f9] overflow-hidden font-sans">
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={setActiveSection} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        user={currentUser}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header user={currentUser} onLogout={handleLogout} onNavigate={setActiveSection} />
        <main className="flex-1 overflow-hidden relative">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;