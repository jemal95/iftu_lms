
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, CheckCircle2, AlertCircle, Mail, Save, Filter, ArrowUpDown } from 'lucide-react';
import { AuthUser, User, StudentAcademicRecord, SubjectGrade } from '../types';
import { db } from '../utils/persistence';

interface GradebookViewProps {
  user: AuthUser;
}

const SUBJECTS = [
  'MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'ENGLISH', 
  'AFAAN OROMOO', 'AMHARIC', 'CIVICS', 'IT', 'HPE'
];

interface GradeEntryState {
  student: User;
  sem1: number;
  sem2: number;
}

export const GradebookView: React.FC<GradebookViewProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('MATHEMATICS');
  const [students, setStudents] = useState<User[]>([]);
  const [grades, setGrades] = useState<Record<string, { sem1: number, sem2: number }>>({});
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'score', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Load Data
  useEffect(() => {
    // Filter only students
    const allUsers = db.getUsers();
    const studentUsers = allUsers.filter(u => u.role === 'Student');
    setStudents(studentUsers);

    // Load existing grades for the selected subject
    const gradesMap: Record<string, { sem1: number, sem2: number }> = {};
    const records: StudentAcademicRecord[] = db.getAcademicRecords();
    
    studentUsers.forEach(s => {
      const record = records.find(r => r.studentId === s.id);
      const subjectRecord = record?.subjects?.[selectedSubject] as SubjectGrade | undefined;
      
      if (subjectRecord) {
        gradesMap[s.id] = {
          sem1: subjectRecord.sem1,
          sem2: subjectRecord.sem2
        };
      } else {
        gradesMap[s.id] = { sem1: 0, sem2: 0 };
      }
    });
    setGrades(gradesMap);
  }, [selectedSubject]);

  const handleGradeChange = (studentId: string, type: 'sem1' | 'sem2', value: string) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: numValue
      }
    }));
  };

  const handleSaveAll = () => {
    Object.entries(grades).forEach(([studentId, scores]) => {
      const s = scores as { sem1: number; sem2: number };
      db.saveStudentGrade(studentId, selectedSubject, 'sem1', s.sem1);
      db.saveStudentGrade(studentId, selectedSubject, 'sem2', s.sem2);
    });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleSort = (key: 'name' | 'score') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedStudents = useMemo(() => {
    let filtered = students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.id.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        const scoreA = ((grades[a.id]?.sem1 || 0) + (grades[a.id]?.sem2 || 0)) / 2;
        const scoreB = ((grades[b.id]?.sem1 || 0) + (grades[b.id]?.sem2 || 0)) / 2;
        return sortConfig.direction === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
    });
  }, [students, search, grades, sortConfig]);

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score >= 80) return 'bg-sky-100 text-sky-700 border-sky-200';
    if (score >= 70) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {showSaveToast && (
        <div className="fixed top-24 right-8 z-[70] animate-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold text-sm">Transcript Updated</p>
              <p className="text-xs opacity-90">Semester grades recorded successfully.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Teacher Gradebook</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Record Semester I and II results for the academic transcript.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleSaveAll}
             className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all active:scale-95"
           >
             <Save size={20} />
             Save to Transcript
           </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6 items-center">
        {/* Subject Selector */}
        <div className="w-full xl:w-64">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Select Subject</label>
           <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-sky-100"
             >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Find student by name or ID..." 
            className="w-full pl-14 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 w-full xl:w-auto">
           <button onClick={() => handleSort('name')} className={`flex-1 xl:flex-none px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border flex items-center gap-2 justify-center ${sortConfig.key === 'name' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white text-slate-400 border-slate-100'}`}>
             <ArrowUpDown size={14} /> Name
           </button>
           <button onClick={() => handleSort('score')} className={`flex-1 xl:flex-none px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border flex items-center gap-2 justify-center ${sortConfig.key === 'score' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-white text-slate-400 border-slate-100'}`}>
             <ArrowUpDown size={14} /> Score
           </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Student Identity</th>
                <th className="px-4 py-6 text-center w-32">Semester I</th>
                <th className="px-4 py-6 text-center w-32">Semester II</th>
                <th className="px-8 py-6 text-center w-40">Yearly Average</th>
                <th className="px-8 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {processedStudents.map(student => {
                const studentGrades = grades[student.id] || { sem1: 0, sem2: 0 };
                const average = (studentGrades.sem1 + studentGrades.sem2) / 2;
                const roundedAvg = Math.round(average);
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <img src={student.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md" alt="" />
                         <div>
                           <p className="text-sm font-bold text-slate-800">{student.name}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ID: {student.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                       <input 
                         type="number" 
                         min="0" 
                         max="100"
                         className="w-20 text-center bg-slate-50 border border-slate-200 rounded-lg py-2 font-bold text-slate-700 focus:ring-2 focus:ring-[#0090C1] outline-none"
                         value={studentGrades.sem1}
                         onChange={(e) => handleGradeChange(student.id, 'sem1', e.target.value)}
                       />
                    </td>
                    <td className="px-4 py-5 text-center">
                       <input 
                         type="number" 
                         min="0" 
                         max="100"
                         className="w-20 text-center bg-slate-50 border border-slate-200 rounded-lg py-2 font-bold text-slate-700 focus:ring-2 focus:ring-[#0090C1] outline-none"
                         value={studentGrades.sem2}
                         onChange={(e) => handleGradeChange(student.id, 'sem2', e.target.value)}
                       />
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex items-center justify-center gap-3">
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${getGradeColor(roundedAvg)}`}>
                             {getLetterGrade(roundedAvg)}
                          </span>
                          <div className="flex flex-col items-start w-16">
                             <span className="text-sm font-black text-slate-800">{roundedAvg}%</span>
                             <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div className={`h-full ${roundedAvg >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${roundedAvg}%` }} />
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         {roundedAvg >= 50 ? (
                           <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                              <CheckCircle2 size={14} /> 
                              <span className="text-[10px] font-black uppercase tracking-widest">Promoted</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                              <AlertCircle size={14} /> 
                              <span className="text-[10px] font-black uppercase tracking-widest">Review</span>
                           </div>
                         )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {processedStudents.map(student => {
          const studentGrades = grades[student.id] || { sem1: 0, sem2: 0 };
          const average = (studentGrades.sem1 + studentGrades.sem2) / 2;
          const roundedAvg = Math.round(average);

          return (
            <div key={student.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <img src={student.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                  <div>
                     <p className="text-sm font-bold text-gray-800">{student.name}</p>
                     <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">ID: {student.id}</p>
                  </div>
                  <div className="ml-auto">
                     <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${getGradeColor(roundedAvg)}`}>
                        {getLetterGrade(roundedAvg)}
                     </span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sem I</label>
                     <input 
                       type="number" 
                       min="0" 
                       max="100"
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-[#0090C1] outline-none text-center"
                       value={studentGrades.sem1}
                       onChange={(e) => handleGradeChange(student.id, 'sem1', e.target.value)}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sem II</label>
                     <input 
                       type="number" 
                       min="0" 
                       max="100"
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-[#0090C1] outline-none text-center"
                       value={studentGrades.sem2}
                       onChange={(e) => handleGradeChange(student.id, 'sem2', e.target.value)}
                     />
                  </div>
               </div>

               <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Average</span>
                     <span className="text-sm font-black text-slate-800">{roundedAvg}%</span>
                  </div>
                  <div>
                     {roundedAvg >= 50 ? (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                           <CheckCircle2 size={12} /> 
                           <span className="text-[9px] font-black uppercase tracking-widest">Promoted</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                           <AlertCircle size={12} /> 
                           <span className="text-[9px] font-black uppercase tracking-widest">Review</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
