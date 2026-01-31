
import React, { useState, useEffect, useMemo } from 'react';
import { Download, Loader2, AlertCircle, Search, Fingerprint } from 'lucide-react';
import { AuthUser, StudentAcademicRecord, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Signature } from './Signature';
import { db } from '../utils/persistence';

interface TranscriptViewProps {
  user: AuthUser;
}

// Define subject categories
const CORE_SUBJECTS = ['AFAAN OROMOO', 'AMHARIC', 'ENGLISH', 'MATHEMATICS', 'CIVICS', 'IT', 'HPE'];
const NATURAL_SCIENCES = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'TECHNICAL DRAWING'];
const SOCIAL_SCIENCES = ['GEOGRAPHY', 'HISTORY', 'ECONOMICS', 'GENERAL BUSINESS'];

// Combined list for the transcript rows
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
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Determine if searching is allowed (Admin/Teacher) or if student is searching self
  const canSearch = user.role === 'Admin' || user.role === 'Teacher';

  // Automatically load transcript for student role on mount
  useEffect(() => {
    if (user.role === 'Student') {
      const student = db.getUsers().find(u => u.id === user.id);
      if (student) {
        setTargetUser(student);
        // Initialize history if needed and load record
        const record = db.ensureStudentHistory(student.id, student.name);
        setAcademicRecord(record);
      }
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setTargetUser(null);
    setAcademicRecord(undefined);

    const users = db.getUsers();
    // Search by ID (exact) or Name (includes)
    const foundUser = users.find(u => 
      u.role === 'Student' && (
        u.id.toLowerCase() === searchQuery.toLowerCase() || 
        u.nationalId?.toLowerCase() === searchQuery.toLowerCase()
      )
    );

    if (foundUser) {
      setTargetUser(foundUser);
      // Ensure history exists and freeze it, then retrieve
      const record = db.ensureStudentHistory(foundUser.id, foundUser.name);
      setAcademicRecord(record);
    } else {
      setSearchError('Student record not found. Please check the ID.');
    }
  };

  const studentStream = useMemo(() => {
    const dept = targetUser?.department?.toLowerCase() || '';
    if (dept.includes('social')) return 'SOCIAL';
    if (dept.includes('natural') || dept.includes('science')) return 'NATURAL';
    return 'NATURAL'; // Default
  }, [targetUser]);

  const handleDownloadPDF = async () => {
    if (!targetUser) return;
    setIsGenerating(true);
    const element = document.getElementById('transcript-doc');
    
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: 0.1,
        filename: `IFTU_Transcript_${targetUser.name.replace(/\s/g, '_')}.pdf`,
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

  // Helper to determine if a subject is taken in a specific grade based on stream
  const isSubjectTaken = (subject: string, gradeLevel: number): boolean => {
    // Common subjects taken by everyone in all grades (or at least 9-12 usually)
    // Note: In Ethiopian curriculum, streams start at Grade 11.
    
    // Subjects taken by EVERYONE in G9 & G10
    if (gradeLevel <= 10) {
      if (['ECONOMICS', 'GENERAL BUSINESS', 'TECHNICAL DRAWING'].includes(subject)) return false;
      return true; // All other subjects are common in 9/10
    }

    // Grade 11 & 12 (Preparatory)
    if (gradeLevel >= 11) {
      if (CORE_SUBJECTS.includes(subject)) return true;
      
      if (studentStream === 'NATURAL') {
        if (NATURAL_SCIENCES.includes(subject)) return true;
        if (SOCIAL_SCIENCES.includes(subject)) return false;
      }
      
      if (studentStream === 'SOCIAL') {
        if (SOCIAL_SCIENCES.includes(subject)) return true;
        if (NATURAL_SCIENCES.includes(subject)) return false;
      }
    }
    
    return false;
  };

  // Get grades from persistent DB record
  const getGrade = (gradeLevel: number, subject: string, col: 's1' | 's2') => {
    if (!targetUser || !academicRecord) return null;
    if (!isSubjectTaken(subject, gradeLevel)) return null;

    // For Grade 12 (Current Year), use 'subjects' key
    if (gradeLevel === 12) {
        const rec = academicRecord.subjects[subject];
        if (rec) {
            return col === 's1' ? rec.sem1 : rec.sem2;
        }
        return null;
    }

    // For Grades 9, 10, 11 use 'previousGrades' key
    if (academicRecord.previousGrades && academicRecord.previousGrades[gradeLevel]) {
        const rec = academicRecord.previousGrades[gradeLevel][subject];
        if (rec) {
            return col === 's1' ? rec.sem1 : rec.sem2;
        }
    }

    return null;
  };

  const calculateAvg = (s1: number | null, s2: number | null) => {
    if (s1 === null || s2 === null) return null;
    return Math.round((s1 + s2) / 2);
  };

  // Calculate Yearly GPA (Simple average of subject averages)
  const calculateYearlyAverage = (gradeLevel: number) => {
    let total = 0;
    let count = 0;
    ALL_SUBJECTS_ORDER.forEach(subj => {
      const s1 = getGrade(gradeLevel, subj, 's1');
      const s2 = getGrade(gradeLevel, subj, 's2');
      const avg = calculateAvg(s1, s2);
      if (avg !== null) {
        total += avg;
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-html2canvas-ignore="true">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('transcript')}</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Official student record retrieval system.</p>
        </div>
      </div>

      {/* Search Bar - Only show for admin/teacher */}
      {canSearch && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4 max-w-3xl mx-auto" data-html2canvas-ignore="true">
           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Retrieve Academic Record</h3>
           <form onSubmit={handleSearch} className="flex gap-4 w-full relative">
              <div className="relative flex-1">
                 <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input 
                   type="text" 
                   placeholder="Enter Student ID or National ID (e.g. U101)" 
                   className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:border-[#0090C1] transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <button type="submit" className="px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007ba6] transition-all shadow-xl shadow-sky-500/20 active:scale-95">
                 Search Record
              </button>
           </form>
           {searchError && (
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-50 px-4 py-2 rounded-xl animate-in fade-in">
                 <AlertCircle size={14} /> {searchError}
              </div>
           )}
        </div>
      )}

      {targetUser ? (
        <div className="w-full overflow-x-auto pb-12 animate-in slide-in-from-bottom-8">
          
          <div className="flex justify-end max-w-[1123px] mx-auto mb-4" data-html2canvas-ignore="true">
             <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all disabled:opacity-75 text-xs uppercase tracking-widest"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isGenerating ? 'Generating PDF...' : 'Download PDF'}
              </button>
          </div>

          <div className="min-w-fit flex justify-center p-4">
            <div 
              id="transcript-doc" 
              className="bg-white mx-auto shadow-2xl print:shadow-none shrink-0 relative text-slate-900"
              style={{ width: '1123px', minHeight: '794px', padding: '40px', fontFamily: '"Times New Roman", serif' }}
            >
               {/* Main Border Container */}
               <div className="border-[3px] border-double border-slate-800 h-full p-1 relative">
                  <div className="border border-slate-400 h-full p-6">
                  
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-2">
                       {/* Ethiopia Flag */}
                       <div className="w-24 h-14 border border-gray-200 flex flex-col shadow-sm">
                          <div className="h-1/3 bg-[#009A44]"></div>
                          <div className="h-1/3 bg-[#FEDD00] flex items-center justify-center relative">
                             <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-white text-[8px]">★</span>
                             </div>
                          </div>
                          <div className="h-1/3 bg-[#D52B1E]"></div>
                       </div>

                       <div className="text-center flex-1 mx-8 pt-2">
                          <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900 font-serif">Oromia Education Bureau / Biiroo Barnoota Oromiyaa</h1>
                          <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                             <span>West Arsi Zone</span>
                             <span className="text-slate-300">|</span>
                             <span>Kore Woreda</span>
                          </div>
                          <div className="w-full h-px bg-slate-800 my-2"></div>
                          <h2 className="text-3xl font-black text-[#0090C1] uppercase tracking-wide font-sans mt-3">IFTU SECONDARY SCHOOL</h2>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] font-sans">M.B. Sad. 2ffaa IFTU</p>
                       </div>

                       {/* Oromia Flag */}
                       <div className="w-24 h-14 border border-gray-200 flex flex-col shadow-sm">
                          <div className="h-1/3 bg-[#D52B1E]"></div>
                          <div className="h-1/3 bg-white flex items-center justify-center relative">
                             <div className="text-black font-bold text-[10px] scale-150">♣</div>
                          </div>
                          <div className="h-1/3 bg-black"></div>
                       </div>
                    </div>

                    {/* Dark Title Bar */}
                    <div className="bg-[#0f172a] text-white py-2 px-4 text-center mb-6 border-y-2 border-slate-900">
                       <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Official Student Transcript / Kaardii Gabaasa Bu'aa Barataa</h3>
                    </div>

                    {/* Student Info Grid */}
                    <div className="border-2 border-slate-800 mb-6 font-sans">
                       {/* Row 1 */}
                       <div className="flex border-b border-slate-400">
                          <div className="w-32 bg-slate-100 p-2 border-r border-slate-400 text-xs font-bold uppercase">Student Name</div>
                          <div className="flex-1 p-2 text-sm font-bold text-[#0090C1] uppercase tracking-wide bg-white">{targetUser.name}</div>
                          <div className="w-32 bg-slate-100 p-2 border-l border-r border-slate-400 text-xs font-bold uppercase text-center">ID Number</div>
                          <div className="w-48 p-2 text-sm font-bold text-center">{targetUser.nationalId || targetUser.id}</div>
                          <div className="w-32 bg-slate-100 p-2 border-l border-r border-slate-400 text-xs font-bold uppercase text-center">Stream</div>
                          <div className="w-32 p-2 text-sm font-bold text-center">{studentStream === 'NATURAL' ? 'Natural Sci.' : 'Social Sci.'}</div>
                       </div>
                       {/* Row 2 */}
                       <div className="flex">
                          <div className="w-32 bg-slate-100 p-2 border-r border-slate-400 text-xs font-bold uppercase">Gender</div>
                          <div className="flex-1 p-2 text-sm font-bold uppercase text-center border-r border-slate-400">{targetUser.gender || 'Male'}</div>
                          <div className="w-16 bg-slate-100 p-2 border-r border-slate-400 text-xs font-bold uppercase text-center">DOB</div>
                          <div className="w-48 p-2 text-sm font-bold text-center border-r border-slate-400">{targetUser.birthday || '2005-01-15'}</div>
                          <div className="w-32 bg-slate-100 p-2 border-r border-slate-400 text-xs font-bold uppercase text-center">Admission</div>
                          <div className="w-32 p-2 text-sm font-bold text-center">Sept 2021</div>
                       </div>
                    </div>

                    {/* Grades Table */}
                    <div className="mb-6">
                       <table className="w-full border-collapse border-2 border-slate-800 text-center text-xs font-sans">
                          <thead>
                             {/* Year Headers */}
                             <tr className="bg-[#0f172a] text-white uppercase font-bold">
                                <th className="border-r border-slate-600 p-2 w-48 text-left pl-4" rowSpan={2}>Subject List</th>
                                <th className="border-r border-slate-600 p-1" colSpan={3}>Grade 9</th>
                                <th className="border-r border-slate-600 p-1" colSpan={3}>Grade 10</th>
                                <th className="border-r border-slate-600 p-1" colSpan={3}>Grade 11</th>
                                <th className="p-1 bg-[#0090C1]" colSpan={3}>Grade 12</th>
                             </tr>
                             {/* Semester Headers */}
                             <tr className="bg-slate-100 font-bold text-[10px] text-slate-700">
                                {/* G9 */}
                                <th className="border border-slate-400 p-1 w-12">Sem I</th>
                                <th className="border border-slate-400 p-1 w-12">Sem II</th>
                                <th className="border-r-2 border-y border-l border-slate-400 p-1 w-12 bg-slate-200">Avg</th>
                                {/* G10 */}
                                <th className="border border-slate-400 p-1 w-12">Sem I</th>
                                <th className="border border-slate-400 p-1 w-12">Sem II</th>
                                <th className="border-r-2 border-y border-l border-slate-400 p-1 w-12 bg-slate-200">Avg</th>
                                {/* G11 */}
                                <th className="border border-slate-400 p-1 w-12">Sem I</th>
                                <th className="border border-slate-400 p-1 w-12">Sem II</th>
                                <th className="border-r-2 border-y border-l border-slate-400 p-1 w-12 bg-slate-200">Avg</th>
                                {/* G12 */}
                                <th className="border border-slate-400 p-1 w-12">Sem I</th>
                                <th className="border border-slate-400 p-1 w-12">Sem II</th>
                                <th className="border-y border-l border-slate-400 p-1 w-12 bg-slate-200">Avg</th>
                             </tr>
                          </thead>
                          <tbody>
                             {ALL_SUBJECTS_ORDER.map((subject, idx) => {
                                // Grades
                                const g9s1 = getGrade(9, subject, 's1'); const g9s2 = getGrade(9, subject, 's2');
                                const g10s1 = getGrade(10, subject, 's1'); const g10s2 = getGrade(10, subject, 's2');
                                const g11s1 = getGrade(11, subject, 's1'); const g11s2 = getGrade(11, subject, 's2');
                                const g12s1 = getGrade(12, subject, 's1'); const g12s2 = getGrade(12, subject, 's2');

                                return (
                                   <tr key={subject} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                      <td className="border-r-2 border-b border-slate-300 p-2 text-left pl-4 font-bold text-slate-700 uppercase">{subject}</td>
                                      
                                      {/* G9 */}
                                      <td className="border border-slate-300 p-1">{g9s1 ?? '-'}</td>
                                      <td className="border border-slate-300 p-1">{g9s2 ?? '-'}</td>
                                      <td className="border-r-2 border-y border-l border-slate-300 p-1 font-bold bg-slate-100">{calculateAvg(g9s1, g9s2) ?? '-'}</td>
                                      
                                      {/* G10 */}
                                      <td className="border border-slate-300 p-1">{g10s1 ?? '-'}</td>
                                      <td className="border border-slate-300 p-1">{g10s2 ?? '-'}</td>
                                      <td className="border-r-2 border-y border-l border-slate-300 p-1 font-bold bg-slate-100">{calculateAvg(g10s1, g10s2) ?? '-'}</td>
                                      
                                      {/* G11 */}
                                      <td className="border border-slate-300 p-1">{g11s1 ?? '-'}</td>
                                      <td className="border border-slate-300 p-1">{g11s2 ?? '-'}</td>
                                      <td className="border-r-2 border-y border-l border-slate-300 p-1 font-bold bg-slate-100">{calculateAvg(g11s1, g11s2) ?? '-'}</td>
                                      
                                      {/* G12 */}
                                      <td className="border border-slate-300 p-1 font-bold text-[#0090C1]">{g12s1 ?? '-'}</td>
                                      <td className="border border-slate-300 p-1 font-bold text-[#0090C1]">{g12s2 ?? '-'}</td>
                                      <td className="border-y border-l border-slate-300 p-1 font-bold bg-slate-100">{calculateAvg(g12s1, g12s2) ?? '-'}</td>
                                   </tr>
                                );
                             })}
                             {/* Footer Rows */}
                             <tr className="border-t-2 border-slate-800 font-bold bg-slate-100">
                                <td className="border-r-2 border-slate-300 p-2 text-left pl-4 uppercase">Yearly Average</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1 text-slate-800">{calculateYearlyAverage(9)}%</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1 text-slate-800">{calculateYearlyAverage(10)}%</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1 text-slate-800">{calculateYearlyAverage(11)}%</td>
                                <td colSpan={3} className="p-1 text-[#0090C1] text-sm">{calculateYearlyAverage(12)}%</td>
                             </tr>
                             <tr className="border-t border-slate-300 font-bold">
                                <td className="border-r-2 border-slate-300 p-2 text-left pl-4 uppercase">Conduct</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">A</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">A</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">A</td>
                                <td colSpan={3} className="p-1">A</td>
                             </tr>
                             <tr className="border-t border-slate-300 font-bold bg-slate-50">
                                <td className="border-r-2 border-slate-300 p-2 text-left pl-4 uppercase">Rank</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">4 / 450</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">6 / 420</td>
                                <td colSpan={3} className="border-r-2 border-slate-300 p-1">3 / 300</td>
                                <td colSpan={3} className="p-1 text-[#0090C1]">1 / 250</td>
                             </tr>
                             <tr className="border-t-2 border-slate-800 font-black text-white bg-slate-800 uppercase">
                                <td className="p-2 text-left pl-4">Decision</td>
                                <td colSpan={3} className="border-r border-slate-600">Promoted</td>
                                <td colSpan={3} className="border-r border-slate-600">Promoted</td>
                                <td colSpan={3} className="border-r border-slate-600">Promoted</td>
                                <td colSpan={3}>Graduated</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-end mt-8">
                       {/* Grading System */}
                       <div className="text-[10px] space-y-1 text-slate-600 border border-slate-300 p-3 bg-slate-50 w-48">
                          <p className="font-bold underline mb-1">Grading System</p>
                          <div className="flex justify-between"><span>90-100</span><span>A (Excellent)</span></div>
                          <div className="flex justify-between"><span>80-89</span><span>B (Very Good)</span></div>
                          <div className="flex justify-between"><span>70-79</span><span>C (Good)</span></div>
                          <div className="flex justify-between"><span>50-69</span><span>D (Satisfactory)</span></div>
                          <div className="flex justify-between"><span>Below 50</span><span>F (Fail)</span></div>
                       </div>

                       {/* Signatures */}
                       <div className="flex items-end gap-16">
                          <div className="text-center relative">
                             <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-90 pointer-events-none">
                                {/* Improved Oromia Oda Tree Stamp SVG with Reduced Font Size and Text Between Circles */}
                                <svg width="160" height="160" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    {/* Paths for text between circles */}
                                    <path id="textCircleTop" d="M 20,100 A 80,80 0 0,1 180,100" />
                                    {/* Bottom path reversed so text is upright */}
                                    <path id="textCircleBottom" d="M 180,100 A 80,80 0 0,1 20,100" />
                                  </defs>

                                  {/* Outer Ring */}
                                  <circle cx="100" cy="100" r="98" fill="none" stroke="#2e1065" strokeWidth="2.5" />
                                  {/* Inner Ring */}
                                  <circle cx="100" cy="100" r="65" fill="none" stroke="#2e1065" strokeWidth="1" />

                                  {/* Top Text (Oromo) - Between Circles */}
                                  <text fill="#2e1065" fontSize="11" fontWeight="900" letterSpacing="1.2">
                                    <textPath href="#textCircleTop" startOffset="50%" textAnchor="middle">
                                      BIIROO BARNOOTAA OROMIYAA
                                    </textPath>
                                  </text>

                                  {/* Bottom Text (English) - Between Circles */}
                                  <text fill="#2e1065" fontSize="10" fontWeight="bold" letterSpacing="1">
                                    <textPath href="#textCircleBottom" startOffset="50%" textAnchor="middle">
                                      OROMIA EDUCATION BUREAU
                                    </textPath>
                                  </text>

                                  {/* Inner Region Text - Small Font */}
                                  <text x="100" y="55" fontSize="6.5" fontWeight="bold" fill="#2e1065" textAnchor="middle">
                                    GODINA ARSII LIXAA / WEST ARSI ZONE
                                  </text>
                                  <text x="100" y="64" fontSize="6.5" fontWeight="bold" fill="#2e1065" textAnchor="middle">
                                    AANAA KOREE / KORE WOREDA
                                  </text>

                                  {/* The Oda Tree - Grounded Trunk */}
                                  <g transform="translate(100, 110) scale(0.7)">
                                     {/* Canopy - Stylized mushroom/umbrella shape */}
                                     <path d="M-55,0 C-55,-45 0,-55 0,-55 C0,-55 55,-45 55,0 C45,10 0,5 0,5 C0,5 -45,10 -55,0 Z" fill="#2e1065" />
                                     {/* Trunk - Thicker base */}
                                     <path d="M-12,0 L-18,45 Q-25,55 -35,55 L35,55 Q25,55 18,45 L12,0 Z" fill="#2e1065" />
                                     {/* Internal Branches (White lines) */}
                                     <path d="M0,0 L0,-35 M0,0 L-25,-20 M0,0 L25,-20" stroke="white" strokeWidth="2" fill="none" />
                                  </g>

                                  {/* School Name Bottom Center - Small Font */}
                                  <text x="100" y="155" fontSize="7" fontWeight="900" fill="#2e1065" textAnchor="middle" letterSpacing="0.5">
                                    M.B. DHUUNFAA IFTU
                                  </text>
                                  <text x="100" y="163" fontSize="6" fontWeight="bold" fill="#2e1065" textAnchor="middle">
                                    IFTU PRIVATE SCHOOL
                                  </text>
                                </svg>
                             </div>
                             <div className="mb-2 h-12 w-40 border-b border-slate-800 flex items-end justify-center">
                                <Signature className="h-10 w-24 text-blue-900" />
                             </div>
                             <p className="text-xs font-bold uppercase">Principal's Signature</p>
                          </div>
                          <div className="text-center">
                             <div className="mb-2 h-12 w-40 border-b border-slate-800"></div>
                             <p className="text-xs font-bold uppercase">Homeroom Teacher</p>
                          </div>
                          <div className="text-center">
                             <p className="text-xs font-bold uppercase mb-2">{new Date().toLocaleDateString()}</p>
                             <div className="w-32 border-t border-slate-800"></div>
                             <p className="text-xs font-bold uppercase mt-1">Date of Issue</p>
                          </div>
                       </div>
                    </div>

                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-50" data-html2canvas-ignore="true">
           <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search size={40} className="text-slate-400" />
           </div>
           <p className="font-bold text-slate-400 uppercase tracking-widest">Enter an ID to view transcript</p>
        </div>
      )}
    </div>
  );
};
