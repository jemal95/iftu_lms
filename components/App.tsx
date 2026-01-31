
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
  // Set default section to DASHBOARD instead of VIDEO_STUDIO
  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
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
    // Redirect to Dashboard after login
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
      <div className="h-screen w-full flex items-center justify-center bg-[#f4f7f9]">
        <div className="w-12 h-12 border-4 border-[#0090C1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case NavSection.DASHBOARD:
        return <DashboardView onNavigate={setActiveSection} />;
      case NavSection.COURSES:
        return <CoursesView />;
      case NavSection.TEACHERS:
        return <UserListView role="Teacher" currentUser={currentUser} />;
      case NavSection.STUDENTS:
        return <UserListView role="Student" currentUser={currentUser} />;
      case NavSection.SCHOOLS:
        return <SchoolsView />;
      case NavSection.AI_ASSISTANT:
        return <AIAssistant user={currentUser} />;
      case NavSection.VIDEO_STUDIO:
        return <VideoStudioView user={currentUser} />;
      case NavSection.DOCUMENTATION:
        return <DocumentationView onBack={() => setActiveSection(NavSection.DASHBOARD)} />;
      case NavSection.PROFILE:
        return <ProfileView user={currentUser} onUpdate={handleUpdateProfile} />;
      case NavSection.ABOUT:
        return <AboutView onNavigate={setActiveSection} />;
      case NavSection.EXAMS:
        return <ExamsView user={currentUser} />;
      case NavSection.MATERIALS:
        return <MaterialsView user={currentUser} />;
      case NavSection.NEWS:
        return <NewsView user={currentUser} />;
      case NavSection.RESULTS:
        return <ResultsView user={currentUser} />;
      case NavSection.GRADEBOOK:
        return <GradebookView user={currentUser} />;
      case NavSection.REPORTS:
        return <ReportsView user={currentUser} />;
      case NavSection.PAYMENTS:
        return <PaymentsView user={currentUser} />;
      case NavSection.TRANSCRIPT:
        return <TranscriptView user={currentUser} />;
      case NavSection.CERTIFICATE:
        return <CertificateView user={currentUser} />;
      default:
        return <DashboardView onNavigate={setActiveSection} />;
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
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          onNavigate={setActiveSection} 
        />
        <main className="flex-1 overflow-y-auto scroll-smooth w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
