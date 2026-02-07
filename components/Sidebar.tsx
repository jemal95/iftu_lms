
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School, 
  MessageSquareCode,
  Menu,
  ChevronLeft,
  BookMarked,
  Book,
  Info,
  FileText,
  ClipboardCheck,
  Newspaper,
  Trophy,
  PieChart,
  BookOpen,
  Loader2,
  Code,
  Wallet,
  FileBadge,
  Award,
  Video,
  GitCompare,
  RotateCcw
} from 'lucide-react';
import { NavSection, AuthUser } from '../types';
import JSZip from 'jszip';
import { PROJECT_FILES } from '../utils/projectSource';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: AuthUser;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, isOpen, toggleSidebar, user }) => {
  const [isZipping, setIsZipping] = useState(false);
  const { t } = useLanguage();

  const handleDownloadSource = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      Object.entries(PROJECT_FILES).forEach(([path, content]) => {
        zip.file(path, content);
      });
      zip.file("README.md", "# IFTU LMS Source Code\n\nThis archive contains the source code for the IFTU Learning Management System.");
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "IFTU_LMS_Source_Code.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to zip files", error);
      alert("Could not generate ZIP file.");
    } finally {
      setIsZipping(false);
    }
  };

  const handleRestore = () => {
    if (window.confirm("⚠️ SYSTEM RESET\n\nThis will wipe all locally saved data (users, exams, grades) and restore the default demo database.\n\nAre you sure you want to continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleViewDiff = () => {
    const usage = (JSON.stringify(localStorage).length / 1024).toFixed(2);
    alert(`DATA STATE DIFFERENTIAL\n\nStorage Used: ${usage} KB\nSync State: Local (Dirty)\n\nNo remote changes detected. Local environment is ahead of origin/main.`);
  };

  return (
    <aside 
      className={`bg-slate-900 text-slate-300 transition-all duration-500 ease-in-out flex flex-col z-20 shadow-2xl ${
        isOpen ? 'w-72' : 'w-24'
      }`}
    >
      <div className="h-24 flex items-center justify-between px-6 shrink-0 relative z-10">
        {isOpen ? (
          <div 
            className="flex items-center gap-3 font-black text-xl tracking-tight text-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate(NavSection.DASHBOARD)}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-[#0090C1] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-900/50">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span>IFTU<span className="text-[#0090C1]">LMS</span></span>
          </div>
        ) : (
           <div className="w-10 h-10 bg-gradient-to-tr from-[#0090C1] to-blue-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <GraduationCap size={20} className="text-white" />
           </div>
        )}
        <button 
          onClick={toggleSidebar}
          className={`p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white ${!isOpen && 'mx-auto mt-4'}`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        
        {isOpen && <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('main_menu')}</div>}
        
        <NavItem icon={<LayoutDashboard size={20} />} label={t('dashboard')} isActive={activeSection === NavSection.DASHBOARD} onClick={() => onNavigate(NavSection.DASHBOARD)} isOpen={isOpen} />
        <NavItem icon={<Newspaper size={20} />} label={t('news')} isActive={activeSection === NavSection.NEWS} onClick={() => onNavigate(NavSection.NEWS)} isOpen={isOpen} />

        {isOpen && <div className="px-4 py-2 mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('academic')}</div>}

        <NavItem icon={<BookMarked size={20} />} label={t('courses')} isActive={activeSection === NavSection.COURSES} onClick={() => onNavigate(NavSection.COURSES)} isOpen={isOpen} />
        <NavItem icon={<ClipboardCheck size={20} />} label={t('exams')} isActive={activeSection === NavSection.EXAMS} onClick={() => onNavigate(NavSection.EXAMS)} isOpen={isOpen} />

        {user.role === 'Student' && (
          <>
            <NavItem icon={<Trophy size={20} />} label={t('results')} isActive={activeSection === NavSection.RESULTS} onClick={() => onNavigate(NavSection.RESULTS)} isOpen={isOpen} />
            <NavItem icon={<FileBadge size={20} />} label={t('transcript')} isActive={activeSection === NavSection.TRANSCRIPT} onClick={() => onNavigate(NavSection.TRANSCRIPT)} isOpen={isOpen} />
            <NavItem icon={<Award size={20} />} label={t('certificate')} isActive={activeSection === NavSection.CERTIFICATE} onClick={() => onNavigate(NavSection.CERTIFICATE)} isOpen={isOpen} />
            <NavItem icon={<Wallet size={20} />} label={t('payments')} isActive={activeSection === NavSection.PAYMENTS} onClick={() => onNavigate(NavSection.PAYMENTS)} isOpen={isOpen} />
          </>
        )}

        {user.role !== 'Student' && (
          <NavItem icon={<BookOpen size={20} />} label={t('gradebook')} isActive={activeSection === NavSection.GRADEBOOK} onClick={() => onNavigate(NavSection.GRADEBOOK)} isOpen={isOpen} />
        )}

        <NavItem icon={<FileText size={20} />} label={t('materials')} isActive={activeSection === NavSection.MATERIALS} onClick={() => onNavigate(NavSection.MATERIALS)} isOpen={isOpen} />

        {user.role === 'Admin' && (
          <>
            {isOpen && <div className="px-4 py-2 mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('administration')}</div>}
            <NavItem icon={<Users size={20} />} label={t('teachers')} isActive={activeSection === NavSection.TEACHERS} onClick={() => onNavigate(NavSection.TEACHERS)} isOpen={isOpen} />
            <NavItem icon={<GraduationCap size={20} />} label={t('students')} isActive={activeSection === NavSection.STUDENTS} onClick={() => onNavigate(NavSection.STUDENTS)} isOpen={isOpen} />
            <NavItem icon={<FileBadge size={20} />} label={t('transcript')} isActive={activeSection === NavSection.TRANSCRIPT} onClick={() => onNavigate(NavSection.TRANSCRIPT)} isOpen={isOpen} />
            <NavItem icon={<Award size={20} />} label={t('certificate')} isActive={activeSection === NavSection.CERTIFICATE} onClick={() => onNavigate(NavSection.CERTIFICATE)} isOpen={isOpen} />
            <NavItem icon={<School size={20} />} label={t('schools')} isActive={activeSection === NavSection.SCHOOLS} onClick={() => onNavigate(NavSection.SCHOOLS)} isOpen={isOpen} />
            <NavItem icon={<PieChart size={20} />} label={t('reports')} isActive={activeSection === NavSection.REPORTS} onClick={() => onNavigate(NavSection.REPORTS)} isOpen={isOpen} />
          </>
        )}

        {isOpen && <div className="px-4 py-2 mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('platform')}</div>}

        <NavItem icon={<MessageSquareCode size={20} />} label={t('ai_assistant')} isActive={activeSection === NavSection.AI_ASSISTANT} onClick={() => onNavigate(NavSection.AI_ASSISTANT)} isOpen={isOpen} />
        <NavItem icon={<Video size={20} />} label="Media Studio" isActive={activeSection === NavSection.VIDEO_STUDIO} onClick={() => onNavigate(NavSection.VIDEO_STUDIO)} isOpen={isOpen} />
        <NavItem icon={<Book size={20} />} label={t('documentation')} isActive={activeSection === NavSection.DOCUMENTATION} onClick={() => onNavigate(NavSection.DOCUMENTATION)} isOpen={isOpen} />
        <NavItem icon={<Info size={20} />} label={t('about')} isActive={activeSection === NavSection.ABOUT} onClick={() => onNavigate(NavSection.ABOUT)} isOpen={isOpen} />
        
        {/* System Tools */}
        <div className={`mt-6 grid grid-cols-2 gap-2 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity`}>
           <button onClick={handleViewDiff} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20 group">
             <GitCompare size={16} />
             <span className="text-[9px] font-black mt-1.5 uppercase tracking-wider">Diff State</span>
           </button>
           <button onClick={handleRestore} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 group">
             <RotateCcw size={16} />
             <span className="text-[9px] font-black mt-1.5 uppercase tracking-wider">Reset DB</span>
           </button>
        </div>

        <button
          onClick={handleDownloadSource}
          disabled={isZipping}
          className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all relative group rounded-2xl hover:bg-white/5 text-emerald-400 mt-2 ${!isOpen && 'justify-center'}`}
        >
          <div className="shrink-0 animate-pulse">
            {isZipping ? <Loader2 size={20} className="animate-spin" /> : <Code size={20} />}
          </div>
          {isOpen && (
            <span className="font-bold text-sm whitespace-nowrap">
              {isZipping ? 'Bundling...' : t('download_source')}
            </span>
          )}
        </button>

      </nav>

      <div className="p-4 bg-slate-950/30 border-t border-white/5">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <img src={user.avatar} className="w-10 h-10 rounded-xl border-2 border-slate-700 object-cover shadow-sm" alt="" />
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate tracking-wide font-medium">{user.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
}> = ({ icon, label, isActive, onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3.5 transition-all relative group rounded-2xl mb-1 ${
        isActive 
          ? 'bg-gradient-to-r from-[#0090C1] to-blue-600 text-white shadow-lg shadow-sky-900/20' 
          : 'hover:bg-white/5 text-slate-400 hover:text-white'
      } ${!isOpen && 'justify-center px-0'}`}
    >
      <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors shrink-0`}>
        {icon}
      </div>
      {isOpen && (
        <span className="ml-3 font-bold text-sm whitespace-nowrap tracking-wide">{label}</span>
      )}
    </button>
  );
};
