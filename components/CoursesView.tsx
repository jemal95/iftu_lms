
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Plus, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Image as ImageIcon,
  X,
  Sparkles,
  BarChart as BarChartIcon,
  Info,
  BrainCircuit,
  Loader2,
  Filter,
  RotateCcw,
  Search,
  ListChecks,
  PenTool,
  Save,
  GraduationCap,
  Target,
  Minus,
  Layers,
  Building,
  List,
  Trash2,
  ChevronDown,
  Edit
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
  grades: Record<string, number>; // Assessment ID -> Score
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

  // Load courses and schools from DB
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

  const updateStudent = (studentId: string, updates: Partial<StudentProgress>) => {
    if (!selectedCourseId) return;
    const currentList = studentData[selectedCourseId] || [];
    const updatedList = currentList.map(s => 
      s.id === studentId ? { ...s, ...updates } : s
    );
    setStudentData(prev => ({
      ...prev,
      [selectedCourseId]: updatedList
    }));
  };

  const handleGradeChange = (studentId: string, assessmentId: string, score: string) => {
    if (!selectedCourseId) return;
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return;
    const currentList = studentData[selectedCourseId] || [];
    const student = currentList.find(s => s.id === studentId);
    if (student) {
      updateStudent(studentId, {
        grades: {
          ...student.grades,
          [assessmentId]: numScore
        }
      });
    }
  };

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

  const resetForm = () => {
    setFormData({
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
    setCurrentObjective('');
    setNewModuleName('');
    setNewLessonName('');
    setActiveModuleIndex(null);
    setIsEditing(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedCourse) return;
    setFormData({ ...selectedCourse });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
        // Update existing
        db.saveCourse(formData as Course);
    } else {
        // Create new
        const id = `sub${Date.now()}`;
        const courseToAdd: Course = {
          ...formData as Course,
          id,
          students: 0,
          progress: 0,
        };
        db.saveCourse(courseToAdd);
    }
    
    setCourses(db.getCourses());
    setIsModalOpen(false);
    resetForm();
  };

  const addObjective = () => {
    if (!currentObjective.trim()) return;
    setFormData({
      ...formData,
      objectives: [...(formData.objectives || []), currentObjective.trim()]
    });
    setCurrentObjective('');
  };

  const removeObjective = (index: number) => {
    const updated = [...(formData.objectives || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, objectives: updated });
  };

  const resetFilters = () => {
    setFilterCategory('All');
    setFilterGrade('All');
    setFilterCampus('All');
    setSearchQuery('');
  };

  // Curriculum Builder Functions
  const addModule = () => {
    if (!newModuleName.trim()) return;
    const newModule: CourseModule = {
      id: `mod-${Date.now()}`,
      title: newModuleName,
      lessons: []
    };
    setFormData({
      ...formData,
      curriculum: [...(formData.curriculum || []), newModule]
    });
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

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const curriculum = [...(formData.curriculum || [])];
    curriculum[moduleIndex].lessons.splice(lessonIndex, 1);
    setFormData({ ...formData, curriculum });
  };

  // View Subject Details
  if (selectedCourseId && selectedCourse) {
    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setSelectedCourseId(null);
                setAiAdvice(null);
                setIsGradeMode(false);
              }}
              className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl text-gray-500 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedCourse.title}</h2>
              <p className="text-sm text-gray-500">Subject Profile & Student Performance</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={handleOpenEdit}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Edit size={14} /> Edit Subject
            </button>
             <button 
              onClick={handleGenerateAiAdvice}
              disabled={isGeneratingAdvice}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isGeneratingAdvice ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
              AI Syllabus Assistant
            </button>
          </div>
        </div>

        {/* Subject Overview Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/3 relative h-64 lg:h-auto overflow-hidden">
            <img 
              src={selectedCourse.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'} 
              className="w-full h-full object-cover" 
              alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-end p-8">
               <div className="text-white">
                  <h3 className="text-3xl font-black">{selectedCourse.title}</h3>
                  <p className="opacity-90 font-medium mt-1">{selectedCourse.category}</p>
               </div>
            </div>
          </div>
          <div className="flex-1 p-8 md:p-10 space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-sky-100">
                {selectedCourse.category}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                {selectedCourse.duration}
              </span>
              {selectedCourse.campusId && (
                <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-purple-100 flex items-center gap-1">
                  <Building size={10} /> {schools.find(s => s.id === selectedCourse.campusId)?.name || 'Campus'}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Info size={14} /> Subject Overview
                </h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  {selectedCourse.description || "Comprehensive curriculum designed to foster critical thinking and subject mastery."}
                </p>
              </div>

              {selectedCourse.objectives && selectedCourse.objectives.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target size={14} /> Learning Objectives
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCourse.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Instructor</p>
                <p className="text-sm font-bold text-gray-800">{selectedCourse.instructor}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Enrolled Students</p>
                <p className="text-sm font-bold text-gray-800">{selectedCourse.students}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Avg. Grade</p>
                <p className="text-sm font-bold text-gray-800">{selectedCourse.progress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus / Curriculum Display */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
           <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-[#0090C1]">
                <ListChecks size={24} />
                <h3 className="text-xl font-bold">Syllabus & Curriculum</h3>
              </div>
              {(!selectedCourse.curriculum || selectedCourse.curriculum.length === 0) && (
                 <button onClick={handleOpenEdit} className="text-xs font-bold text-slate-400 hover:text-[#0090C1] flex items-center gap-1">
                    <Plus size={14} /> Add Modules
                 </button>
              )}
           </div>
           
           {selectedCourse.curriculum && selectedCourse.curriculum.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCourse.curriculum.map((module, i) => (
                   <div key={module.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                         <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-xs font-black text-slate-400 border border-slate-200 shadow-sm">
                            {i + 1}
                         </span>
                         <h4 className="font-bold text-slate-800 text-sm">{module.title}</h4>
                      </div>
                      <div className="pl-11 space-y-2">
                         {module.lessons.map((lesson, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#0090C1]" />
                               {lesson}
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
           ) : (
             <div className="text-center p-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <p className="text-sm font-medium">No syllabus modules defined.</p>
                <button onClick={handleOpenEdit} className="text-[#0090C1] font-bold text-xs mt-2 hover:underline">Configure Curriculum</button>
             </div>
           )}
        </div>

        {/* AI Insight Section (Conditional) */}
        {aiAdvice && (
          <div className="bg-sky-50/50 border border-sky-100 rounded-[2.5rem] p-8 md:p-10 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 text-[#0090C1]">
              <Sparkles size={24} />
              <h3 className="text-xl font-bold">AI Recommended Curriculum Path</h3>
              <button onClick={() => setAiAdvice(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div 
              className="prose-chat prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: marked.parse(aiAdvice) }}
            />
          </div>
        )}

        {/* Student Roster & Gradebook */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-gray-50/20 gap-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-3 text-lg">
              <Users size={22} className="text-gray-400" />
              {isGradeMode ? 'Gradebook Recording' : 'Student Roster'}
            </h3>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsGradeMode(!isGradeMode)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  isGradeMode 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isGradeMode ? <ArrowLeft size={14} /> : <PenTool size={14} />}
                {isGradeMode ? 'Back to Roster' : 'Record Results'}
              </button>
              
              {isGradeMode && (
                <button className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                  <Save size={14} /> Save Changes
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-widest font-black border-b border-gray-100">
                  <th className="px-8 py-5">Student Information</th>
                  {isGradeMode ? (
                    <>
                      {assessments.map(a => (
                        <th key={a.id} className="px-4 py-5 text-center min-w-[100px]">{a.name} ({a.maxScore})</th>
                      ))}
                      <th className="px-4 py-5 text-center">Total Grade</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5">Modules Completed</th>
                      <th className="px-8 py-5">Completion Score</th>
                      <th className="px-8 py-5">Notes</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentStudents.length > 0 ? currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={student.avatar} className="w-10 h-10 rounded-xl border-2 border-white shadow-md group-hover:scale-110 transition-transform" alt="" />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{student.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">SID-{student.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    {isGradeMode ? (
                      <>
                        {assessments.map(a => (
                          <td key={a.id} className="px-4 py-6 text-center">
                            <input 
                              type="number" 
                              min="0" 
                              max={a.maxScore}
                              className="w-16 p-2 text-center bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0090C1] outline-none"
                              value={student.grades?.[a.id] || ''}
                              onChange={(e) => handleGradeChange(student.id, a.id, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-6 text-center">
                           <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                             ((Object.values(student.grades || {}) as number[]).reduce((a,b)=>a+b, 0) / (assessments.length * 100) * 100) > 80 
                             ? 'bg-emerald-100 text-emerald-700' 
                             : 'bg-gray-100 text-gray-600'
                           }`}>
                             {Math.round((Object.values(student.grades || {}) as number[]).reduce((a,b)=>a+b, 0) / assessments.length)}%
                           </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-1">
                             {Array.from({length: 8}).map((_, i) => (
                               <div key={i} className={`w-2 h-8 rounded-full ${i < student.completedModules ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                             ))}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center text-xs font-black text-[#0090C1]">
                               {student.progress}%
                             </div>
                             <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-[#0090C1]" style={{width: `${student.progress}%`}} />
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs text-gray-500 italic truncate max-w-[200px]">{student.notes || 'No notes added.'}</p>
                        </td>
                      </>
                    )}
                  </tr>
                )) : (
                   <tr>
                     <td colSpan={isGradeMode ? 2 + assessments.length : 4} className="p-10 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                           <Users size={48} className="opacity-20" />
                           <p className="font-bold text-sm">No students enrolled in this subject yet.</p>
                        </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Main Grid View
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Curriculum Management</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage academic subjects, TVET modules, and vocational tracks.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-[1.5rem] font-bold shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all hover:scale-105 active:scale-95 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" />
          New Subject
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={12} /> Search Subjects
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Find by subject title..."
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={12} /> Department
            </label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] outline-none transition-all text-sm appearance-none cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Building size={12} /> Campus
            </label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] outline-none transition-all text-sm appearance-none cursor-pointer"
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
            >
              <option value="All">All Campuses</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={12} /> Grade / Level
            </label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] outline-none transition-all text-sm appearance-none cursor-pointer"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={resetFilters}
            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100 flex items-center gap-2"
            title="Reset Filters"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all group relative border-t-4 border-t-transparent hover:border-t-[#0090C1] flex flex-col h-full">
              <div className="h-44 overflow-hidden relative shrink-0">
                <img 
                  src={course.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <button 
                    onClick={() => setSelectedCourseId(course.id)}
                    className="w-full py-3 bg-white text-[#0090C1] text-xs font-black rounded-[1rem] hover:bg-sky-50 transition-all uppercase tracking-widest shadow-lg"
                   >
                     View Profile
                   </button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                    {course.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{course.title}</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium mb-4 flex items-center gap-1">
                  <Users size={12} /> {course.instructor}
                </p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span>{course.progress}% Avg</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                      {course.duration}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Users size={12} /> {course.students}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-gray-200 rounded-[3rem] bg-gray-50/50">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Search size={32} />
           </div>
           <h3 className="text-xl font-bold text-gray-700">No subjects found</h3>
           <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
           <button onClick={resetFilters} className="mt-6 text-[#0090C1] font-bold text-sm hover:underline">Clear all filters</button>
        </div>
      )}

      {/* CREATE/EDIT SUBJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0090C1]">
                  {isEditing ? <Edit size={24} /> : <Plus size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800">{isEditing ? 'Edit Subject' : 'New Subject'}</h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">{isEditing ? 'Update curriculum and details' : 'Add to institutional curriculum'}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Title</label>
                  <input 
                    required 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-bold text-gray-700" 
                    placeholder="e.g. Advanced Chemistry"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructor</label>
                  <input 
                    required 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-bold text-gray-700" 
                    placeholder="e.g. Dr. Sarah Johnson"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-bold text-gray-700 appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'All').map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Grade Level</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-bold text-gray-700 appearance-none"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  >
                    {grades.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Campus Selection */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Campus</label>
                 <select 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all font-bold text-gray-700 appearance-none"
                    value={formData.campusId || ''}
                    onChange={(e) => setFormData({...formData, campusId: e.target.value})}
                  >
                    <option value="">Select Campus...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all text-gray-600" 
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-[#0090C1] transition-all text-gray-600 h-32 resize-none" 
                  placeholder="Subject overview and goals..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Objectives Builder */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Target size={14} /> Learning Objectives
                </label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#0090C1] text-sm" 
                    placeholder="Add an objective..."
                    value={currentObjective}
                    onChange={(e) => setCurrentObjective(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                  />
                  <button type="button" onClick={addObjective} className="p-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.objectives?.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg border border-sky-100">
                      {obj}
                      <button type="button" onClick={() => removeObjective(i)} className="hover:text-sky-900"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum Builder */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <ListChecks size={14} /> Curriculum Builder
                    </label>
                 </div>
                 
                 {/* Module Input */}
                 <div className="flex gap-2">
                    <input 
                      className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#0090C1] text-sm font-bold" 
                      placeholder="New Module Title (e.g. Unit 1: Algebra)"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={addModule} 
                      className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Add Module
                    </button>
                 </div>

                 {/* Modules List */}
                 <div className="space-y-4 mt-4">
                    {formData.curriculum?.map((module, mIdx) => (
                       <div key={mIdx} className="border border-slate-200 rounded-2xl overflow-hidden">
                          <div className="bg-slate-50 p-4 flex items-center justify-between">
                             <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs border border-slate-200 shadow-sm">{mIdx + 1}</span>
                                {module.title}
                             </h4>
                             <button type="button" onClick={() => removeModule(mIdx)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                          
                          <div className="p-4 bg-white space-y-3">
                             {/* Lessons List */}
                             {module.lessons.length > 0 && (
                                <div className="space-y-2 mb-3">
                                   {module.lessons.map((lesson, lIdx) => (
                                      <div key={lIdx} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                         <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                            {lesson}
                                         </div>
                                         <button type="button" onClick={() => removeLesson(mIdx, lIdx)} className="text-slate-300 hover:text-rose-400">
                                            <X size={12} />
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             )}

                             {/* Add Lesson Input */}
                             {activeModuleIndex === mIdx ? (
                                <div className="flex gap-2">
                                   <input 
                                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs"
                                      placeholder="Lesson Title..."
                                      value={newLessonName}
                                      onChange={(e) => setNewLessonName(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLessonToModule(mIdx))}
                                      autoFocus
                                   />
                                   <button type="button" onClick={() => addLessonToModule(mIdx)} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600">Add</button>
                                   <button type="button" onClick={() => setActiveModuleIndex(null)} className="px-3 py-2 bg-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-300">Cancel</button>
                                </div>
                             ) : (
                                <button 
                                  type="button" 
                                  onClick={() => setActiveModuleIndex(mIdx)}
                                  className="text-xs font-bold text-[#0090C1] flex items-center gap-1 hover:underline"
                                >
                                   <Plus size={12} /> Add Lesson
                                </button>
                             )}
                          </div>
                       </div>
                    ))}
                    {(!formData.curriculum || formData.curriculum.length === 0) && (
                       <div className="text-center p-6 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-2xl">
                          No modules added yet. Start building the syllabus.
                       </div>
                    )}
                 </div>
              </div>

            </form>

            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white text-gray-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 border border-gray-200 transition-all">Cancel</button>
              <button onClick={handleSaveCourse} className="flex-[2] py-4 bg-[#0090C1] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#007ba6] shadow-xl transition-all">
                {isEditing ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
