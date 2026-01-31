// This file contains the source code of the project to enable the "Download Source" feature.

export const PROJECT_FILES: Record<string, string> = {
  'metadata.json': `{
  "name": "IFTU LMS - Modern Learning Platform",
  "description": "A comprehensive Learning Management System with AI-powered student assistance, user management, and performance tracking.",
  "requestFramePermissions": [
    "camera",
    "microphone",
    "geolocation"
  ]
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IFTU LMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
<script type="importmap">
{
  "imports": {
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "@google/genai": "https://esm.sh/@google/genai@^1.35.0",
    "recharts": "https://esm.sh/recharts@^3.6.0",
    "lucide-react": "https://esm.sh/lucide-react@^0.562.0",
    "marked": "https://esm.sh/marked@^12.0.0",
    "jszip": "https://esm.sh/jszip@^3.10.1"
  }
}
</script>
</head>
<body class="bg-gray-50 text-gray-900">
    <div id="root"></div>
</body>
</html>`,
  'types.ts': `
export const SOCIAL_LINKS = {
  TELEGRAM: 'https://t.me/jemal9056',
  FACEBOOK: 'https://facebook.com/jemal_fano',
  YOUTUBE: 'https://www.youtube.com/@soof-umarmedia256'
};

export const ADMIN_PROFILE = {
  NAME: 'Jemal Fano',
  EMAIL: 'admin@iftu.edu'
};

export enum NavSection {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  TEACHERS = 'TEACHERS',
  STUDENTS = 'STUDENTS',
  SCHOOLS = 'SCHOOLS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  DOCUMENTATION = 'DOCUMENTATION',
  PROFILE = 'PROFILE',
  ABOUT = 'ABOUT',
  EXAMS = 'EXAMS',
  MATERIALS = 'MATERIALS',
  NEWS = 'NEWS',
  RESULTS = 'RESULTS',
  GRADEBOOK = 'GRADEBOOK',
  REPORTS = 'REPORTS'
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Teacher' | 'Student';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Teacher' | 'Student' | 'Admin';
  status: 'Active' | 'Inactive';
  joinDate: string;
  avatar: string;
  department: string;
  phone?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  students: number;
  progress: number;
  category: string;
  image: string;
  description?: string;
  objectives?: string[];
  prerequisites?: string[];
  duration?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; 
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  date: string;
  duration: string; 
  totalQuestions: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  questions?: Question[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  total: number;
  date: string;
  answers: Record<string, number>;
}

export interface Material {
  id: string;
  title: string;
  type: 'Note' | 'Document' | 'Video' | 'Link';
  courseTitle: string;
  uploadDate: string;
  size?: string;
  author: string;
}

export interface School {
  id: string;
  name: string;
  location: string;
  students: number;
  phone: string;
  web: string;
  type: 'Central' | 'Branch' | 'Hub' | 'Online';
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  image: string;
  category: 'Update' | 'Event' | 'Institutional';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StudentResult {
  id: string;
  examTitle: string;
  courseTitle: string;
  score: number;
  total: number;
  grade: string;
  date: string;
  status: 'Pass' | 'Fail';
}

export interface GradeEntry {
  studentId: string;
  studentName: string;
  avatar: string;
  examResults: StudentResult[];
  overallGpa: number;
}`,
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  'App.tsx': `import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { UserListView } from './components/UserListView';
import { CoursesView } from './components/CoursesView';
import { SchoolsView } from './components/SchoolsView';
import { AIAssistant } from './components/AIAssistant';
import { LoginView } from './components/LoginView';
import { DocumentationView } from './components/DocumentationView';
import { ProfileView } from './components/ProfileView';
import { AboutView } from './components/AboutView';
import { ExamsView } from './components/ExamsView';
import { MaterialsView } from './components/MaterialsView';
import { NewsView } from './components/NewsView';
import { ResultsView } from './components/ResultsView';
import { GradebookView } from './components/GradebookView';
import { ReportsView } from './components/ReportsView';
import { NavSection, AuthUser } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
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
        return <UserListView role="Teacher" />;
      case NavSection.STUDENTS:
        return <UserListView role="Student" />;
      case NavSection.SCHOOLS:
        return <SchoolsView />;
      case NavSection.AI_ASSISTANT:
        return <AIAssistant />;
      case NavSection.DOCUMENTATION:
        return <DocumentationView onBack={() => setActiveSection(NavSection.DASHBOARD)} />;
      case NavSection.PROFILE:
        return <ProfileView user={currentUser} onUpdate={handleUpdateProfile} />;
      case NavSection.ABOUT:
        return <AboutView />;
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
      default:
        return <DashboardView onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f7f9] overflow-hidden font-sans">
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={setActiveSection} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        user={currentUser}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={currentUser} 
          onLogout={handleLogout} 
          onNavigate={setActiveSection} 
        />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;`
};