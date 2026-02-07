
import React, { useState, useEffect, useMemo } from 'react';
import { Download, Loader2, AlertCircle, Search, Fingerprint } from 'lucide-react';
import { AuthUser, StudentAcademicRecord, User, InstitutionalBranding } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Signature } from './Signature';
import { db } from '../utils/persistence';
import { OfficialHeader } from './OfficialHeader';

interface TranscriptViewProps {
  user: AuthUser;
}

const CORE_SUBJECTS = ['AFAAN OROMOO', 'AMHARIC', 'ENGLISH', 'MATHEMATICS', 'CIVICS', 'IT', 'HPE'];
const NATURAL_SCIENCES = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'TECHNICAL DRAWING'];
const SOCIAL_SCIENCES = ['GEOGRAPHY', 'HISTORY', 'ECONOMICS', 'GENERAL BUSINESS'];

const ALL_SUBJECTS_ORDER = [
  'AFAAN OROMOO', 'AMHARIC', 'ENGLISH', 'MATHEMATICS',
  'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
  'GEOGRAPHY', 'HISTORY',
  'CIVICS', 'IT', 'HPE',
  'ECONOMICS', 'GENERAL BUSINESS', 'TECHNICAL DRAWING'
];

export const TranscriptView: React.FC<TranscriptViewProps> = ({ user }) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [academicRecord, setAcademicRecord] = useState<StudentAcademicRecord | undefined>(undefined);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [branding, setBranding] = useState<InstitutionalBranding>(db.getBranding());

  const canSearch = user.role === 'Admin' || user.role === 'Teacher';

  useEffect(() => {
    if (user.role === 'Student') {
      const student = db.getUsers().find(u => u.id === user.id);
      if (student) {
        setTargetUser(student);
        const record = db.ensureStudentHistory(student.id, student.name);
        setAcademicRecord(record);
      }
    }
    setBranding(db.getBranding());
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setTargetUser(null);
    setAcademicRecord(undefined);
    const users = db.getUsers();
    const foundUser = users.find(u => 
      u.role === 'Student' && (u.id.toLowerCase() === searchQuery.toLowerCase() || u.nationalId?.toLowerCase() === searchQuery.toLowerCase())
    );
    if (foundUser) {
      setTargetUser(foundUser);
      const record = db.ensureStudentHistory(foundUser.id, foundUser.name);
      setAcademicRecord(record);
    } else {
      setSearchError('Student record not found. Please check the ID.');
    }
  };

  const studentStream = useMemo(() => {
    const dept = targetUser?.department?.toLowerCase() || '';
    if (dept.includes('social')) return 'SOCIAL';
    return 'NATURAL'; 
  }, [targetUser]);

  const handleDownloadPDF = async () => {
    if (!targetUser) return;
    setIsGenerating(true);
    const element = document.getElementById('transcript-doc');
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: 0.1,
        filename: `Transcript_${targetUser.name.replace(/\s/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      try {
        await (window as any).html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Could not generate PDF.");
      }
    } else {
      window.print();
    }
    setIsGenerating(false);
  };

  const isSubjectTaken = (subject: string, gradeLevel: number): boolean => {
    if (gradeLevel <= 10) {
      if (['ECONOMICS', 'GENERAL BUSINESS', 'TECHNICAL DRAWING'].includes(subject)) return false;
      return true;
    }
    if (gradeLevel >= 11) {
      if (CORE_SUBJECTS.includes(subject)) return true;
      if (studentStream === 'NATURAL' && NATURAL_SCIENCES.includes(subject)) return true;
      if (studentStream === 'SOCIAL' && SOCIAL_SCIENCES.includes(subject)) return true;
    }
    return false;
  };

  const getGrade = (gradeLevel: number, subject: string, col: 's1' | 's2') => {
    if (!targetUser || !academicRecord) return null;
    if (!isSubjectTaken(subject, gradeLevel)) return null;
    if (gradeLevel === 12) {
        const rec = academicRecord.subjects[subject];
        return rec ? (col === 's1' ? rec.sem1 : rec.sem2) : null;
    }
    if (academicRecord.previousGrades && academicRecord.previousGrades[gradeLevel]) {
        const rec = academicRecord.previousGrades[gradeLevel][subject];
        return rec ? (col === 's1' ? rec.sem1 : rec.sem2) : null;
    }
    return null;
  };

  const calculateAvg = (s1: number | null, s2: number | null) => (s1 === null || s2 === null) ? null : Math.round((s1 + s2) / 2);

  const calculateYearlyAverage = (gradeLevel: number) => {
    let total = 0, count = 0;
    ALL_SUBJECTS_ORDER.forEach(subj => {
      const avg = calculateAvg(getGrade(gradeLevel, subj, 's1'), getGrade(gradeLevel, subj, 's2'));
      if (avg !== null) { total += avg; count++; }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-html2canvas-ignore="true">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('transcript')}</h2>
          <p className="text-sm text-slate-500 mt-1 font-bold uppercase tracking-widest">Official Registry Retrieval</p>
        </div>
      </div>

      {canSearch && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center space-y-6 max-w-4xl mx-auto" data-html2canvas-ignore="true">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Search Student Registry</h3>
           <form onSubmit={handleSearch} className="flex gap-4 w-full relative">
              <div className="relative flex-1">
                 <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" placeholder="Enter ID or National Index (e.g. U101)" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-700 focus:border-[#0090C1] transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button type="submit" className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-[#0090C1] transition-all shadow-xl active:scale-95">Load Record</button>
           </form>
           {searchError && <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-50 px-6 py-3 rounded-2xl animate-in fade-in"><AlertCircle size={16} /> {searchError}</div>}
        </div>
      )}

      {targetUser ? (
        <div className="w-full overflow-x-auto pb-12 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-end max-w-[1123px] mx-auto mb-6" data-html2canvas-ignore="true">
             <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-emerald-700 transition-all disabled:opacity-75 text-[10px] uppercase tracking-[0.2em]">
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} {isGenerating ? 'Compiling Registry...' : 'Download Official Transcript'}
              </button>
          </div>

          <div className="min-w-fit flex justify-center p-4">
            <div id="transcript-doc" className="bg-white mx-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] print:shadow-none shrink-0 relative text-slate-900" style={{ width: '1123px', minHeight: '794px', padding: '40px', fontFamily: '"Times New Roman", serif' }}>
               <div className="border-[4px] border-double border-slate-800 h-full p-1 relative">
                  <div className="border border-slate-400 h-full p-8">
                  
                    {/* Official Dynamic Header */}
                    <OfficialHeader branding={branding} subTitle="Official Transcript" />

                    <div className="bg-[#0f172a] text-white py-2 px-4 text-center mb-6 border-y-2 border-slate-900">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em]">STUDENT ACADEMIC PERFORMANCE SUMMARY / GALMEE QABXII BARATAA</h3>
                    </div>

                    <div className="border-2 border-slate-800 mb-6 font-sans overflow-hidden rounded-xl shadow-sm">
                       <div className="flex border-b border-slate-400">
                          <div className="w-32 bg-slate-50 p-3 border-r border-slate-400 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</div>
                          <div className="flex-1 p-3 text-sm font-black text-[#0090C1] uppercase tracking-wide bg-white">{targetUser.name}</div>
                          <div className="w-32 bg-slate-50 p-3 border-l border-r border-slate-400 text-[10px] font-black uppercase text-center tracking-widest text-slate-400">Index ID</div>
                          <div className="w-48 p-3 text-sm font-black text-center">{targetUser.nationalId || targetUser.id}</div>
                          <div className="w-32 bg-slate-50 p-3 border-l border-r border-slate-400 text-[10px] font-black uppercase text-center tracking-widest text-slate-400">Academic Year</div>
                          <div className="w-32 p-3 text-sm font-black text-center text-emerald-600">{branding.academicYear}</div>
                       </div>
                       <div className="flex">
                          <div className="w-32 bg-slate-50 p-3 border-r border-slate-400 text-[10px] font-black uppercase tracking-widest text-slate-400">Stream</div>
                          <div className="flex-1 p-3 text-xs font-black uppercase text-center border-r border-slate-400 text-slate-700">{studentStream} SCIENCES</div>
                          <div className="w-16 bg-slate-50 p-3 border-r border-slate-400 text-[10px] font-black uppercase text-center tracking-widest text-slate-400">SEX</div>
                          <div className="w-48 p-3 text-sm font-black text-center border-r border-slate-400">{targetUser.gender || 'M'}</div>
                          <div className="w-32 bg-slate-50 p-3 border-r border-slate-400 text-[10px] font-black uppercase text-center tracking-widest text-slate-400">ADMISSION</div>
                          <div className="w-32 p-3 text-sm font-black text-center">SEPT 2018 (E.C)</div>
                       </div>
                    </div>

                    <div className="mb-6">
                       <table className="w-full border-collapse border-2 border-slate-800 text-center text-xs font-sans">
                          <thead>
                             <tr className="bg-[#0f172a] text-white uppercase font-black tracking-widest">
                                <th className="border-r border-slate-600 p-2.5 w-48 text-left pl-6" rowSpan={2}>SUBJECT MODULES</th>
                                <th className="border-r border-slate-600 p-1" colSpan={3}>Grade 9</th>
                                <th className="border-r border-slate-600 p-1" colSpan={3}>Grade 10</th>
                                <th className="border-r border-slate-600 p-1" colSpan={3}>Grade 11</th>
                                <th className="p-1 bg-[#0090C1]" colSpan={3}>Grade 12</th>
                             </tr>
                             <tr className="bg-slate-100 font-black text-[9px] text-slate-600 tracking-widest">
                                <th className="border border-slate-400 p-1">S I</th><th className="border border-slate-400 p-1">S II</th><th className="border-r-2 border-y border-l border-slate-400 p-1 bg-slate-200">AVG</th>
                                <th className="border border-slate-400 p-1">S I</th><th className="border border-slate-400 p-1">S II</th><th className="border-r-2 border-y border-l border-slate-400 p-1 bg-slate-200">AVG</th>
                                <th className="border border-slate-400 p-1">S I</th><th className="border border-slate-400 p-1">S II</th><th className="border-r-2 border-y border-l border-slate-400 p-1 bg-slate-200">AVG</th>
                                <th className="border border-slate-400 p-1">S I</th><th className="border border-slate-400 p-1">S II</th><th className="border-y border-l border-slate-400 p-1 bg-slate-200">AVG</th>
                             </tr>
                          </thead>
                          <tbody>
                             {ALL_SUBJECTS_ORDER.map((subject, idx) => {
                                const g9s1 = getGrade(9, subject, 's1'); const g9s2 = getGrade(9, subject, 's2');
                                const g10s1 = getGrade(10, subject, 's1'); const g10s2 = getGrade(10, subject, 's2');
                                const g11s1 = getGrade(11, subject, 's1'); const g11s2 = getGrade(11, subject, 's2');
                                const g12s1 = getGrade(12, subject, 's1'); const g12s2 = getGrade(12, subject, 's2');
                                return (
                                   <tr key={subject} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                      <td className="border-r-2 border-b border-slate-300 p-2.5 text-left pl-6 font-black text-slate-700 uppercase text-[10px]">{subject}</td>
                                      <td className="border border-slate-300 p-1 font-bold">{g9s1 ?? '-'}</td><td className="border border-slate-300 p-1 font-bold">{g9s2 ?? '-'}</td><td className="border-r-2 border-y border-l border-slate-300 p-1 font-black bg-slate-100/50">{calculateAvg(g9s1, g9s2) ?? '-'}</td>
                                      <td className="border border-slate-300 p-1 font-bold">{g10s1 ?? '-'}</td><td className="border border-slate-300 p-1 font-bold">{g10s2 ?? '-'}</td><td className="border-r-2 border-y border-l border-slate-300 p-1 font-black bg-slate-100/50">{calculateAvg(g10s1, g10s2) ?? '-'}</td>
                                      <td className="border border-slate-300 p-1 font-bold">{g11s1 ?? '-'}</td><td className="border border-slate-300 p-1 font-bold">{g11s2 ?? '-'}</td><td className="border-r-2 border-y border-l border-slate-300 p-1 font-black bg-slate-100/50">{calculateAvg(g11s1, g11s2) ?? '-'}</td>
                                      <td className="border border-slate-300 p-1 font-black text-[#0090C1]">{g12s1 ?? '-'}</td><td className="border border-slate-300 p-1 font-black text-[#0090C1]">{g12s2 ?? '-'}</td><td className="border-y border-l border-slate-300 p-1 font-black bg-slate-100/50">{calculateAvg(g12s1, g12s2) ?? '-'}</td>
                                   </tr>
                                );
                             })}
                             <tr className="border-t-2 border-slate-800 font-black bg-slate-100 uppercase text-[10px]">
                                <td className="border-r-2 border-slate-300 p-2.5 text-left pl-6">Cumulative Avg%</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">{calculateYearlyAverage(9)}%</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">{calculateYearlyAverage(10)}%</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">{calculateYearlyAverage(11)}%</td>
                                <td colSpan={3} className="p-1 text-[#0090C1] text-xs">{calculateYearlyAverage(12)}%</td>
                             </tr>
                             <tr className="border-t-2 border-slate-800 font-black text-white bg-slate-800 uppercase text-[10px]">
                                <td className="p-2.5 text-left pl-6 tracking-widest">Final Status</td>
                                <td colSpan={3} className="border-r border-slate-600">Promoted</td>
                                <td colSpan={3} className="border-r border-slate-600">Promoted</td>
                                <td colSpan={3} className="border-r border-slate-600">Promoted</td>
                                <td colSpan={3} className="bg-emerald-600">GRADUATED</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>

                    <div className="flex justify-between items-end mt-10">
                       <div className="text-[9px] space-y-1 text-slate-500 border-2 border-slate-800 p-4 bg-slate-50 w-56 font-black uppercase">
                          <p className="underline mb-2">Grading Protocol</p>
                          <div className="flex justify-between"><span>90-100</span><span className="text-slate-800">A+ Dist.</span></div>
                          <div className="flex justify-between"><span>80-89</span><span className="text-slate-800">B Very Good</span></div>
                          <div className="flex justify-between"><span>50-69</span><span className="text-slate-800">D Satisfact.</span></div>
                          <div className="flex justify-between"><span>Below 50</span><span className="text-rose-500">F Fail</span></div>
                       </div>
                       <div className="flex items-end gap-16">
                          <div className="text-center relative">
                             <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-90 pointer-events-none">
                                <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                  <defs><path id="tCircleTop" d="M 20,100 A 80,80 0 0,1 180,100" /><path id="tCircleBottom" d="M 180,100 A 80,80 0 0,1 20,100" /></defs>
                                  <circle cx="100" cy="100" r="98" fill="none" stroke="#2e1065" strokeWidth="2.5" /><circle cx="100" cy="100" r="65" fill="none" stroke="#2e1065" strokeWidth="1" />
                                  <text fill="#2e1065" fontSize="11" fontWeight="900" letterSpacing="1.2"><textPath href="#tCircleTop" startOffset="50%" textAnchor="middle">{branding.bureauNameLocal.toUpperCase()}</textPath></text>
                                  <text fill="#2e1065" fontSize="10" fontWeight="bold" letterSpacing="1"><textPath href="#tCircleBottom" startOffset="50%" textAnchor="middle">{branding.bureauName.toUpperCase()}</textPath></text>
                                  <text x="100" y="55" fontSize="6.5" fontWeight="black" fill="#2e1065" textAnchor="middle">{branding.zoneName.toUpperCase()}</text>
                                  <text x="100" y="64" fontSize="6.5" fontWeight="black" fill="#2e1065" textAnchor="middle">{branding.woredaName.toUpperCase()}</text>
                                  <g transform="translate(100, 110) scale(0.7)"><path d="M-55,0 C-55,-45 0,-55 0,-55 C0,-55 55,-45 55,0 C45,10 0,5 0,5 C0,5 -45,10 -55,0 Z" fill="#2e1065" /><path d="M-12,0 L-18,45 Q-25,55 -35,55 L35,55 Q25,55 18,45 L12,0 Z" fill="#2e1065" /><path d="M0,0 L0,-35 M0,0 L-25,-20 M0,0 L25,-20" stroke="white" strokeWidth="2" fill="none" /></g>
                                  <text x="100" y="155" fontSize="7" fontWeight="900" fill="#2e1065" textAnchor="middle">{branding.schoolNameLocal.toUpperCase()}</text>
                                  <text x="100" y="163" fontSize="6" fontWeight="bold" fill="#2e1065" textAnchor="middle">{branding.schoolName.toUpperCase()}</text>
                                </svg>
                             </div>
                             <div className="mb-2 h-14 w-48 border-b-2 border-slate-800 flex items-end justify-center">
                                <Signature className="h-10 w-28 text-blue-900" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">School Principal Authorization</p>
                          </div>
                          <div className="text-center">
                             <div className="mb-2 h-14 w-48 border-b-2 border-slate-800"></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registrar Official Signature</p>
                          </div>
                          <div className="text-center">
                             <p className="text-xs font-black text-slate-800 mb-2">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                             <div className="w-36 border-t-2 border-slate-800"></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Date of Issue</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-32 text-center opacity-30" data-html2canvas-ignore="true">
           <Search size={80} className="text-slate-300 mb-6" />
           <p className="font-black text-slate-400 uppercase tracking-[0.4em]">Initialize Registry Lookup</p>
        </div>
      )}
    </div>
  );
};
