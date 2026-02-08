
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  ChevronDown, 
  Printer, 
  TrendingUp,
  Grid3X3,
  FileText,
  Maximize2,
  Sparkles,
  Loader2,
  X,
  BrainCircuit
} from 'lucide-react';
import { AuthUser, User, SubjectGrade, InstitutionalBranding } from '../types';
import { db } from '../utils/persistence';
import { OfficialHeader } from './OfficialHeader';
import { geminiService } from '../services/gemini';
import { marked } from 'marked';

interface GradebookViewProps {
  user: AuthUser;
}

const SUBJECT_DEFINITIONS = [
  { id: 'AMHARIC', short: 'AMH', cat: 'Core' },
  { id: 'AFAAN OROMOO', short: 'A/O', cat: 'Core' },
  { id: 'ENGLISH', short: 'ENG', cat: 'Core' },
  { id: 'MATHEMATICS', short: 'MAT', cat: 'Core' },
  { id: 'PHYSICS', short: 'PHY', cat: 'NS' },
  { id: 'CHEMISTRY', short: 'CHE', cat: 'NS' },
  { id: 'BIOLOGY', short: 'BIO', cat: 'NS' },
  { id: 'GEOGRAPHY', short: 'GEO', cat: 'SS' },
  { id: 'HISTORY', short: 'HIS', cat: 'SS' },
  { id: 'CIVICS', short: 'CIV', cat: 'Core' },
  { id: 'IT', short: 'IT', cat: 'Core' },
  { id: 'HPE', short: 'HPE', cat: 'Core' }
];

const DEPARTMENT_OPTIONS = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const EXCEL_COLS = ['A', 'B', 'C', 'D', 'E'];

