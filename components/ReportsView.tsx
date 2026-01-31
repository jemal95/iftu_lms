
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  Activity, 
  Server, 
  Clock,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Pie,
  Cell,
  PieChart as RePieChart
} from 'recharts';
import { AuthUser } from '../types';
import { db } from '../utils/persistence';

interface ReportsViewProps {
  user: AuthUser;
}

const ENROLLMENT_DATA = [
  { month: 'Jan', students: 4200 },
  { month: 'Feb', students: 4800 },
  { month: 'Mar', students: 5100 },
  { month: 'Apr', students: 4900 },
  { month: 'May', students: 5800 },
  { month: 'Jun', students: 6200 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Engineering', value: 45, color: '#0090C1' },
  { name: 'Social Sci', value: 25, color: '#6366f1' },
  { name: 'Medical', value: 20, color: '#10b981' },
  { name: 'Others', value: 10, color: '#f59e0b' },
];

export const ReportsView: React.FC<ReportsViewProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState(db.getSystemStats());
  const [activeTab, setActiveTab] = useState<'Students' | 'Teachers' | 'Subjects'>('Students');
  const [isMounted, setIsMounted] = useState(false);

  // Load Data
  const allUsers = useMemo(() => db.getUsers(), []);
  const allCourses = useMemo(() => db.getCourses(), []);
  
  const teachers = useMemo(() => allUsers.filter(u => u.role === 'Teacher'), [allUsers]);
  const students = useMemo(() => allUsers.filter(u => u.role === 'Student'), [allUsers]);

  useEffect(() => {
    // Ensure the layout is stable before mounting the charts
    const timer = setTimeout(() => setIsMounted(true), 150);
    
    const interval = setInterval(() => {
      setStats(db.getSystemStats());
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const exportToCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ];
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('report-content');
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0.2, 0.2],
        filename: `IFTU_Full_Institutional_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      try { await (window as any).html2pdf().set(opt).from(element).save(); }
      catch (error) { alert("PDF Generation failed."); }
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500" id="report-content">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-html2canvas-ignore="true">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Executive Intelligence</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Full database visualization and multi-format exports.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleDownloadPDF}
             disabled={isGenerating}
             className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all disabled:opacity-75 disabled:cursor-wait"
           >
             {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
             {isGenerating ? 'Synthesizing...' : 'Export Comprehensive PDF'}
           </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ReportMetricCard title="Total Students" value={stats.students.toLocaleString()} change="+12%" isPositive={true} icon={<GraduationCap size={20} />} color="sky" />
        <ReportMetricCard title="Faculty Count" value={stats.teachers.toLocaleString()} change="+5%" isPositive={true} icon={<Users size={20} />} color="emerald" />
        <ReportMetricCard title="Live Subjects" value={stats.subjects.toLocaleString()} change="+2" isPositive={true} icon={<BookOpen size={20} />} color="amber" />
        <ReportMetricCard title="Total Enrollment" value={stats.totalEnrollment.toLocaleString()} change="+8%" isPositive={true} icon={<Activity size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Analytics Section */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Growth Analytics</h3>
                <p className="text-xs text-slate-400 font-medium">Enrollment trends from institutional history.</p>
              </div>
            </div>
            <div className="h-[340px] w-full block relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={ENROLLMENT_DATA}>
                    <defs><linearGradient id="colorStudentsRep" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0090C1" stopOpacity={0.2}/><stop offset="95%" stopColor="#0090C1" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}} />
                    <Area type="monotone" dataKey="students" stroke="#0090C1" strokeWidth={5} fillOpacity={1} fill="url(#colorStudentsRep)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Detailed Data Hub */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-2">
                {(['Students', 'Teachers', 'Subjects'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-[#0090C1] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => exportToCSV(activeTab === 'Students' ? students : activeTab === 'Teachers' ? teachers : allCourses, `IFTU_${activeTab}`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
              >
                <FileSpreadsheet size={16} /> Export {activeTab} Excel
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead className="bg-white sticky top-0 z-10 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-100">
                  <tr>
                    {activeTab === 'Subjects' ? (
                      <>
                        <th className="px-8 py-4">Title</th>
                        <th className="px-8 py-4">Category</th>
                        <th className="px-8 py-4">Instructor</th>
                        <th className="px-8 py-4">Enrollment</th>
                      </>
                    ) : (
                      <>
                        <th className="px-8 py-4">Full Name</th>
                        <th className="px-8 py-4">ID / Email</th>
                        <th className="px-8 py-4">Department</th>
                        <th className="px-8 py-4">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeTab === 'Subjects' ? (
                    allCourses.map(course => (
                      <tr key={course.id} className="text-xs font-medium hover:bg-slate-50/30">
                        <td className="px-8 py-4 font-bold text-slate-800">{course.title}</td>
                        <td className="px-8 py-4 text-slate-500">{course.category}</td>
                        <td className="px-8 py-4 text-slate-500">{course.instructor}</td>
                        <td className="px-8 py-4 text-slate-500 font-bold">{course.students}</td>
                      </tr>
                    ))
                  ) : (
                    (activeTab === 'Students' ? students : teachers).map(p => (
                      <tr key={p.id} className="text-xs font-medium hover:bg-slate-50/30">
                        <td className="px-8 py-4 font-bold text-slate-800">{p.name}</td>
                        <td className="px-8 py-4 text-slate-500">{p.email}</td>
                        <td className="px-8 py-4 text-slate-500">{p.department}</td>
                        <td className="px-8 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-between space-y-10 text-center">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Department Mix</h3>
             <div className="h-[240px] w-full block relative">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RePieChart>
                      <Pie data={CATEGORY_DISTRIBUTION} innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                        {CATEGORY_DISTRIBUTION.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <h4 className="text-3xl font-black text-slate-800">45%</h4>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Engineering</p>
                </div>
             </div>
             <div className="w-full space-y-3">
                {CATEGORY_DISTRIBUTION.map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-[10px] font-bold text-slate-600">{c.name}</span></div>
                     <span className="text-[10px] font-black text-slate-800">{c.value}%</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Server size={100} /></div>
             <div className="relative z-10 space-y-6">
                <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest">System Health</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-50">Storage Usage</span>
                    <span className="font-bold">{stats.storageUsage}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: '12%' }} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-50">State Verification</span>
                    <span className="font-bold text-emerald-400">PASSED</span>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-2 text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">
                   <Clock size={12} /> Last Sync: {stats.lastSync}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportMetricCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode; color: string; }> = ({ title, value, change, isPositive, icon, color }) => {
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
      <div className="flex items-center justify-between mb-8">
        <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:rotate-12 ${colorMap[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}
        </div>
      </div>
      <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p><h4 className="text-3xl font-black text-slate-800 mt-2 tracking-tight group-hover:text-[#0090C1] transition-colors">{value}</h4></div>
    </div>
  );
};
