
import React from 'react';
import { Trophy, Award, Calendar, Download, BarChart2, CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';
import { AuthUser, StudentResult } from '../types';

interface ResultsViewProps {
  user: AuthUser;
}

const MOCK_RESULTS: StudentResult[] = [
  { id: 'r1', examTitle: 'Final Exam: Grade 12 Math', courseTitle: 'Mathematics (Grade 12)', score: 92, total: 100, grade: 'A', date: '2024-10-30', status: 'Pass' },
  { id: 'r2', examTitle: 'Mid-term: Biology', courseTitle: 'Biology (Grade 10)', score: 85, total: 100, grade: 'B+', date: '2024-10-15', status: 'Pass' },
  { id: 'r3', examTitle: 'Grade 11 Physics Quiz', courseTitle: 'Physics (Grade 11)', score: 98, total: 100, grade: 'A+', date: '2024-11-05', status: 'Pass' },
  { id: 'r4', examTitle: 'English Literature Essay', courseTitle: 'English (Grade 12)', score: 78, total: 100, grade: 'B', date: '2024-11-08', status: 'Pass' }
];

export const ResultsView: React.FC<ResultsViewProps> = ({ user }) => {

  const handleDownloadTranscript = () => {
    const headers = ['Exam Title', 'Course', 'Date', 'Score', 'Total', 'Grade', 'Status'];
    const rows = MOCK_RESULTS.map(r => [
      r.examTitle,
      r.courseTitle,
      r.date,
      r.score.toString(),
      r.total.toString(),
      r.grade,
      r.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `IFTU_Official_HighSchool_Transcript_${user.name.replace(/\s/g, '_')}_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const calculateAverage = () => {
    const total = MOCK_RESULTS.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / MOCK_RESULTS.length);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Performance</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Your verified high school scores and reports.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleDownloadTranscript}
             className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
           >
             <Download size={18} />
             Download Full Transcript (Excel / CSV)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GPA Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden shadow-2xl group hover:scale-[1.02] transition-transform duration-500">
           <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
             <Award size={160} strokeWidth={1} />
           </div>
           <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center border border-sky-400/30 shadow-[0_0_40px_-10px_rgba(56,189,248,0.5)]">
              <Trophy size={40} className="text-sky-400" />
           </div>
           <div>
              <h3 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">3.85</h3>
              <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-2">Cumulative GPA</p>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/10">
              <div>
                 <p className="text-2xl font-black">4th</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Class Rank</p>
              </div>
              <div>
                 <p className="text-2xl font-black">98%</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
              </div>
           </div>
        </div>

        {/* Recent Performance Stats */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                    <TrendingUp size={32} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Average</p>
                    <h4 className="text-3xl font-black text-slate-800">{calculateAverage()}%</h4>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1">+2.4% from last semester</p>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                 <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                    <BookOpen size={32} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Modules Completed</p>
                    <h4 className="text-3xl font-black text-slate-800">{MOCK_RESULTS.length}</h4>
                    <p className="text-[10px] text-purple-500 font-bold mt-1">On track for graduation</p>
                 </div>
              </div>
           </div>

           {/* Exam Table */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                 <h3 className="font-bold text-slate-800 text-lg">Recent Assessments</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                          <th className="px-8 py-4">Subject & Exam</th>
                          <th className="px-8 py-4">Date</th>
                          <th className="px-8 py-4 text-center">Grade</th>
                          <th className="px-8 py-4 text-center">Score</th>
                          <th className="px-8 py-4 text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {MOCK_RESULTS.map((res) => (
                          <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-5">
                                <p className="text-sm font-bold text-slate-800">{res.examTitle}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{res.courseTitle}</p>
                             </td>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                   <Calendar size={14} /> {res.date}
                                </div>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className="inline-block w-8 h-8 leading-8 rounded-lg bg-slate-100 text-slate-700 font-black text-xs">
                                   {res.grade}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <div className="text-sm font-black text-slate-800">
                                   {res.score} <span className="text-[10px] text-slate-400">/ {res.total}</span>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   res.status === 'Pass' 
                                   ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                   : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                   {res.status === 'Pass' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                   {res.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
