import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  Zap,
  Layout,
  ChevronRight,
  Newspaper,
  Database,
  Calendar,
  Activity,
  Award,
  Bell,
  Plus,
  FileText,
  CreditCard,
  Wifi,
  Shield
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { NavSection } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../utils/persistence';

const chartData = [
  { name: 'Mon', students: 400 }, { name: 'Tue', students: 300 }, { name: 'Wed', students: 600 },
  { name: 'Thu', students: 800 }, { name: 'Fri', students: 500 }, { name: 'Sat', students: 200 }, { name: 'Sun', students: 100 },
];

interface DashboardViewProps {
  onNavigate: (section: NavSection) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(db.getSystemStats());
  const [greeting, setGreeting] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setStats(db.getSystemStats());
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8 space-y-8 custom-scrollbar overflow-y-auto h-full pb-20">
      {/* Dynamic Hero Banner */}
      <section className={`relative overflow-hidden mesh-gradient rounded-[3rem] p-10 md:p-14 text-white shadow-2xl transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,86.1,-0.6C85.1,14.5,79.7,29,71,41.4C62.3,53.8,50.3,64.1,36.5,71.2C22.7,78.2,7.1,81.9,-8.5,80.4C-24.1,78.9,-39.7,72.2,-52.8,62C-65.9,51.8,-76.5,38.1,-81.1,22.8C-85.7,7.5,-84.3,-9.4,-78.6,-24.8C-72.9,-40.2,-62.9,-54.1,-49.8,-61.4C-36.7,-68.7,-20.5,-69.4,-3.5,-63.3C13.5,-57.2,31.3,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            {/* Live Ticker */}
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-1000">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-emerald-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  <Wifi size={12} /> System Online
               </div>
               <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-sky-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  <Database size={12} /> Sync: {stats.lastSync}
               </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none animate-reveal">
              {greeting}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">Admin Portal</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-lg">
              Manage curricula, monitor student velocity, and leverage AI insights—all from a single, unified workspace.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onNavigate(NavSection.COURSES)}
                className="bg-[#0090C1] hover:bg-sky-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <Layout size={18} /> Manage Subjects
              </button>
              <button 
                onClick={() => onNavigate(NavSection.NEWS)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-2"
              >
                <Newspaper size={18} /> Announcements
              </button>
            </div>
          </div>

          {/* 3D Illustration Placeholder */}
          <div className="hidden lg:block relative group">
             <div className="w-80 h-80 bg-gradient-to-tr from-white/10 to-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center backdrop-blur-md relative shadow-2xl overflow-hidden transition-transform duration-700 group-hover:-rotate-3">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <GraduationCap size={140} strokeWidth={1} className="text-white drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />
                
                {/* Floating Tags */}
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md animate-bounce [animation-duration:3s]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">Term 2 Active</p>
                </div>
                <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-md animate-bounce [animation-duration:4s]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">98% Uptime</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Modern Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Student Population" value={stats.students.toLocaleString()} trend="+12.5% this month" icon={<Users size={24} />} color="sky" delay="0ms" />
        <MetricCard title="Certified Faculty" value={stats.teachers.toLocaleString()} trend="Full Capacity" icon={<Award size={24} />} color="emerald" delay="100ms" />
        <MetricCard title="Active Hubs" value={stats.campuses.toLocaleString()} trend="+1 New Branch" icon={<Database size={24} />} color="amber" delay="200ms" />
        <MetricCard title="Platform Load" value="Optimal" trend="Latency: 24ms" icon={<Activity size={24} />} color="purple" delay="300ms" />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Shortcuts */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6 animate-reveal" style={{ animationDelay: '400ms' }}>
           <h3 className="text-lg font-black text-slate-800 tracking-tight px-2 flex items-center gap-2">
             <Zap size={20} className="text-amber-500" /> Quick Actions
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <ShortcutCard label="Add Student" icon={<Plus size={20} />} color="bg-indigo-50 text-indigo-600" onClick={() => onNavigate(NavSection.STUDENTS)} />
              <ShortcutCard label="Post News" icon={<Newspaper size={20} />} color="bg-rose-50 text-rose-600" onClick={() => onNavigate(NavSection.NEWS)} />
              <ShortcutCard label="Record Grades" icon={<Award size={20} />} color="bg-emerald-50 text-emerald-600" onClick={() => onNavigate(NavSection.GRADEBOOK)} />
              <ShortcutCard label="Payments" icon={<CreditCard size={20} />} color="bg-sky-50 text-sky-600" onClick={() => onNavigate(NavSection.PAYMENTS)} />
              <ShortcutCard label="Gen Report" icon={<FileText size={20} />} color="bg-amber-50 text-amber-600" onClick={() => onNavigate(NavSection.REPORTS)} />
              <ShortcutCard label="Security" icon={<Shield size={20} />} color="bg-slate-100 text-slate-600" onClick={() => onNavigate(NavSection.PROFILE)} />
           </div>
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-12 xl:col-span-8 glass-panel p-8 rounded-[3rem] space-y-8 animate-reveal" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between">
            <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Institutional Engagement</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Student interaction telemetry</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-all">Daily</button>
               <button className="px-4 py-2 bg-[#0090C1] rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-sky-500/20">Weekly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0090C1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0090C1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px'}}
                   itemStyle={{fontWeight: 900, color: '#0090C1', fontSize: '12px'}}
                   labelStyle={{fontWeight: 800, marginBottom: '5px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase'}}
                />
                <Area type="monotone" dataKey="students" stroke="#0090C1" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-reveal" style={{ animationDelay: '600ms' }}>
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Bell size={16} className="text-[#0090C1]" /> Global Feed
               </h4>
               <button className="text-[10px] font-bold text-sky-600 hover:underline">View All Logs</button>
            </div>
            <div className="space-y-4">
               <FeedItem title="Grade 12 Physics Finalized" time="10 mins ago" category="Academic" color="bg-indigo-500" />
               <FeedItem title="New Campus Policy Updated" time="1 hour ago" category="Admin" color="bg-rose-500" />
               <FeedItem title="50 New Student Registrations" time="3 hours ago" category="Enrollment" color="bg-emerald-500" />
            </div>
         </div>

         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
               <Zap size={100} />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-4">System Health</h4>
            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Database</span>
                  <span className="text-emerald-400">Healthy</span>
               </div>
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98%]" />
               </div>
               
               <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <span className="text-slate-400">Storage</span>
                  <span className="text-amber-400">45% Used</span>
               </div>
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[45%]" />
               </div>
            </div>
            <button className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               Run Diagnostics
            </button>
         </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; color: string; delay: string }> = ({ title, value, trend, icon, color, delay }) => {
  const colors: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  
  return (
    <div className={`glass-panel p-8 rounded-[2.5rem] hover-lift animate-reveal`} style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-50 text-slate-500`}>
           Analysis
        </span>
      </div>
      <div>
        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-emerald-500 text-xs font-bold">
           <ArrowUpRight size={14} /> {trend}
        </div>
      </div>
    </div>
  );
};

const ShortcutCard: React.FC<{ label: string; icon: React.ReactNode; color: string; onClick: () => void }> = ({ label, icon, color, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all group"
  >
    <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform shadow-sm`}>
       {icon}
    </div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{label}</span>
  </button>
);

const FeedItem: React.FC<{ title: string; time: string; category: string; color: string }> = ({ title, time, category, color }) => (
  <div className="flex items-center gap-4 group cursor-default p-3 hover:bg-slate-50 rounded-2xl transition-colors">
    <div className={`w-2 h-12 rounded-full ${color} shrink-0`} />
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{category}</span>
         <span className="text-[9px] font-bold text-slate-300">{time}</span>
      </div>
      <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-[#0090C1] transition-colors">{title}</p>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#0090C1] transition-colors opacity-0 group-hover:opacity-100" />
  </div>
);