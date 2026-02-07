
import React, { useState } from 'react';
import { GraduationCap, LogIn, ShieldCheck, Info, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight, HelpCircle, Check } from 'lucide-react';
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

    // Simulate network delay
    setTimeout(() => {
      // 1. Admin Credentials
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
      // 2. Teacher Credentials
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
      // 3. Default/Guest Credentials (for Students/New Users)
      else if (username === '_Iftu' && password === '_123456') {
        const guestUser: AuthUser = {
          id: `guest-${Date.now()}`,
          name: 'New Applicant',
          email: 'guest@iftu.edu',
          avatar: 'https://picsum.photos/seed/guest/100/100',
          role: 'Student' // Defaulting to Student view for read-only/structure access
        };
        onLogin(guestUser);
      } 
      // 4. Fallback/Error
      else {
        setError('Invalid credentials. Please check your username and password.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleForgotPassword = () => {
    if (!username) {
        setError('Please enter your username to reset password.');
        return;
    }
    setResetSent(true);
    setTimeout(() => setResetSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-indigo-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-300/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-6 duration-1000 text-center relative z-10">
        <div className="w-28 h-28 bg-gradient-to-tr from-[#0090C1] to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-sky-500/30 mb-6 border-[6px] border-white/20 backdrop-blur-sm transform hover:scale-105 transition-transform duration-500">
          <GraduationCap size={56} strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight drop-shadow-sm">IFTU LMS</h1>
        <p className="text-slate-500 text-lg mt-3 font-medium max-w-lg leading-relaxed tracking-wide">
          Advanced Institutional Learning Portal
        </p>
      </div>

      <div className="max-w-[440px] w-full bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 animate-in fade-in zoom-in duration-500 border border-white/60 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Secure Sign In</h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">Access your personalized dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / ID</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0090C1] transition-colors" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. _Iftu"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-[#0090C1] transition-all font-bold text-slate-700 text-sm placeholder:font-medium placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold text-[#0090C1] hover:underline">
                    {resetSent ? <span className="text-emerald-500 flex items-center gap-1"><Check size={10} /> Sent!</span> : 'Forgot Password?'}
                </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0090C1] transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-[#0090C1] transition-all font-bold text-slate-700 text-sm placeholder:font-medium placeholder:text-slate-300"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold animate-in slide-in-from-top-2 border border-rose-100">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !username || !password}
            className="w-full py-4 bg-[#0090C1] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#007ba6] transition-all shadow-xl shadow-sky-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="animate-pulse">Verifying...</span>
              </>
            ) : (
              <>
                Access Portal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-[#0090C1] transition-colors group"
          >
            <HelpCircle size={14} className="group-hover:scale-110 transition-transform" />
            Login Help & Credentials
          </button>
          
          {showInfo && (
            <div className="bg-slate-50 p-6 rounded-2xl w-full text-left space-y-3 border border-slate-100 animate-in fade-in slide-in-from-bottom-2 shadow-inner">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-[#0090C1] uppercase">Admin</span>
                 <code className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">_admin / _admin123</code>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-emerald-500 uppercase">Teacher</span>
                 <code className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">_teacher / _teacher123</code>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-indigo-500 uppercase">Student</span>
                 <code className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">_Iftu / _123456</code>
               </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] font-black text-[#0090C1] uppercase tracking-[0.15em] bg-sky-50 px-6 py-2 rounded-full border border-sky-100 shadow-sm mt-2 opacity-80">
            <ShieldCheck size={14} />
            Secure TLS Encryption
          </div>
        </div>
      </div>
    </div>
  );
};
