import React, { useState } from 'react';
import { Bell, Search, Settings, HelpCircle, LogOut, User, Check, Clock, Sparkles, Facebook, Youtube, Send } from 'lucide-react';
import { AuthUser, NavSection, SOCIAL_LINKS } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New Course Published', text: 'Advanced UI Design is now live.', time: '2m ago', type: 'info' },
  { id: 2, title: 'Exam Starting Soon', text: 'Ethics Midterm starts in 30 minutes.', time: '15m ago', type: 'alert' },
  { id: 3, title: 'System Update', text: 'AI Assistant features have been upgraded.', time: '1h ago', type: 'ai' },
];

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Social Media Links (Left of Notifications) */}
        <div className="hidden md:flex items-center gap-2 mr-2">
           <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-all">
             <Send size={16} className="-ml-0.5 mt-0.5" />
           </a>
           <a href={SOCIAL_LINKS.FACEBOOK} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all">
             <Facebook size={16} />
           </a>
           <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all">
             <Youtube size={16} />
           </a>
        </div>
        
        <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden md:block"></div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={`p-2 rounded-full relative transition-all ${showNotifications ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl py-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-6 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('notifications')}</h3>
                  <button className="text-[10px] font-bold text-sky-600 hover:underline">{t('mark_read')}</button>
                </div>
                <div className="max-h-[320px] overflow-y-auto px-2">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group flex gap-3 items-start">
                      <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                        n.type === 'ai' ? 'bg-purple-50 text-purple-500' :
                        n.type === 'alert' ? 'bg-amber-50 text-amber-500' :
                        'bg-sky-50 text-sky-500'
                      }`}>
                        {n.type === 'ai' ? <Sparkles size={14} /> : n.type === 'alert' ? <Clock size={14} /> : <Check size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.text}</p>
                        <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 mt-4 pt-4 border-t border-slate-50">
                   <button className="w-full py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                     {t('view_all')}
                   </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
          <HelpCircle size={20} />
        </button>
        <button 
          onClick={() => onNavigate(NavSection.PROFILE)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings size={20} />
        </button>
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 pl-2 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">{user.name}</p>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-sky-200 transition-all">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('account')}</p>
                </div>
                <button 
                  onClick={() => {
                    onNavigate(NavSection.PROFILE);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <User size={16} />
                  {t('profile')}
                </button>
                <button 
                  onClick={() => {
                    onNavigate(NavSection.PROFILE);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} />
                  {t('preferences')}
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1 font-semibold transition-colors"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
