
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Save, 
  ChevronDown, 
  Printer, 
  TrendingUp,
  MoreHorizontal,
  Grid3X3,
  FileText,
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { AuthUser, User, SubjectGrade, InstitutionalBranding } from '../types';
import { db } from '../utils/persistence';
import { OfficialHeader } from './OfficialHeader';

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

  useEffect(() => {
    setBranding(db.getBranding());
  }, []);

  // LOAD STUDENTS FOR THE SELECTED GRADE
  useEffect(() => {
    const allUsers = db.getUsers();
    // Filter by the selected grade level
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

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, search]);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden bg-[#F3F4F6]">
      {/* HEADER BAR (Institution Color) */}
      <div className="bg-[#059669] h-16 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white"><Grid3X3 size={24} /></div>
            <h1 className="text-white text-xl font-bold tracking-tight uppercase">{branding.schoolName} Result Hub</h1>
         </div>
         <button 
           onClick={toggleFullscreen}
           className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/20 flex items-center gap-2"
         >
           <Maximize2 size={16} /> Fullscreen
         </button>
      </div>

      {/* ACTION & FILTER RIBBON */}
      <div className="bg-white border-b p-4 flex flex-wrap items-center gap-6 shrink-0 z-10 print:hidden shadow-sm">
         <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">TARGET CLASS</span>
            <div className="relative group">
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)} 
                className="bg-slate-50 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-black outline-none cursor-pointer text-[#059669] appearance-none pr-10 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              >
                 {DEPARTMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#059669]" size={16} />
            </div>
         </div>

         <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#059669] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Mark List..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-all" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
         </div>

         <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setViewMode('Spreadsheet')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Spreadsheet' ? 'bg-white text-[#059669] shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>EDIT GRID</button>
            <button onClick={() => setViewMode('Official')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Official' ? 'bg-white text-[#059669] shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>OFFICIAL ROSTER</button>
         </div>

         <button onClick={() => window.print()} className="bg-[#1e293b] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95">
            <Printer size={18} /> PRINT LIST
         </button>
      </div>

      <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
        {viewMode === 'Spreadsheet' ? (
          <div className="inline-block min-w-full">
            <table className="border-collapse table-fixed w-full">
              <thead>
                {/* Row 0: Excel Column Letters */}
                <tr className="bg-slate-50 h-10">
                  <th className="w-16 border border-slate-200"></th>
                  {EXCEL_COLS.map(col => (
                    <th key={col} className="w-64 border border-slate-200 text-xs font-medium text-slate-400 text-center">{col}</th>
                  ))}
                </tr>
                
                {/* Row 1: Controller Row */}
                <tr className="bg-white h-20">
                   <td className="border border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-400">1</td>
                   <td className="border border-slate-200 p-4" colSpan={2}>
                      <div className="flex items-center gap-10">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ENTRY SUBJECT</span>
                            <div className="relative">
                               <select 
                                 value={entrySubject} 
                                 onChange={(e) => setEntrySubject(e.target.value)} 
                                 className="bg-transparent text-lg font-black text-[#059669] outline-none appearance-none pr-8 cursor-pointer hover:underline"
                               >
                                  {SUBJECT_DEFINITIONS.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                               </select>
                               <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                         </div>
                         <button 
                           onClick={handleSaveBatch} 
                           disabled={isSaving} 
                           className="flex items-center gap-3 px-10 py-3.5 bg-[#059669] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#047857] shadow-xl disabled:opacity-50 transition-all active:scale-95 border-b-4 border-[#036c4b]"
                         >
                            {isSaving ? <TrendingUp size={18} className="animate-spin" /> : <FileText size={18} />} COMMIT SUBJECT SCORES
                         </button>
                      </div>
                   </td>
                   <td className="border border-slate-200 bg-slate-50/20" colSpan={3}></td>
                </tr>

                {/* Row 2: Header Labels */}
                <tr className="bg-slate-50/50 h-14 font-black text-[11px] text-slate-500 uppercase tracking-widest">
                   <td className="border border-slate-200 text-center bg-slate-50 font-bold">2</td>
                   <td className="border border-slate-200 px-6">STUDENT NAME (OFFICIAL)</td>
                   <td className="border border-slate-200 px-6 text-center">ID / REG</td>
                   <td className="border border-slate-200 px-6 text-center">SEM 1 (50%)</td>
                   <td className="border border-slate-200 px-6 text-center">SEM 2 (50%)</td>
                   <td className="border border-slate-200 px-6 text-center">AVERAGE</td>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const scores = allGrades[s.id]?.[entrySubject] || { sem1: 0, sem2: 0 };
                  const avg = Math.round((scores.sem1 + scores.sem2) / 2);
                  return (
                    <tr key={s.id} className="h-14 hover:bg-slate-50 transition-colors group">
                      <td className="border border-slate-200 bg-slate-50 text-center text-xs font-black text-slate-400">{idx + 3}</td>
                      <td className="border border-slate-200 px-6 font-black text-slate-700 text-xs truncate uppercase tracking-tight">{s.name}</td>
                      <td className="border border-slate-200 px-6 text-center font-mono text-[11px] text-slate-400 font-bold">{s.id}</td>
                      <td className="border border-slate-200 text-center bg-white group-hover:bg-slate-50/50">
                        <input 
                          type="number" 
                          className="w-full h-full text-center outline-none focus:bg-sky-50 font-black text-xs p-4 text-slate-600" 
                          value={scores.sem1 || ''} 
                          onChange={(e) => handleGradeEntry(s.id, 'sem1', e.target.value)} 
                          placeholder="-"
                        />
                      </td>
                      <td className="border border-slate-200 text-center bg-white group-hover:bg-slate-50/50">
                        <input 
                          type="number" 
                          className="w-full h-full text-center outline-none focus:bg-sky-50 font-black text-xs p-4 text-slate-600" 
                          value={scores.sem2 || ''} 
                          onChange={(e) => handleGradeEntry(s.id, 'sem2', e.target.value)} 
                          placeholder="-"
                        />
                      </td>
                      <td className={`border border-slate-200 text-center font-black text-sm ${avg === 0 ? 'text-slate-200' : avg < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {avg || 0}
                      </td>
                    </tr>
                  );
                })}
                {/* Standard Excel Filler Rows */}
                {Array.from({ length: Math.max(0, 12 - filteredStudents.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-14">
                    <td className="border border-slate-200 bg-slate-50 text-center text-xs font-black text-slate-400">{filteredStudents.length + 3 + i}</td>
                    {EXCEL_COLS.map((_, ci) => (
                      <td key={`empty-cell-${i}-${ci}`} className="border border-slate-200 bg-white"></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 animate-in zoom-in-95 duration-500 bg-[#f4f7f9] min-h-full">
             <div className="bg-white border rounded-[3rem] shadow-2xl overflow-hidden max-w-7xl mx-auto p-12">
                <OfficialHeader branding={branding} subTitle={`Official Mark List - ${selectedDept}`} />
                
                <div className="flex gap-12 mb-10 justify-center">
                   <div className="text-left bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade Level</p>
                      <p className="text-sm font-black text-[#059669]">{selectedDept}</p>
                   </div>
                   <div className="text-left bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Year</p>
                      <p className="text-sm font-black text-slate-700">{branding.academicYear}</p>
                   </div>
                </div>

                <div className="overflow-x-auto border-2 border-slate-800">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-[#0f172a] text-white text-[9px] uppercase font-black border-b border-slate-200">
                         <tr>
                            <th className="px-6 py-4 w-16 text-center border-r border-slate-600">No.</th>
                            <th className="px-8 py-4 min-w-[240px] border-r border-slate-600">Student Full Name</th>
                            {SUBJECT_DEFINITIONS.slice(0, 8).map(sub => <th key={sub.id} className="px-2 py-4 text-center w-14 border-r border-slate-600">{sub.short}</th>)}
                            <th className="px-6 py-4 text-center bg-[#0090C1] text-white w-16">Avg%</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredStudents.map((s, idx) => {
                            let totalScore = 0;
                            let count = 0;
                            SUBJECT_DEFINITIONS.slice(0, 8).forEach(sub => {
                              const g = allGrades[s.id]?.[sub.id] || { sem1: 0, sem2: 0 };
                              if (g.sem1 || g.sem2) {
                                totalScore += (g.sem1 + g.sem2) / 2;
                                count++;
                              }
                            });
                            const avgTotal = count > 0 ? Math.round(totalScore / count) : 0;

                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-3 text-center font-black text-slate-400 border-r">{idx + 1}</td>
                                 <td className="px-8 py-3 border-r"><p className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.name}</p></td>
                                 {SUBJECT_DEFINITIONS.slice(0, 8).map(sub => {
                                    const grades = allGrades[s.id]?.[sub.id] || { sem1: 0, sem2: 0 };
                                    const avg = Math.round((grades.sem1 + grades.sem2) / 2);
                                    return <td key={sub.id} className={`px-2 py-3 text-center text-xs font-bold border-r ${avg < 50 ? 'text-rose-500' : 'text-slate-600'}`}>{avg || '-'}</td>;
                                 })}
                                 <td className="px-6 py-3 text-center font-black text-[#059669] bg-emerald-50/10">{avgTotal}%</td>
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
          <div className="bg-[#059669] text-white px-10 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-black text-sm uppercase">Scores Committed</p>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Registry Synchronized</p>
            </div>
            <ChevronRight size={20} className="ml-2" />
          </div>
        </div>
      )}
    </div>
  );
};
