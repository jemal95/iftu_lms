
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Plus, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  BrainCircuit,
  Loader2,
  Filter,
  RotateCcw,
  Search,
  ListChecks,
  PenTool,
  Save,
  Target,
  Building,
  Trash2,
  Edit,
  Wand2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Course, School, CourseModule } from '../types';
import { geminiService } from '../services/gemini';
import { marked } from 'marked';
import { db } from '../utils/persistence';

interface Assessment {
  id: string;
  name: string;
  maxScore: number;
}

interface StudentProgress {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  notes?: string;
  grades: Record<string, number>;
}

const DEFAULT_ASSESSMENTS: Assessment[] = [
  { id: 'a1', name: 'Midterm Exam', maxScore: 100 },
  { id: 'a2', name: 'Final Project', maxScore: 100 },
  { id: 'a3', name: 'Assignment 1', maxScore: 20 }
];

const INITIAL_STUDENTS: Record<string, StudentProgress[]> = {
  'sub1': [
    { id: 's1', name: 'Alice Freeman', avatar: 'https://picsum.photos/seed/s1/40/40', progress: 75, completedModules: 6, totalModules: 8, notes: 'Strong in algebra.', grades: { 'a1': 85, 'a2': 92, 'a3': 18 } },
    { id: 's2', name: 'Bob Wright', avatar: 'https://picsum.photos/seed/s2/40/40', progress: 37, completedModules: 3, totalModules: 8, notes: 'Needs tutoring.', grades: { 'a1': 45, 'a2': 60, 'a3': 12 } },
  ],
};

