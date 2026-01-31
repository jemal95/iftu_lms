
import React from 'react';
import { 
  Target, 
  Rocket, 
  Flag, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Users, 
  GraduationCap,
  Sparkles,
  ChevronLeft,
  Video,
  PlayCircle,
  MessageSquare,
  Facebook,
  Send,
  Zap,
  CheckCircle2,
  Clock,
  Wand2
} from 'lucide-react';
import { SOCIAL_LINKS, NavSection } from '../types';

interface AboutViewProps {
  onNavigate: (section: NavSection) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100 mb-2">
          <Zap size={14} fill="currentColor" />
          75% Completion Milestone Reached
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tight leading-tight">
          IFTU <span className="text-[#0090C1]">SCHOOL</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-light">
          We are building the future of online education. Our platform is nearing launch, 
          bridging the gap between expert teachers and eager students.
        </p>
      </div>

      {/* Progress Status Bar */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-emerald-500/10 pointer-events-none">
          <Rocket size={120} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Development Roadmap</h3>
            <p className="text-sm text-slate-500 font-medium">Core platform systems are 75% finalized and testing.</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-emerald-500">75%</span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
          </div>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-500 rounded-full animate-pulse" style={{ width: '75%' }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-center">
           <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase">Architecture</p>
             <p className="text-xs font-black text-emerald-600">COMPLETED</p>
           </div>
           <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase">AI Integration</p>
             <p className="text-xs font-black text-emerald-600">COMPLETED</p>
           </div>
           <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase">Course Catalog</p>
             <p className="text-xs font-black text-amber-500">IN PROGRESS</p>
           </div>
           <div className="space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase">User Onboarding</p>
             <p className="text-xs font-black text-slate-300">PENDING</p>
           </div>
        </div>
      </div>

      {/* Video Script Section */}
      <div className="space-y-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shadow-sm">
              <Video size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Launch Media Strategy</h2>
              <p className="text-sm text-gray-500">Official Video Tutorial & Recruitment Content Script</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate(NavSection.VIDEO_STUDIO)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0090C1] text-white rounded-xl font-bold shadow-lg hover:bg-sky-600 transition-all hover:scale-105"
          >
            <Wand2 size={18} /> Generate Promo Now
          </button>
        </div>

        <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white space-y-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5"><Video size={300} strokeWidth={1} /></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-sky-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                <PlayCircle size={14} /> Production Blueprint
              </div>
              <h3 className="text-3xl font-black leading-tight">"IFTU SCHOOL: The Digital Dawn" <br /> <span className="text-sky-400">Video Content Plan</span></h3>
              <p className="text-slate-400 leading-relaxed font-light">
                This script is designed to build anticipation while simultaneously inviting high-quality educators 
                and partners to join our ecosystem before the final launch.
              </p>
              
              <div className="space-y-6 pt-4">
                <SceneItem 
                  number="01" 
                  title="The Hook" 
                  desc="Visual of IFTU LMS Logo with a '75% Completed' pulsing bar. Voiceover: 'Online learning is evolving. IFTU SCHOOL is almost here!'" 
                />
                <SceneItem 
                  number="02" 
                  title="The Pillars" 
                  desc="Showcase Natural Science, Social Science, and Technology modules. Show teachers interacting with digital tools." 
                />
                <SceneItem 
                  number="03" 
                  title="The Call" 
                  desc="Recruitment message: 'We are seeking visionary teachers with digital expertise to lead these departments.'" 
                />
                <SceneItem 
                  number="04" 
                  title="Connect" 
                  desc="Display Facebook and Telegram links clearly. Call to action: 'Join us, support us, shape the future.'" 
                />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 space-y-8">
               <div className="flex items-center gap-3 text-emerald-400 mb-2">
                 <MessageSquare size={20} />
                 <h4 className="text-lg font-black uppercase tracking-tight">Afaan Oromoo Script Excerpt</h4>
               </div>
               <div className="space-y-6 text-slate-300 text-sm leading-relaxed italic border-l-2 border-emerald-500/30 pl-6">
                 <p>"IFTU LMS ykn SCHOOL barnootaa online kennuuf platform kana gara garaa qophiisuu irra yoo jiru kunis 75% xumuran beekkamaadha."</p>
                 <p>"Yeroo dhihootti muummeewwan barnootaa irratti kennuuf qophaa'e fkn Saayinsii Uumamas, S/Hawaasa fi Teekinooloojii irratti..."</p>
                 <p>"...barsiisotaa gahumsa fi dandeettii toora website ykn online qaban qacaruun woliin hojjachuu BARBAADAN."</p>
                 <p>"Qaaminni nu deeggaruu fi nu waliin hojjachuu barbaaddan yaada barreeffamaan karaa Telegram, Facebook fi Messages nuuf ergaa."</p>
               </div>
               
               <div className="pt-6 flex flex-wrap gap-4">
                  <a href={SOCIAL_LINKS.FACEBOOK} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                    <Facebook size={16} /> Facebook Interest
                  </a>
                  <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-[#229ED9] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                    <Send size={16} /> Telegram Support
                  </a>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Objective, Mission, Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-8 group-hover:scale-110 transition-transform">
            <Target size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Objective</h3>
          <p className="text-gray-500 leading-relaxed">
            To bridge the gap between complex institutional administration and modern digital pedagogy, 
            creating a seamless interface where data-driven management meets personalized learning.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
            <Rocket size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
          <p className="text-gray-500 leading-relaxed">
            Empowering global educational institutions with next-generation tools to nurture talent through 
            accessible technology, human-centric design, and intelligent AI assistance.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
            <Flag size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Goal</h3>
          <p className="text-gray-500 leading-relaxed">
            To become the global standard for LMS by providing 100% scalable, secure, and AI-integrated 
            solutions that reduce administrative overhead and amplify student potential.
          </p>
        </div>
      </div>

      {/* Strategic Focus */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Our Strategic Focus</h2>
          <p className="text-gray-500 mt-2">Built on four pillars of modern education technology.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FocusCard 
            icon={<Globe className="text-sky-500" />} 
            title="Global Schools" 
            text="Unified management for multi-campus institutions across borders." 
          />
          <FocusCard 
            icon={<Cpu className="text-purple-500" />} 
            title="AI Intelligence" 
            text="Personalized student insights and automated curriculum generation." 
          />
          <FocusCard 
            icon={<ShieldCheck className="text-emerald-500" />} 
            title="Secure Data" 
            text="Enterprise-grade encryption for sensitive student and institutional records." 
          />
          <FocusCard 
            icon={<Users className="text-amber-500" />} 
            title="Collaboration" 
            text="Bridging the gap between students, teachers, and administrators." 
          />
        </div>
      </div>
    </div>
  );
};

const FocusCard: React.FC<{ icon: React.ReactNode, title: string, text: string }> = ({ icon, title, text }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-4">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h4 className="text-lg font-bold text-gray-800">{title}</h4>
    <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
  </div>
);

const SceneItem: React.FC<{ number: string, title: string, desc: string }> = ({ number, title, desc }) => (
  <div className="flex gap-4 group">
    <div className="shrink-0 w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-black text-sky-400 group-hover:bg-[#0090C1] group-hover:text-white transition-all">
      {number}
    </div>
    <div>
      <h5 className="text-sm font-bold text-slate-200">{title}</h5>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);
