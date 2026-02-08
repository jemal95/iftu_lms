
import React, { useState } from 'react';
import { GraduationCap, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight, HelpCircle, Check, Loader2, Monitor, RefreshCw, Maximize, ChevronRight, ShieldCheck } from 'lucide-react';
import { AuthUser, ADMIN_PROFILE } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false); 
  const [resetSent, setResetSent] = useState(false);
  const { t } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === '_admin' && password === '_admin123') {
        const adminUser: AuthUser = {
          id: 'admin-main',
          name: ADMIN_PROFILE.NAME,
          email: ADMIN_PROFILE.EMAIL,
          avatar: 'https://picsum.photos/seed/admin/100/100',
          role: 'Admin'
        };
        onLogin(adminUser);
      } 
      else if (username === '_teacher' && password === '_teacher123') {
        const teacherUser: AuthUser = {
          id: 'teacher-main',
          name: 'Senior Instructor',
          email: 'teacher@iftu.edu',
          avatar: 'https://picsum.photos/seed/teacher/100/100',
          role: 'Teacher'
        };
        onLogin(teacherUser);
      }
      else if (username === '_Iftu' && password === '_123456') {
        const guestUser: AuthUser = {
          id: `guest-${Date.now()}`,
          name: 'New Applicant',
          email: 'guest@iftu.edu',
          avatar: 'https://picsum.photos/seed/guest/100/100',
          role: 'Student'
        };
        onLogin(guestUser);
      } 
      else {
        setError('Access Denied. Verify credentials.');
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleAutoFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setShowInfo(false);
  };

  const handleForgotPassword = () => {
    if (!username) {
        setError('Enter username to reset.');
        return;
    }
    setResetSent(true);
    setTimeout(() => setResetSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col font-sans relative overflow-hidden text-slate-600">
      
      {/* Top Status Bar */}
      <div className="h-12 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-20 absolute top-0 w-full">
         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IFTU LMS - Modern Learning Platform</span>
         <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
               <Monitor size={12} />
               <span className="text-[10px] font-bold">Device</span>
            </div>
            <RefreshCw size={12} className="cursor-pointer hover:text-slate-600 transition-colors" />
            <Maximize size={12} className="cursor-pointer hover:text-slate-600 transition-colors" />
         </div>
      </div>

      {/* Background Mesh (Subtle) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-100/40 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo Section */}
        <div className="text-center space-y-6">
           <div className="w-24 h-24 bg-gradient-to-b from-[#3b82f6] to-[#2563eb] rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto transform hover:scale-105 transition-transform duration-500 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              <GraduationCap size={48} className="text-white drop-shadow-md" strokeWidth={1.5} />
           </div>
           <div className="space-y-1">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">IFTU LMS</h1>
              <p className="text-slate-500 font-bold text-sm tracking-wide">Advanced Institutional Learning Portal</p>
           </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] p-10 w-full max-w-[440px] border border-slate-100 relative overflow-hidden">
           
           <div className="text-center mb-8 space-y-1">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Secure Sign In</h2>
              <p className="text-[11px] font-bold text-slate-400">Access your personalized dashboard.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Username / ID</label>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563eb] transition-colors">
                       <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. _Iftu"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 text-sm placeholder:text-slate-400 placeholder:font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center ml-3 mr-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-[#2563eb] hover:underline">
                        {resetSent ? <span className="text-emerald-500 flex items-center gap-1"><Check size={10} /> Sent</span> : 'Forgot Password?'}
                    </button>
                 </div>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563eb] transition-colors">
                       <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 text-sm placeholder:text-slate-400 placeholder:font-medium"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                 </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[11px] font-bold animate-in slide-in-from-top-1">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || !username || !password}
                className="w-full py-4 bg-gradient-to-r from-[#3b82f6] to-[#0090C1] hover:from-blue-600 hover:to-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                   <>
                     <Loader2 size={16} className="animate-spin" />
                     Authenticating...
                   </>
                ) : (
                   <>
                     Access Portal <ArrowRight size={16} />
                   </>
                )}
              </button>
           </form>

           <div className="mt-8 flex flex-col items-center gap-4">
              <button 
                 onClick={() => setShowInfo(!showInfo)}
                 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                 <HelpCircle size={12} /> Login Help & Credentials
              </button>

              {showInfo && (
                 <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                    <CredentialRow role="Admin" user="_admin" pass="_admin123" color="text-sky-600" onClick={() => handleAutoFill('_admin', '_admin123')} />
                    <CredentialRow role="Teacher" user="_teacher" pass="_teacher123" color="text-emerald-600" onClick={() => handleAutoFill('_teacher', '_teacher123')} />
                    <CredentialRow role="Student" user="_Iftu" pass="_123456" color="text-indigo-600" onClick={() => handleAutoFill('_Iftu', '_123456')} />
                 </div>
              )}

              <div className="px-4 py-2 bg-sky-50 text-[#0090C1] rounded-full border border-sky-100 flex items-center gap-2">
                 <ShieldCheck size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Secure TLS Encryption</span>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const CredentialRow: React.FC<{ role: string, user: string, pass: string, color: string, onClick: () => void }> = ({ role, user, pass, color, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between bg-white p-2 px-3 rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer group transition-all"
  >
     <span className={`text-[10px] font-black uppercase ${color}`}>{role}</span>
     <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
       <span>{user}</span>
       <span className="text-slate-300">/</span>
       <span>••••</span>
       <ChevronRight size={10} className="text-slate-300 group-hover:text-blue-500" />
     </div>
  </div>
);