export const CoursesView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [studentData, setStudentData] = useState(INITIAL_STUDENTS);
  const [assessments, setAssessments] = useState<Assessment[]>(DEFAULT_ASSESSMENTS);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [isGradeMode, setIsGradeMode] = useState(false);

  // Filtering State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [filterCampus, setFilterCampus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New/Edit course form state
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    instructor: '',
    category: 'Natural Science',
    description: '',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    duration: 'Grade 9',
    objectives: [],
    prerequisites: [],
    curriculum: []
  });

  const [currentObjective, setCurrentObjective] = useState('');
  
  // Curriculum Builder State
  const [newModuleName, setNewModuleName] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  useEffect(() => {
    setCourses(db.getCourses());
    setSchools(db.getSchools());
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category));
    return ['All', ...Array.from(cats)];
  }, [courses]);

  const grades = ['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Vocational', 'Level 1', 'Level 2', 'Level 3', 'Level 4'];

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchCategory = filterCategory === 'All' || c.category === filterCategory;
      const matchCampus = filterCampus === 'All' || c.campusId === filterCampus;
      let matchGrade = filterGrade === 'All';
      
      if (!matchGrade) {
         if (filterGrade === 'Vocational') {
            matchGrade = c.duration?.includes('Level');
         } else {
            matchGrade = c.title.includes(filterGrade) || c.duration === filterGrade;
         }
      }
      
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchGrade && matchSearch && matchCampus;
    });
  }, [courses, filterCategory, filterGrade, searchQuery, filterCampus]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const currentStudents = selectedCourseId ? (studentData[selectedCourseId] || []) : [];

  const handleGenerateAiAdvice = async () => {
    if (!selectedCourse) return;
    setIsGeneratingAdvice(true);
    setAiAdvice(null);
    try {
      const advice = await geminiService.getCurriculumAdvice(selectedCourse.title);
      setAiAdvice(advice);
    } catch (e) {
      setAiAdvice("Failed to generate AI advice. Please try again.");
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  const handleAutoGenerateSyllabus = async () => {
    if (!formData.title || !formData.duration) {
      alert("Please enter a Subject Title and select a Grade Level first.");
      return;
    }
    setIsAutoGenerating(true);
    try {
      const generatedCurriculum = await geminiService.generateEthiopianSyllabus(formData.title, formData.duration);
      const formattedCurriculum: CourseModule[] = generatedCurriculum.map((mod: any, idx: number) => ({
        id: `gen-mod-${Date.now()}-${idx}`,
        title: mod.title,
        lessons: mod.lessons
      }));
      setFormData(prev => ({ ...prev, curriculum: formattedCurriculum }));
    } catch (e) {
      alert("Failed to auto-generate syllabus. Please try manually.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  // Form Handlers (Simplified for brevity as logic remains same, focusing on UI structure)
  const resetForm = () => {
    setFormData({ title: '', instructor: '', category: 'Natural Science', description: '', image: '', duration: 'Grade 9', objectives: [], prerequisites: [], curriculum: [] });
    setCurrentObjective('');
    setNewModuleName('');
    setIsEditing(false);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) db.saveCourse(formData as Course);
    else {
        const id = `sub${Date.now()}`;
        const courseToAdd: Course = { ...formData as Course, id, students: 0, progress: 0 };
        db.saveCourse(courseToAdd);
    }
    setCourses(db.getCourses());
    setIsModalOpen(false);
    resetForm();
  };

  // --- Curriculum Helper Functions ---
  const addModule = () => {
    if (!newModuleName.trim()) return;
    const newModule: CourseModule = { id: `mod-${Date.now()}`, title: newModuleName, lessons: [] };
    setFormData({ ...formData, curriculum: [...(formData.curriculum || []), newModule] });
    setNewModuleName('');
  };
  const addLessonToModule = (moduleIndex: number) => {
    if (!newLessonName.trim()) return;
    const curriculum = [...(formData.curriculum || [])];
    curriculum[moduleIndex].lessons.push(newLessonName);
    setFormData({ ...formData, curriculum });
    setNewLessonName('');
    setActiveModuleIndex(null);
  };
  const removeModule = (index: number) => {
    const curriculum = [...(formData.curriculum || [])];
    curriculum.splice(index, 1);
    setFormData({ ...formData, curriculum });
  };
  const addObjective = () => {
    if (!currentObjective.trim()) return;
    setFormData({ ...formData, objectives: [...(formData.objectives || []), currentObjective.trim()] });
    setCurrentObjective('');
  };

  if (selectedCourseId && selectedCourse) {
    // Detail View
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedCourseId(null)} className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 transition-all shadow-sm hover:shadow-md"><ArrowLeft size={20} /></button>
            <div>
              <h2 className="text-3xl font-black text-slate-800">{selectedCourse.title}</h2>
              <p className="text-sm text-slate-500 font-bold mt-1">Course Profile & Analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => { setFormData({ ...selectedCourse }); setIsEditing(true); setIsModalOpen(true); }} className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
               <Edit size={16} /> Edit
             </button>
             <button onClick={handleGenerateAiAdvice} disabled={isGeneratingAdvice} className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
               {isGeneratingAdvice ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
               AI Curriculum Assistant
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col lg:flex-row relative group">
          <div className="lg:w-1/3 relative h-80 lg:h-auto overflow-hidden">
            <img src={selectedCourse.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-10 flex flex-col justify-end">
               <span className="px-4 py-1.5 bg-[#0090C1] text-white text-[10px] font-black rounded-full uppercase tracking-widest w-fit mb-3 shadow-lg">
                 {selectedCourse.category}
               </span>
               <h3 className="text-4xl font-black text-white leading-tight">{selectedCourse.title}</h3>
               <p className="text-white/80 font-medium mt-2 flex items-center gap-2"><Users size={16} /> {selectedCourse.instructor}</p>
            </div>
          </div>
          <div className="flex-1 p-10 space-y-8 flex flex-col">
             <div className="space-y-4 flex-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Info size={14} /> Description</h4>
                <p className="text-slate-600 leading-relaxed font-medium">{selectedCourse.description || "A comprehensive study program designed to build core competencies."}</p>
                
                {selectedCourse.objectives && selectedCourse.objectives.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    {selectedCourse.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">{obj}</span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
             <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-8">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p><p className="text-2xl font-black text-slate-800">{selectedCourse.students}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Score</p><p className="text-2xl font-black text-emerald-500">{selectedCourse.progress}%</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modules</p><p className="text-2xl font-black text-indigo-500">{selectedCourse.curriculum?.length || 0}</p></div>
             </div>
          </div>
        </div>

        {aiAdvice && (
          <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-sky-100 rounded-[2.5rem] p-10 relative overflow-hidden animate-in slide-in-from-bottom-6">
             <div className="absolute top-0 right-0 p-10 opacity-5"><BrainCircuit size={200} /></div>
             <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-indigo-900 flex items-center gap-3"><BrainCircuit size={24} /> AI Analysis & Syllabus</h3>
                   <button onClick={() => setAiAdvice(null)} className="p-2 bg-white/50 hover:bg-white rounded-full text-indigo-900 transition-colors"><X size={20} /></button>
                </div>
                <div className="prose-chat prose-sm max-w-none text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: marked.parse(aiAdvice) }} />
             </div>
          </div>
        )}

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8">
           <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><ListChecks size={24} className="text-[#0090C1]" /> Curriculum Modules</h3>
           </div>
           {selectedCourse.curriculum && selectedCourse.curriculum.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {selectedCourse.curriculum.map((mod, i) => (
                 <div key={mod.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                       <span className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-sm font-black text-slate-300 border border-slate-100 group-hover:text-[#0090C1] group-hover:border-[#0090C1] transition-colors">{i+1}</span>
                       <h4 className="font-bold text-slate-800">{mod.title}</h4>
                    </div>
                    <div className="space-y-2 pl-14">
                       {mod.lessons.map((l, idx) => (
                         <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0090C1]" /> {l}
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No modules defined.</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Subjects</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage curriculum, assignments, and AI-enhanced learning paths.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-[2rem] font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={22} /> New Subject
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
         <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="text" 
                 placeholder="Search subjects..." 
                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-600 focus:bg-white focus:border-[#0090C1] transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0">
               <select className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-600 text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors min-w-[160px]" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <select className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-600 text-sm appearance-none cursor-pointer hover:bg-slate-100 transition-colors min-w-[160px]" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
               <button onClick={() => {setFilterCategory('All'); setFilterGrade('All'); setSearchQuery('');}} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-slate-100 hover:text-slate-600 transition-all"><RotateCcw size={20} /></button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
         {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col h-full cursor-pointer hover:-translate-y-2 duration-300" onClick={() => setSelectedCourseId(course.id)}>
               <div className="h-56 relative overflow-hidden shrink-0">
                  <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute top-6 left-6">
                     <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm text-[#0090C1]">
                        {course.category}
                     </span>
                  </div>
               </div>
               <div className="p-8 flex flex-col flex-1 space-y-6">
                  <div>
                     <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-[#0090C1] transition-colors">{course.title}</h3>
                     <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2"><Users size={14} /> {course.instructor}</p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                     <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.duration}</span>
                     <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> {course.progress}% Avg
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h3 className="text-2xl font-black text-slate-800">{isEditing ? 'Edit Course Profile' : 'New Course Registry'}</h3>
                   <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{isEditing ? 'Modify Curriculum' : 'Add to Academic Catalog'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-400 shadow-sm transition-all"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Title</label>
                      <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. Advanced Mathematics" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructor</label>
                      <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. Dr. Sarah J." value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:bg-white focus:border-[#0090C1]" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                         {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:bg-white focus:border-[#0090C1]" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})}>
                         {grades.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Campus</label>
                   <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:bg-white focus:border-[#0090C1]" value={formData.campusId || ''} onChange={(e) => setFormData({...formData, campusId: e.target.value})}>
                      <option value="">Select Campus...</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                   <textarea className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-medium text-slate-600 focus:bg-white focus:border-[#0090C1] transition-all h-32 resize-none" placeholder="Brief course overview..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                {/* Curriculum Builder Section */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-[#0090C1] uppercase tracking-widest flex items-center gap-2"><ListChecks size={14} /> Syllabus Builder</label>
                      <button type="button" onClick={handleAutoGenerateSyllabus} disabled={isAutoGenerating} className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-75">
                         {isAutoGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                         AI Auto-Fill (Ethiopian Curriculum)
                      </button>
                   </div>
                   
                   <div className="flex gap-3">
                      <input className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" placeholder="New Module Name..." value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} />
                      <button type="button" onClick={addModule} className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700">Add Module</button>
                   </div>

                   <div className="space-y-3">
                      {formData.curriculum?.map((mod, mIdx) => (
                         <div key={mIdx} className="border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="bg-slate-50 p-4 flex justify-between items-center">
                               <h4 className="font-bold text-sm text-slate-700 flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm">{mIdx+1}</span>
                                  {mod.title}
                               </h4>
                               <button type="button" onClick={() => removeModule(mIdx)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                            <div className="p-4 bg-white space-y-2">
                               {mod.lessons.map((l, lIdx) => (
                                  <div key={lIdx} className="flex items-center gap-2 text-xs font-medium text-slate-500 pl-9">
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {l}
                                  </div>
                               ))}
                               {activeModuleIndex === mIdx ? (
                                  <div className="flex gap-2 pl-9 mt-2">
                                     <input className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Lesson Name..." value={newLessonName} onChange={(e) => setNewLessonName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLessonToModule(mIdx))} />
                                     <button type="button" onClick={() => addLessonToModule(mIdx)} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold">Add</button>
                                  </div>
                               ) : (
                                  <button type="button" onClick={() => setActiveModuleIndex(mIdx)} className="text-xs font-bold text-[#0090C1] pl-9 hover:underline mt-1">+ Add Lesson</button>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </form>

             <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleSaveCourse} className="flex-[2] py-4 bg-[#0090C1] text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-[#007ba6] transition-all">Save Changes</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
