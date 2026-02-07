
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
  Database
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
import { NavSection, SOCIAL_LINKS } from '../types';
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
  const [isMounted, setIsMounted] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setStats(db.getSystemStats());
    const timer = setTimeout(() => setIsMounted(true), 150);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl p-8 md:p-16 text-white flex flex-col lg:flex-row items-center justify-between border border-white/5">
        <div className="relative z-10 space-y-6 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-2 animate-pulse">
            <Zap size={14} fill="currentColor" /> Live Academic Pulse
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-tight">
            {greeting}, <br /> 
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">IFTU Workspace</span>
          </h1>
          <p className="text-base md:text-xl opacity-70 leading-relaxed font-light max-w-lg mx-auto lg:mx-0">
            Intelligent school management meets high-performance pedagogy. Transform your institution with data-driven clarity.
          </p>
          <div className="pt-6 flex flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              onClick={() => onNavigate(NavSection.COURSES)}
              className="bg-[#0090C1] text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 flex items-center gap-3"
            >
              <Layout size={18} /> {t('get_started')}
            </button>
            <button 
              onClick={() => onNavigate(NavSection.NEWS)}
              className="bg-white/5 border border-white/20 hover:bg-white/10 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              {t('recent_news')}
            </button>
          </div>
        </div>
        <div className="relative z-10 mt-12 lg:mt-0 hidden lg:block">
          <div className="w-56 h-56 md:w-80 md:h-80 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 relative">
             <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
             <GraduationCap size={160} strokeWidth={1} className="text-white drop-shadow-2xl relative z-10" />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Students" value={stats.students.toLocaleString()} change="+12.5%" icon={<Users size={20} />} color="sky" />
        <StatCard title="Total Teachers" value={stats.teachers.toLocaleString()} change="+3.2%" icon={<BookOpen size={20} />} color="emerald" />
        <StatCard title="Active Campuses" value={stats.campuses.toLocaleString()} change="Stable" icon={<Database size={20} />} color="amber" />
        <StatCard title="Avg. Completion" value="76%" change="+2.4%" icon={<Clock size={20} />} color="purple" />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Student Engagement Hub</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Institutional participation across campuses</p>
            </div>
            <select className="bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-3 outline-none">
              <option>Real-time (Live)</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[280px] md:h-[350px] w-full relative overflow-hidden">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0090C1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0090C1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="students" stroke="#0090C1" strokeWidth={5} fillOpacity={1} fill="url(#colorStudents)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 text-sky-500/10 pointer-events-none"><Sparkles size={120} /></div>
           <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-8">Activity Feed</h3>
           <div className="space-y-8 relative z-10">
              <ActivityItem user="Dr. Sarah Johnson" action="published IT Exam #2" time="5m ago" image="https://picsum.photos/seed/sarah/80/80" status="New" />
              <ActivityItem user="Marcus Chen" action="finished Physics Quiz" time="1h ago" image="https://picsum.photos/seed/marcus/80/80" />
              <ActivityItem user="Registry" action="updated Mark List" time="2h ago" image="https://picsum.photos/seed/registry/80/80" />
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; color: string; }> = ({ title, value, change, icon, color }) => {
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:rotate-12 ${colorMap[color] || 'bg-slate-50'}`}>{icon}</div>
        <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-tight bg-emerald-50 px-3 py-1 rounded-full">
          <ArrowUpRight size={14} /> {change}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">{title}</p>
        <h4 className="text-3xl md:text-4xl font-black text-slate-800 mt-2 tracking-tight group-hover:text-sky-600 transition-colors">{value}</h4>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ user: string; action: string; time: string; image: string; status?: string }> = ({ user, action, time, image, status }) => (
  <div className="flex gap-4 group">
    <div className="relative shrink-0">
      <img src={image} className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg group-hover:rotate-6 transition-all duration-300 object-cover" alt="" />
      {status && <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 rounded-full border-2 border-white shadow-sm" />}
    </div>
    <div className="flex flex-col justify-center min-w-0">
      <p className="text-sm leading-snug truncate">
        <span className="font-bold text-slate-800">{user}</span> <span className="text-slate-500 font-medium">{action}</span>
      </p>
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
        <Clock size={10} /> {time}
      </p>
    </div>
  </div>
);
