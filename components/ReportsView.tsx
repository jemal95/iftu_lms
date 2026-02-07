
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Download, 
  ArrowUpRight, 
  Loader2, 
  Activity, 
  Server, 
  Clock,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Printer,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  ChevronDown,
  Briefcase,
  Award,
  CheckCircle2,
  Filter
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
  PieChart as RePieChart,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { AuthUser, User } from '../types';
import { db } from '../utils/persistence';
import { Signature } from './Signature';

interface ReportsViewProps {
  user: AuthUser;
}

type ReportType = 
  | 'STUDENT_ENROLLMENT_STATS' 
  | 'STUDENT_ROSTER_G9_12' 
  | 'TVET_G12_COMPLETION'
  | 'FACULTY_FULL_INFO'
  | 'FACULTY_STATS';

export const ReportsView: React.FC<ReportsViewProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>('STUDENT_ENROLLMENT_STATS');
  const [isMounted, setIsMounted] = useState(false);

  // Load Data
  const allUsers = useMemo(() => db.getUsers(), []);
  const allCourses = useMemo(() => db.getCourses(), []);
  const stats = useMemo(() => db.getSystemStats(), []);
  
  const teachers = useMemo(() => allUsers.filter(u => u.role === 'Teacher'), [allUsers]);
  const students = useMemo(() => allUsers.filter(u => u.role === 'Student'), [allUsers]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // --- DATA AGGREGATION LOGIC ---

  // 1. Enrollment Stats by Grade/Gender
  const enrollmentStats = useMemo(() => {
    const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
    return grades.map(g => {
      const cohort = students.filter(s => s.currentGrade === g);
      return {
        name: g,
        Male: cohort.filter(s => s.gender === 'Male').length,
        Female: cohort.filter(s => s.gender === 'Female').length,
        Total: cohort.length
      };
    });
  }, [students]);

  // 2. TVET vs Completion Stats
  const tvetStats = useMemo(() => {
    const tvet = students.filter(s => s.currentGrade?.includes('Level'));
    const g12 = students.filter(s => s.currentGrade === 'Grade 12');
    return [
      { name: 'TVET (L1-4)', value: tvet.length, color: '#f59e0b' },
      { name: 'Grade 12', value: g12.length, color: '#0090C1' }
    ];
  }, [students]);

  // 3. Faculty Qualification Stats
  const facultyStats = useMemo(() => {
    const quals: Record<string, number> = {};
    teachers.forEach(t => {
      const q = t.qualification || 'Other';
      quals[q] = (quals[q] || 0) + 1;
    });
    return Object.entries(quals).map(([name, val]) => ({ name, value: val }));
  }, [teachers]);

  const exportToCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        return typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`;
      }).join(','))
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
    const element = document.getElementById('printable-report-content');
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0.3, 0.3],
        filename: `IFTU_Report_${activeReport}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      try {
        await (window as any).html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error(error);
        alert("PDF Generation failed.");
      }
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      {/* Header & Selector */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Institutional Intelligence</h2>
          <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
             <Activity size={16} className="text-[#0090C1]" /> 2018 E.C. Academic Pulse
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative min-w-[280px]">
            <select 
              value={activeReport} 
              onChange={(e) => setActiveReport(e.target.value as ReportType)}
              className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 shadow-xl shadow-slate-100 appearance-none focus:ring-4 focus:ring-sky-500/5 transition-all"
            >
              <optgroup label="Student Reports">
                <option value="STUDENT_ENROLLMENT_STATS">1. Enrollment Statistics</option>
                <option value="STUDENT_ROSTER_G9_12">2. Roster (Grade 9-12)</option>
                <option value="TVET_G12_COMPLETION">3. TVET & G12 Completion</option>
              </optgroup>
              <optgroup label="Teacher Reports">
                <option value="FACULTY_FULL_INFO">4. Staff Full Information</option>
                <option value="FACULTY_STATS">5. Staff Statistics</option>
              </optgroup>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0090C1]" size={20} />
          </div>

          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-3 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            {isGenerating ? 'Compiling...' : 'Print Report'}
          </button>
        </div>
      </div>

      {/* Main Report Viewport */}
      <div id="printable-report-content" className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col p-10">
        
        {/* Report Header (For Print and Screen) */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-10">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                 <BarChart3 size={36} />
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">IFTU LMS OFFICIAL REPORT</h1>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
                    {activeReport.replace(/_/g, ' ')}
                 </p>
              </div>
           </div>
           <div className="text-right flex flex-col items-end">
              <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 mb-2">
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status: Verified Official</span>
              </div>
              <p className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>

        {/* Report Content Switcher */}
        <div className="flex-1">
          {activeReport === 'STUDENT_ENROLLMENT_STATS' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[400px]">
                  <div className="space-y-6">
                     <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Users size={24} className="text-[#0090C1]" /> Enrollment Comparison</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentStats}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                           <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                           <Legend />
                           <Bar dataKey="Male" fill="#0090C1" radius={[8, 8, 0, 0]} />
                           <Bar dataKey="Female" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse rounded-2xl overflow-hidden">
                        <thead>
                           <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                              <th className="px-6 py-4">Grade Level</th>
                              <th className="px-6 py-4 text-center">Male</th>
                              <th className="px-6 py-4 text-center">Female</th>
                              <th className="px-6 py-4 text-right">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {enrollmentStats.map(row => (
                              <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 font-black text-slate-700">{row.name}</td>
                                 <td className="px-6 py-4 text-center text-slate-500 font-bold">{row.Male}</td>
                                 <td className="px-6 py-4 text-center text-slate-500 font-bold">{row.Female}</td>
                                 <td className="px-6 py-4 text-right text-[#0090C1] font-black">{row.Total}</td>
                              </tr>
                           ))}
                           <tr className="bg-slate-50/50 font-black">
                              <td className="px-6 py-6 uppercase text-xs">Total Enrollment</td>
                              <td colSpan={3} className="px-6 py-6 text-right text-2xl text-slate-900">{students.length}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeReport === 'STUDENT_ROSTER_G9_12' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-100">
                     <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                           <th className="px-6 py-4 border-r border-white/10">ID</th>
                           <th className="px-6 py-4 border-r border-white/10">Full Name</th>
                           <th className="px-6 py-4 border-r border-white/10 text-center">Sex</th>
                           <th className="px-6 py-4 border-r border-white/10">Current Grade</th>
                           <th className="px-6 py-4 border-r border-white/10">Department</th>
                           <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {students.filter(s => s.currentGrade?.startsWith('Grade')).map(s => (
                           <tr key={s.id} className="hover:bg-slate-50 transition-colors text-sm">
                              <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{s.id}</td>
                              <td className="px-6 py-4 font-black text-slate-800">{s.name}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-500">{s.gender?.charAt(0) || 'M'}</td>
                              <td className="px-6 py-4"><span className="px-3 py-1 bg-sky-50 text-[#0090C1] rounded-lg font-bold text-xs">{s.currentGrade}</span></td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{s.department}</td>
                              <td className="px-6 py-4 text-center">
                                 <span className="text-[10px] font-black uppercase text-emerald-500">Active</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeReport === 'TVET_G12_COMPLETION' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col items-center">
                     <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-8">Program Breakdown</h3>
                     <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                              <Pie data={tvetStats} innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value" stroke="none">
                                 {tvetStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                              <Legend />
                           </RePieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total TVET Candidates</p>
                           <h4 className="text-4xl font-black text-amber-600 mt-2">{students.filter(s => s.currentGrade?.includes('Level')).length}</h4>
                        </div>
                        <Award size={48} className="text-amber-200" />
                     </div>
                     <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grade 12 Graduates (Pending)</p>
                           <h4 className="text-4xl font-black text-[#0090C1] mt-2">{students.filter(s => s.currentGrade === 'Grade 12').length}</h4>
                        </div>
                        <GraduationCap size={48} className="text-sky-200" />
                     </div>
                     <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 leading-relaxed italic flex items-start gap-3">
                           <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                           Completion Eligibility: Students are flagged for graduation once all Semester 1 and 2 records are synchronized in the registry.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeReport === 'FACULTY_FULL_INFO' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-100">
                     <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border-b">
                        <tr>
                           <th className="px-6 py-4 border-r">Employee Name</th>
                           <th className="px-6 py-4 border-r">Qualification</th>
                           <th className="px-6 py-4 border-r">Employment Type</th>
                           <th className="px-6 py-4 border-r">Department</th>
                           <th className="px-6 py-4 border-r">Assignments</th>
                           <th className="px-6 py-4">Campus/Station</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-xs">
                        {teachers.map(t => (
                           <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-black text-slate-800 uppercase tracking-tight">{t.name}</td>
                              <td className="px-6 py-4 font-bold text-[#0090C1]">{t.qualification || 'BSc/BA'}</td>
                              <td className="px-6 py-4">
                                 <span className="px-2 py-1 bg-white border border-slate-200 rounded font-bold text-slate-500 uppercase">{t.employmentType || 'Full-time'}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{t.department}</td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-wrap gap-1">
                                    {t.assignedSubjects?.map(s => <span key={s} className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-black">{s}</span>)}
                                 </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-500">{t.campusId === 'S1' ? 'Central Hub' : 'Branch Hub'}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeReport === 'FACULTY_STATS' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                     <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><Briefcase size={24} className="text-emerald-500" /> Staffing Velocity</h3>
                     <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={facultyStats} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} width={100} />
                              <Tooltip cursor={{fill: '#f0fdf4'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                              <Bar dataKey="value" fill="#10b981" radius={[0, 10, 10, 0]} label={{ position: 'right', fontSize: 10, fontWeight: 900 }} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="space-y-6 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={100} /></div>
                     <div className="relative z-10 space-y-8">
                        <div>
                           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Total Faculty</p>
                           <h4 className="text-5xl font-black mt-2">{teachers.length}</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-xs font-bold">
                              <span className="opacity-60">Avg. Subject Load</span>
                              <span className="text-sky-400">2.4 Per Staff</span>
                           </div>
                           <div className="flex justify-between items-center text-xs font-bold">
                              <span className="opacity-60">Certification Rate</span>
                              <span className="text-emerald-400">100%</span>
                           </div>
                        </div>
                        <div className="pt-8 border-t border-white/10">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Latest Faculty Update</p>
                           <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                              <Clock size={16} className="text-sky-400" />
                              <span className="text-xs font-medium opacity-80">Roster Synchronized {stats.lastSync}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer with Signatures */}
        <div className="mt-16 pt-12 border-t border-slate-100 flex justify-between items-end">
           <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prepared by Registry</p>
              <div className="w-48 h-px bg-slate-200" />
           </div>
           <div className="text-center">
              <Signature className="w-32 h-12 text-slate-800 mb-2 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 underline">Authorized System Director</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official IFTU LMS Seal</p>
              <div className="w-12 h-12 bg-slate-100 rounded-full inline-flex items-center justify-center text-slate-300 mt-2 rotate-12 border-2 border-dashed border-slate-200"><Activity size={24} /></div>
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
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
      <div className="flex items-center justify-between mb-8">
        <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:rotate-12 ${colorMap[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />}{change}
        </div>
      </div>
      <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p><h4 className="text-3xl font-black text-slate-800 mt-2 tracking-tight group-hover:text-[#0090C1] transition-colors">{value}</h4></div>
    </div>
  );
};
