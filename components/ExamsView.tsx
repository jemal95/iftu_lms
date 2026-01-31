
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Wand2, 
  Loader2, 
  X,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Percent,
  Timer
} from 'lucide-react';
import { Exam, Question, AuthUser } from '../types';
import { db } from '../utils/persistence';
import { geminiService } from '../services/gemini';

interface ExamsViewProps {
  user: AuthUser;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ user }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Form State
  const [newExamInfo, setNewExamInfo] = useState<Partial<Exam>>({
    title: '',
    courseTitle: '',
    date: '',
    duration: '', // Will be calculated
    totalQuestions: 5,
    questions: [],
    passingScore: 50
  });

  // Specific state for the "Time limit per question" requirement
  const [timePerQuestion, setTimePerQuestion] = useState<number>(2); // Default 2 mins per question

  // AI State
  const [aiDocContent, setAiDocContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileMimeType, setUploadedFileMimeType] = useState<string | null>(null);

  const isAdminOrTeacher = user.role === 'Admin' || user.role === 'Teacher';

  useEffect(() => {
    // Load exams
    const loadedExams = db.getExams();
    setExams(loadedExams);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // result is data:mime;base64,...
        const [meta, base64] = result.split(',');
        const mime = meta.split(':')[1].split(';')[0];
        setUploadedFileBase64(base64);
        setUploadedFileMimeType(mime);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiExtract = async () => {
    setIsAiProcessing(true);
    setValidationError(null);
    try {
      let questions: Question[] = [];
      if (uploadedFileBase64 && uploadedFileMimeType) {
        questions = await geminiService.generateQuestionsFromData(
          uploadedFileBase64, 
          uploadedFileMimeType, 
          newExamInfo.totalQuestions
        );
      } else if (aiDocContent) {
        questions = await geminiService.generateQuestionsFromText(
          aiDocContent, 
          newExamInfo.totalQuestions
        );
      }
      
      setNewExamInfo(prev => ({
        ...prev,
        questions: questions
      }));
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveExam = () => {
    setValidationError(null);

    // Validation 1: Required Fields
    if (!newExamInfo.title || !newExamInfo.courseTitle || !newExamInfo.date) {
      setValidationError("Please fill in all required fields (Title, Course, Date).");
      return;
    }

    // Validation 2: Passing Score (1-100)
    const passingScore = newExamInfo.passingScore || 0;
    if (passingScore < 1 || passingScore > 100) {
      setValidationError("Passing Score must be between 1 and 100.");
      return;
    }

    // Validation 3: Time Limit Per Question (Positive Value)
    if (timePerQuestion <= 0) {
      setValidationError("Time limit per question must be a positive value.");
      return;
    }

    const totalQs = newExamInfo.questions?.length || newExamInfo.totalQuestions || 0;
    const calculatedDuration = `${Math.ceil(timePerQuestion * totalQs)} mins`;
    
    const exam: Exam = {
      id: `EX${Date.now()}`,
      title: newExamInfo.title!,
      courseTitle: newExamInfo.courseTitle!,
      courseId: 'unknown',
      teacherId: user.id,
      date: newExamInfo.date,
      duration: calculatedDuration,
      totalQuestions: totalQs,
      passingScore: passingScore,
      status: 'Upcoming',
      questions: newExamInfo.questions
    };

    db.saveExam(exam);
    setExams(db.getExams());
    setIsModalOpen(false);
    resetForm();
  };
  
  const handleDeleteExam = (id: string) => {
    if (confirm("Delete this exam?")) {
      db.deleteExam(id);
      setExams(db.getExams());
    }
  };

  const resetForm = () => {
    setNewExamInfo({
      title: '',
      courseTitle: '',
      date: '',
      duration: '',
      totalQuestions: 5,
      questions: [],
      passingScore: 50
    });
    setTimePerQuestion(2);
    setAiDocContent('');
    setValidationError(null);
    setUploadedFile(null);
    setUploadedFileBase64(null);
    setUploadedFileMimeType(null);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Examination Center</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Create and manage assessments with AI assistance.</p>
        </div>
        {isAdminOrTeacher && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all active:scale-95"
          >
            <Plus size={22} />
            Create New Exam
          </button>
        )}
      </div>

      {/* Exam List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0090C1]">
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{exam.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exam.courseTitle}</p>
                </div>
              </div>
              {isAdminOrTeacher && (
                <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                <Calendar size={14} className="text-sky-500" /> {exam.date}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                <Clock size={14} className="text-amber-500" /> {exam.duration}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                <FileText size={14} className="text-emerald-500" /> {exam.totalQuestions} Qs
              </div>
              {exam.passingScore && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                  <Percent size={14} className="text-purple-500" /> Pass: {exam.passingScore}%
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 exam.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
               }`}>
                 {exam.status}
               </span>
               <button className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0090C1] hover:text-white transition-all">
                 View Details
               </button>
            </div>
          </div>
        ))}
        {exams.length === 0 && (
           <div className="col-span-full p-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <p>No exams scheduled yet.</p>
           </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0090C1]">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Exam Builder</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Configure assessment parameters</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Validation Alert */}
              {validationError && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 animate-in slide-in-from-top-2">
                   <AlertCircle className="shrink-0 mt-0.5" size={18} />
                   <p className="text-xs font-bold">{validationError}</p>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Title</label>
                  <input 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-700"
                    placeholder="e.g. Midterm Physics"
                    value={newExamInfo.title}
                    onChange={(e) => setNewExamInfo({...newExamInfo, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                  <input 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-700"
                    placeholder="e.g. Physics Grade 11"
                    value={newExamInfo.courseTitle}
                    onChange={(e) => setNewExamInfo({...newExamInfo, courseTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-700"
                    value={newExamInfo.date}
                    onChange={(e) => setNewExamInfo({...newExamInfo, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passing Score (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-700"
                      placeholder="50"
                      value={newExamInfo.passingScore}
                      onChange={(e) => setNewExamInfo({...newExamInfo, passingScore: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* Question & Time Settings */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500">Exam Logic & AI Source</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Count</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="50"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-700"
                          value={newExamInfo.totalQuestions}
                          onChange={(e) => setNewExamInfo({...newExamInfo, totalQuestions: parseInt(e.target.value) || 5})}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Per Question (mins)</label>
                        <div className="relative">
                           <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input 
                             type="number" 
                             min="0.5" 
                             step="0.5"
                             className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-400 font-bold text-slate-700"
                             value={timePerQuestion}
                             onChange={(e) => setTimePerQuestion(parseFloat(e.target.value) || 0)}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-sky-600 bg-sky-50 p-3 rounded-xl border border-sky-100 justify-center">
                     <Clock size={12} />
                     Estimated Total Duration: {Math.ceil(timePerQuestion * (newExamInfo.totalQuestions || 0))} minutes
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer group relative mt-4">
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        accept=".txt,.pdf,.doc,.docx"
                      />
                      <div className="text-center space-y-2">
                        <p className="text-sm font-bold text-slate-600 group-hover:text-sky-600 transition-colors">
                            {uploadedFile ? uploadedFile.name : "Upload PDF, Word or Text File"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            AI will extract content for questions
                        </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-4 my-2">
                      <div className="h-px bg-slate-100 flex-1" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase">OR PASTE TEXT</span>
                      <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <textarea 
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-medium text-slate-600 h-24 resize-none focus:border-sky-300 transition-colors"
                      placeholder="Paste lecture notes, article text, or summary here..."
                      value={aiDocContent}
                      onChange={(e) => {
                          setAiDocContent(e.target.value);
                          if (e.target.value) {
                              setUploadedFile(null);
                              setUploadedFileBase64(null);
                              setUploadedFileMimeType(null);
                          }
                      }}
                  />

                  <button 
                    onClick={handleAiExtract}
                    disabled={isAiProcessing || (!uploadedFile && !aiDocContent)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAiProcessing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    {isAiProcessing ? 'Analyzing Content...' : 'Generate Questions with Gemini'}
                  </button>
              </div>

              {/* Generated Questions Preview */}
              {newExamInfo.questions && newExamInfo.questions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Generated Content
                  </h4>
                  <div className="space-y-3">
                    {newExamInfo.questions.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-700 mb-2">{i+1}. {q.text}</p>
                         <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className={`px-3 py-2 rounded-lg text-[10px] font-medium ${oi === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-white text-slate-500 border border-slate-100'}`}>
                                {opt}
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
               <button onClick={handleSaveExam} className="flex-1 py-4 bg-[#0090C1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#007ba6] transition-all">
                 Save & Publish Exam
               </button>
               <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50">
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
