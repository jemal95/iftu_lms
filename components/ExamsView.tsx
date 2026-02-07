
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  Wand2, 
  Loader2, 
  X,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Percent,
  Timer,
  FileText,
  Upload
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
    duration: '', 
    totalQuestions: 5,
    questions: [],
    passingScore: 50
  });

  const [timePerQuestion, setTimePerQuestion] = useState<number>(2);
  const [aiDocContent, setAiDocContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileMimeType, setUploadedFileMimeType] = useState<string | null>(null);

  const isAdminOrTeacher = user.role === 'Admin' || user.role === 'Teacher';

  useEffect(() => {
    setExams(db.getExams());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
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
      setNewExamInfo(prev => ({ ...prev, questions: questions }));
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveExam = () => {
    setValidationError(null);
    if (!newExamInfo.title || !newExamInfo.courseTitle || !newExamInfo.date) {
      setValidationError("Please fill in all required fields.");
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
      passingScore: newExamInfo.passingScore || 50,
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
    setNewExamInfo({ title: '', courseTitle: '', date: '', duration: '', totalQuestions: 5, questions: [], passingScore: 50 });
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
            className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-[2rem] font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={22} />
            Create Exam
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-50 to-white rounded-[1.5rem] flex items-center justify-center text-[#0090C1] border border-sky-100 shadow-sm">
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{exam.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{exam.courseTitle}</p>
                </div>
              </div>
              {isAdminOrTeacher && (
                <button onClick={() => handleDeleteExam(exam.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 z-10">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar size={18} className="text-sky-500" /> 
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                   <p className="text-xs font-bold text-slate-700">{exam.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Clock size={18} className="text-amber-500" /> 
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                   <p className="text-xs font-bold text-slate-700">{exam.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <FileText size={18} className="text-emerald-500" /> 
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                   <p className="text-xs font-bold text-slate-700">{exam.totalQuestions} Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Percent size={18} className="text-purple-500" /> 
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pass Mark</p>
                   <p className="text-xs font-bold text-slate-700">{exam.passingScore}%</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 z-10">
               <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                 exam.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
               }`}>
                 {exam.status}
               </span>
               <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#0090C1] transition-all shadow-lg">
                 Enter Exam Hall
               </button>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {exams.length === 0 && (
           <div className="col-span-full p-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
              <p className="font-bold">No exams scheduled yet.</p>
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                 <h3 className="text-2xl font-black text-slate-800">Exam Builder</h3>
                 <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">AI-Powered Assessment Creation</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-400 transition-colors shadow-sm"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {validationError && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-xs">
                   <AlertCircle className="shrink-0 mt-0.5" size={16} /> {validationError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Title</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" placeholder="e.g. Midterm Physics" value={newExamInfo.title} onChange={(e) => setNewExamInfo({...newExamInfo, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" placeholder="e.g. Grade 11 Physics" value={newExamInfo.courseTitle} onChange={(e) => setNewExamInfo({...newExamInfo, courseTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" value={newExamInfo.date} onChange={(e) => setNewExamInfo({...newExamInfo, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passing Score (%)</label>
                  <input type="number" min="1" max="100" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" value={newExamInfo.passingScore} onChange={(e) => setNewExamInfo({...newExamInfo, passingScore: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><Wand2 size={16} className="text-[#0090C1]" /> AI Content Generation</h4>
                  
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-all cursor-pointer group relative text-center">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".txt,.pdf,.doc,.docx" />
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 group-hover:text-[#0090C1] transition-colors shadow-sm"><Upload size={24} /></div>
                      <p className="text-sm font-bold text-slate-600 group-hover:text-[#0090C1] transition-colors">{uploadedFile ? uploadedFile.name : "Upload Study Material"}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">PDF, DOCX, TXT</p>
                  </div>

                  <div className="flex items-center gap-4"><div className="h-px bg-slate-100 flex-1" /><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">OR</span><div className="h-px bg-slate-100 flex-1" /></div>

                  <textarea className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-xs font-medium text-slate-600 h-28 resize-none focus:bg-white focus:border-[#0090C1] transition-all" placeholder="Paste lecture notes or topic summary here for AI generation..." value={aiDocContent} onChange={(e) => setAiDocContent(e.target.value)} />

                  <div className="flex gap-4 items-end">
                     <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Questions</label>
                        <input type="number" min="1" max="50" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700" value={newExamInfo.totalQuestions} onChange={(e) => setNewExamInfo({...newExamInfo, totalQuestions: parseInt(e.target.value) || 5})} />
                     </div>
                     <button onClick={handleAiExtract} disabled={isAiProcessing || (!uploadedFile && !aiDocContent)} className="flex-[2] py-4 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 h-[58px]">
                        {isAiProcessing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        {isAiProcessing ? 'Generating...' : 'Generate Questions'}
                     </button>
                  </div>
              </div>

              {newExamInfo.questions && newExamInfo.questions.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14} /> Generated Preview</h4>
                  {newExamInfo.questions.map((q, i) => (
                    <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                       <p className="text-xs font-bold text-slate-800 mb-3">{i+1}. {q.text}</p>
                       <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`px-4 py-2 rounded-xl text-[10px] font-medium border ${oi === q.correctAnswer ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{opt}</div>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
               <button onClick={handleSaveExam} className="flex-[2] py-4 bg-[#0090C1] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-[#007ba6] transition-all">Publish Exam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
