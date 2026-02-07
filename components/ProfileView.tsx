
import React, { useState, useRef, useEffect } from 'react';
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
  Languages,
  CreditCard,
  Download,
  X,
  QrCode,
  Building2,
  Palette,
  FileText,
  Settings,
  // Fix: Added missing Loader2 import
  Loader2
} from 'lucide-react';
import { AuthUser, SOCIAL_LINKS, InstitutionalBranding } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Signature } from './Signature';
import { db } from '../utils/persistence';
import { OfficialHeader } from './OfficialHeader';

interface ProfileViewProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'Account' | 'Branding' | 'Security'>('Account');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const idCardRef = useRef<HTMLDivElement>(null);

  // Branding State
  const [branding, setBranding] = useState<InstitutionalBranding>(db.getBranding());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ ...user, name, email });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      db.saveBranding(branding);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'om' : 'en');
  };

  const handleDownloadId = async () => {
    if (idCardRef.current && (window as any).html2pdf) {
      const element = idCardRef.current;
      const opt = {
        margin: 0,
        filename: `IFTU_ID_${user.id}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: [3.375, 2.125], orientation: 'landscape' }
      };
      await (window as any).html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showToast && (
        <div className="fixed top-20 right-8 z-[100] animate-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <Check size={24} />
            <span className="font-black text-sm uppercase tracking-widest">Registry Updated Successfully</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tighter">{t('profile')}</h2>
          <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
            <Settings size={16} className="text-[#0090C1]" /> Managed Core Settings
          </p>
        </div>
        <button 
          onClick={() => setShowIdCard(true)}
          className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all active:scale-95"
        >
          <CreditCard size={18} /> Digital ID Card
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
         {(['Account', ...(user.role === 'Admin' ? ['Branding'] : []), 'Security'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-[#0090C1] shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
               {tab}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Summary Card */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-8">
                <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-[6px] border-slate-50 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#0090C1] text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white z-20">
                  <Camera size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user.name}</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{user.email}</p>
              <div className="mt-6 px-6 py-2 bg-sky-50 text-[#0090C1] text-[10px] font-black rounded-full uppercase tracking-widest border border-sky-100 flex items-center gap-2">
                <Shield size={12} /> {user.role} Authorization
              </div>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Preferences</h4>
              <button onClick={toggleLanguage} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                <div className="flex items-center gap-4 text-slate-700 font-bold">
                  <Globe size={20} className="text-[#0090C1]" /> {t('language_settings')}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400">{language === 'en' ? 'English' : 'Afaan Oromoo'}</span>
              </button>
           </div>
        </div>

        {/* Right Tab Content */}
        <div className="lg:col-span-8">
           {activeTab === 'Account' && (
              <form onSubmit={handleSave} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl p-12 space-y-10">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                   <div className="p-3 bg-sky-50 rounded-2xl text-[#0090C1]"><User size={28} /></div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">Personal Profile</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                     <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" />
                   </div>
                 </div>
                 <button type="submit" disabled={isSaving} className="px-10 py-5 bg-[#0090C1] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all flex items-center justify-center gap-3">
                    {/* Fix: Added import for Loader2 */}
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Update Credentials
                 </button>
              </form>
           )}

           {activeTab === 'Branding' && user.role === 'Admin' && (
              <div className="space-y-10">
                 <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl p-12 space-y-10">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                      <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Palette size={28} /></div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-800 tracking-tight">Institutional Branding</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Updates official headers across all reports</p>
                      </div>
                    </div>
                    
                    {/* Live Preview */}
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Header Preview (Auto-updating)</p>
                       <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                          <OfficialHeader branding={branding} subTitle="Preview Document" />
                       </div>
                    </div>

                    <form onSubmit={handleSaveBranding} className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <h5 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Bureau / Regional</h5>
                             <input placeholder="Bureau Name (English)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-purple-400" value={branding.bureauName} onChange={(e) => setBranding({...branding, bureauName: e.target.value})} />
                             <input placeholder="Bureau Name (Local)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-purple-400" value={branding.bureauNameLocal} onChange={(e) => setBranding({...branding, bureauNameLocal: e.target.value})} />
                             <input placeholder="Zone Name" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-purple-400" value={branding.zoneName} onChange={(e) => setBranding({...branding, zoneName: e.target.value})} />
                          </div>
                          <div className="space-y-4">
                             <h5 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">School Identity</h5>
                             <input placeholder="School Name (English)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-sky-400" value={branding.schoolName} onChange={(e) => setBranding({...branding, schoolName: e.target.value})} />
                             <input placeholder="School Name (Local)" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-sky-400" value={branding.schoolNameLocal} onChange={(e) => setBranding({...branding, schoolNameLocal: e.target.value})} />
                             <input placeholder="Academic Year" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-sky-400" value={branding.academicYear} onChange={(e) => setBranding({...branding, academicYear: e.target.value})} />
                          </div>
                       </div>
                       <button type="submit" disabled={isSaving} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all">
                          {/* Fix: Added import for Loader2 */}
                          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Palette size={18} />} Apply Global Branding
                       </button>
                    </form>
                 </div>
              </div>
           )}

           {activeTab === 'Security' && (
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl p-12 space-y-10">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                   <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><Lock size={28} /></div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security Protocol</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-amber-200 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><Lock size={24} /></div>
                          <div>
                             <p className="font-black text-slate-800 tracking-tight">Access Password</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reset system passphrase</p>
                          </div>
                       </div>
                       <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">Change</button>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* ID Card Modal */}
      {showIdCard && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in" onClick={() => setShowIdCard(false)} />
          <div className="relative flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500">
             <div ref={idCardRef} className="w-[500px] h-[315px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-100">
                <div className="h-20 bg-slate-900 flex items-center justify-between px-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0090C1] rounded-xl flex items-center justify-center text-white shadow-lg"><Building2 size={24} /></div>
                      <div className="text-white">
                         <h3 className="font-black text-sm uppercase tracking-wider">{branding.schoolName}</h3>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Identity</p>
                      </div>
                   </div>
                   <span className="text-[9px] font-black text-white/40 uppercase">{branding.academicYear}</span>
                </div>
                <div className="p-8 flex gap-8 items-center h-[calc(100%-5rem)]">
                   <div className="w-36 h-44 rounded-3xl overflow-hidden border-[6px] border-slate-50 shadow-inner shrink-0">
                      <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="flex-1 space-y-4">
                      <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Full Name</p><h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{user.name}</h4></div>
                      <div className="grid grid-cols-2 gap-4">
                         <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID Registry</p><p className="font-mono text-sm font-black text-slate-700">{user.id}</p></div>
                         <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p><p className="text-xs font-black text-emerald-500 uppercase tracking-widest">ACTIVE</p></div>
                      </div>
                      <div className="pt-4 flex justify-between items-end">
                         <QrCode size={48} className="text-slate-900 opacity-80" />
                         <Signature className="w-24 h-10 text-slate-300" />
                      </div>
                   </div>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setShowIdCard(false)} className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] backdrop-blur-xl transition-all border border-white/10">Close</button>
                <button onClick={handleDownloadId} className="px-10 py-5 bg-[#0090C1] text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-[#007ba6] transition-all flex items-center gap-2">
                   <Download size={16} /> Save Digital Identity
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};