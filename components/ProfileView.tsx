import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Check, 
  Lock, 
  Smartphone, 
  Globe,
  Bell,
  Trash2,
  AlertTriangle,
  Facebook,
  Youtube,
  Send,
  Languages
} from 'lucide-react';
import { AuthUser, SOCIAL_LINKS } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileViewProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onUpdate({
        ...user,
        name,
        email
      });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'om' : 'en');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <Check size={20} />
            <span className="font-bold text-sm">Profile updated successfully!</span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t('profile')}</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center relative z-10">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative z-10">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0090C1] text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white z-20">
                <Camera size={18} />
              </button>

              {/* Social Media Icons */}
              <div className="absolute -top-4 -right-14 flex flex-col gap-3 z-30">
                <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#229ED9] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform border-2 border-white hover:shadow-xl" title="Telegram">
                  <Send size={15} className="-ml-0.5 mt-0.5" />
                </a>
                <a href={SOCIAL_LINKS.FACEBOOK} target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform border-2 border-white hover:shadow-xl" title="Facebook">
                  <Facebook size={15} />
                </a>
                <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#FF0000] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform border-2 border-white hover:shadow-xl" title="YouTube">
                  <Youtube size={15} />
                </a>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-400 font-medium">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 text-[#0090C1] text-[10px] font-black rounded-full uppercase tracking-widest border border-sky-100">
                <Shield size={12} />
                {user.role} Access
              </div>
            </div>

            <div className="w-full pt-8 mt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</p>
                <p className="text-sm font-bold text-gray-700 mt-1">Oct 2024</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">UserID</p>
                <p className="text-sm font-bold text-gray-700 mt-1">#{user.id.split('-')[0]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('preferences')}</h4>
            
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-[#0090C1] hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#0090C1] group-hover:text-white" />
                <span className="text-sm font-bold">{t('language_settings')}</span>
              </div>
              <span className="text-[10px] font-bold opacity-60 flex items-center gap-1">
                 {language === 'en' ? 'English' : 'Afaan Oromoo'} <Languages size={14} />
              </span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-[#0090C1] hover:text-white transition-all group">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#0090C1] group-hover:text-white" />
                <span className="text-sm font-bold">{t('notifications')}</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            </button>
          </div>
        </div>

        {/* Right Column - Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
              <User className="text-[#0090C1]" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-medium text-gray-700" 
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-medium text-gray-700" 
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-10 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[180px]"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Section */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
              <Lock className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Security & Privacy</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                    <Lock size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Password</p>
                    <p className="text-xs text-gray-400 font-medium">Last updated 3 months ago</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">2FA Authentication</p>
                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Active & Protected</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Configure
                </button>
              </div>

              <div className="pt-4">
                <div className="p-8 border-2 border-dashed border-red-100 rounded-[2rem] bg-red-50/20 space-y-4">
                  <div className="flex items-center gap-3 text-red-500">
                    <AlertTriangle size={20} />
                    <h4 className="text-sm font-bold uppercase tracking-widest">Danger Zone</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                    Once you delete your account, there is no going back. Please be certain before proceeding with institutional data removal.
                  </p>
                  <button className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 border border-red-100">
                    <Trash2 size={16} />
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