export const GradebookView: React.FC<GradebookViewProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('Grade 9');
  const [entrySubject, setEntrySubject] = useState('AMHARIC');
  const [viewMode, setViewMode] = useState<'Spreadsheet' | 'Official'>('Spreadsheet');
  const [branding, setBranding] = useState<InstitutionalBranding>(db.getBranding());
  
  const [students, setStudents] = useState<User[]>([]);
  const [allGrades, setAllGrades] = useState<Record<string, Record<string, { sem1: number, sem2: number }>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    setBranding(db.getBranding());
  }, []);

  useEffect(() => {
    const allUsers = db.getUsers();
    const gradeStudents = allUsers.filter(u => 
      u.role === 'Student' && 
      u.currentGrade === selectedDept && 
      u.status === 'Active'
    );
    setStudents(gradeStudents);

    const fullGradeMap: Record<string, Record<string, { sem1: number, sem2: number }>> = {};
    const records = db.getAcademicRecords();
    
    gradeStudents.forEach(s => {
      fullGradeMap[s.id] = {};
      const record = records.find(r => r.studentId === s.id);
      SUBJECT_DEFINITIONS.forEach(sub => {
         const subjectRecord = record?.subjects?.[sub.id] as SubjectGrade | undefined;
         fullGradeMap[s.id][sub.id] = subjectRecord ? { sem1: subjectRecord.sem1, sem2: subjectRecord.sem2 } : { sem1: 0, sem2: 0 };
      });
    });
    setAllGrades(fullGradeMap);
  }, [selectedDept]);

  const handleGradeEntry = (studentId: string, type: 'sem1' | 'sem2', value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setAllGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [entrySubject]: { ...prev[studentId][entrySubject], [type]: num }
      }
    }));
  };

  const handleSaveBatch = () => {
    setIsSaving(true);
    setTimeout(() => {
        Object.entries(allGrades).forEach(([studentId, subjects]) => {
            const scores = subjects[entrySubject];
            if (scores) {
                db.saveStudentGrade(studentId, entrySubject, 'sem1', scores.sem1);
                db.saveStudentGrade(studentId, entrySubject, 'sem2', scores.sem2);
            }
        });
        setIsSaving(false);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    }, 800);
  };

  const handleAnalyzeClass = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Prepare data summary for AI
    const summaryData = filteredStudents.map(s => {
      const scores = allGrades[s.id]?.[entrySubject] || { sem1: 0, sem2: 0 };
      return {
        id: s.id,
        name: s.name,
        sem1: scores.sem1,
        sem2: scores.sem2,
        avg: (scores.sem1 + scores.sem2) / 2
      };
    });

    const dataString = JSON.stringify(summaryData);
    
    try {
      const result = await geminiService.analyzeGradebook(`Subject: ${entrySubject}. Data: ${dataString}`);
      setAnalysisResult(result || "Analysis failed.");
    } catch (e) {
      setAnalysisResult("AI Analysis service unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, search]);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden bg-[#F3F4F6]">
      <div className="bg-[#059669] h-16 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white"><Grid3X3 size={24} /></div>
            <h1 className="text-white text-xl font-black tracking-tight uppercase">{branding.schoolName} Hub</h1>
         </div>
         <div className="flex items-center gap-3">
            {viewMode === 'Spreadsheet' && (
              <button onClick={handleAnalyzeClass} disabled={isAnalyzing} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
                {isAnalyzing ? 'Analyzing...' : 'AI Class Insight'}
              </button>
            )}
            <button onClick={toggleFullscreen} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/20 flex items-center gap-2">
              <Maximize2 size={16} /> Fullscreen
            </button>
         </div>
      </div>

      <div className="bg-white border-b p-4 flex flex-wrap items-center gap-6 shrink-0 z-10 print:hidden shadow-sm">
         <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Class</span>
            <div className="relative group">
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-slate-50 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-black outline-none cursor-pointer text-[#059669] appearance-none pr-10">
                 {DEPARTMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
         </div>

         <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="text" placeholder="Search students..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#059669] transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
         </div>

         <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setViewMode('Spreadsheet')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Spreadsheet' ? 'bg-white text-[#059669] shadow-lg' : 'text-slate-400'}`}>Edit Grid</button>
            <button onClick={() => setViewMode('Official')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Official' ? 'bg-white text-[#059669] shadow-lg' : 'text-slate-400'}`}>Roster</button>
         </div>

         <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl">
            <Printer size={18} /> Print
         </button>
      </div>

      <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
        {viewMode === 'Spreadsheet' ? (
          <div className="inline-block min-w-full">
            <table className="border-collapse table-fixed w-full">
              <thead>
                {/* Excel-like Column Indicators */}
                <tr className="bg-gradient-to-b from-slate-100 to-slate-50 h-10 border-b border-slate-200">
                  <th className="w-16 border-r border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400"></th>
                  {EXCEL_COLS.map(col => (
                    <th key={col} className="w-64 border-r border-slate-200 text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider shadow-sm">
                      {col}
                    </th>
                  ))}
                </tr>
                
                {/* Action Bar Row */}
                <tr className="bg-white h-24 border-b border-slate-200 shadow-sm relative z-20">
                   <td className="border-r border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-400">1</td>
                   <td className="p-4" colSpan={2}>
                      <div className="flex items-center gap-8">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Subject</span>
                            <select value={entrySubject} onChange={(e) => setEntrySubject(e.target.value)} className="bg-transparent text-xl font-black text-[#059669] outline-none cursor-pointer">
                               {SUBJECT_DEFINITIONS.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                            </select>
                         </div>
                         <div className="h-10 w-px bg-slate-200"></div>
                         <button onClick={handleSaveBatch} disabled={isSaving} className="flex items-center gap-3 px-8 py-3 bg-[#059669] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#047857] shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all active:scale-95">
                            {isSaving ? <TrendingUp size={18} className="animate-spin" /> : <FileText size={18} />} Commit Scores
                         </button>
                      </div>
                   </td>
                   <td className="bg-slate-50/20 border-l border-slate-200" colSpan={3}></td>
                </tr>

                {/* Professional Dark Headers */}
                <tr className="h-16 font-black text-[11px] uppercase tracking-widest text-white shadow-md relative z-10">
                   <td className="border-r border-slate-700 bg-slate-800 text-center text-slate-400 shadow-inner">2</td>
                   <td className="border-r border-slate-700 px-6 bg-slate-900 flex items-center h-16 text-sky-400">
                      Student Identity
                   </td>
                   <td className="border-r border-slate-700 px-6 text-center bg-slate-900 text-slate-400">
                      Ref ID
                   </td>
                   <td className="border-r border-slate-700 px-6 text-center bg-slate-900 text-emerald-400">
                      Sem 1 <span className="opacity-50 text-[9px] ml-1">(50%)</span>
                   </td>
                   <td className="border-r border-slate-700 px-6 text-center bg-slate-900 text-emerald-400">
                      Sem 2 <span className="opacity-50 text-[9px] ml-1">(50%)</span>
                   </td>
                   <td className="px-6 text-center bg-slate-950 text-amber-400 border-b-4 border-amber-500">
                      Average
                   </td>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const scores = allGrades[s.id]?.[entrySubject] || { sem1: 0, sem2: 0 };
                  const avg = Math.round((scores.sem1 + scores.sem2) / 2);
                  return (
                    <tr key={s.id} className="h-14 hover:bg-sky-50/30 group transition-colors border-b border-slate-100">
                      <td className="border-r border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-400">{idx + 3}</td>
                      <td className="border-r border-slate-200 px-6 font-black text-slate-700 text-xs truncate uppercase group-hover:text-[#0090C1] transition-colors">{s.name}</td>
                      <td className="border-r border-slate-200 px-6 text-center font-mono text-[10px] text-slate-400 font-bold bg-slate-50/50">{s.id}</td>
                      <td className="border-r border-slate-200 text-center p-0 relative">
                        <input type="number" className="w-full h-full text-center outline-none font-bold text-xs bg-transparent focus:bg-emerald-50 focus:text-emerald-700 transition-all text-slate-600" value={scores.sem1 || ''} onChange={(e) => handleGradeEntry(s.id, 'sem1', e.target.value)} />
                      </td>
                      <td className="border-r border-slate-200 text-center p-0 relative">
                        <input type="number" className="w-full h-full text-center outline-none font-bold text-xs bg-transparent focus:bg-emerald-50 focus:text-emerald-700 transition-all text-slate-600" value={scores.sem2 || ''} onChange={(e) => handleGradeEntry(s.id, 'sem2', e.target.value)} />
                      </td>
                      <td className={`text-center font-black text-sm bg-slate-50/30 ${avg < 50 ? 'text-rose-500 bg-rose-50/30' : 'text-[#059669]'}`}>
                        {avg || 0}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 animate-in zoom-in-95 duration-500 bg-[#f4f7f9] min-h-full">
             <div className="bg-white border rounded-[3rem] shadow-2xl overflow-hidden max-w-7xl mx-auto p-12">
                <OfficialHeader branding={branding} subTitle={`Mark List - ${selectedDept}`} />
                <div className="overflow-x-auto border-2 border-slate-800 mt-10 rounded-t-xl">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-[#0f172a] text-white text-[10px] uppercase font-black tracking-wider">
                         <tr>
                            <th className="px-6 py-5 w-16 text-center border-r border-slate-600">No.</th>
                            <th className="px-8 py-5 min-w-[240px] border-r border-slate-600">Full Name</th>
                            {SUBJECT_DEFINITIONS.slice(0, 8).map(sub => <th key={sub.id} className="px-2 py-5 text-center w-14 border-r border-slate-600">{sub.short}</th>)}
                            <th className="px-6 py-5 text-center bg-sky-600 text-white w-16 shadow-inner">Avg%</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredStudents.map((s, idx) => {
                            let total = 0; let count = 0;
                            SUBJECT_DEFINITIONS.slice(0, 8).forEach(sub => {
                              const g = allGrades[s.id]?.[sub.id] || { sem1: 0, sem2: 0 };
                              if (g.sem1 || g.sem2) { total += (g.sem1 + g.sem2) / 2; count++; }
                            });
                            return (
                              <tr key={s.id} className="hover:bg-slate-50">
                                 <td className="px-6 py-3 text-center font-black text-slate-400 border-r">{idx + 1}</td>
                                 <td className="px-8 py-3 border-r font-black text-slate-800 uppercase text-xs">{s.name}</td>
                                 {SUBJECT_DEFINITIONS.slice(0, 8).map(sub => {
                                    const g = allGrades[s.id]?.[sub.id] || { sem1: 0, sem2: 0 };
                                    const a = Math.round((g.sem1 + g.sem2) / 2);
                                    return <td key={sub.id} className="px-2 py-3 text-center text-xs font-bold border-r">{a || '-'}</td>;
                                 })}
                                 <td className="px-6 py-3 text-center font-black text-[#059669] bg-slate-50">{count > 0 ? Math.round(total / count) : 0}%</td>
                              </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </div>

      {showSaveToast && (
        <div className="fixed bottom-10 right-10 z-[70] animate-in slide-in-from-right-4">
          <div className="bg-[#059669] text-white px-10 py-5 rounded-2xl shadow-2xl flex items-center gap-4">
            <CheckCircle2 size={24} />
            <div><p className="font-black text-sm uppercase">Scores Committed</p></div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setAnalysisResult(null)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100">
                  <BrainCircuit size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Class Performance Insight</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AI-Powered Academic Analytics</p>
                </div>
              </div>
              <button onClick={() => setAnalysisResult(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors shadow-sm"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 prose-chat max-w-none bg-white scroll-smooth leading-relaxed">
               <div dangerouslySetInnerHTML={{ __html: marked.parse(analysisResult) }} />
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button onClick={() => setAnalysisResult(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl">
                 Close Report
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
