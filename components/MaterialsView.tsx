
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  File, 
  Video, 
  Link as LinkIcon, 
  Download,
  Trash2,
  X,
  StickyNote,
  Sparkles,
  BrainCircuit,
  Loader2,
  Check,
  Copy
} from 'lucide-react';
import { AuthUser, Material } from '../types';
import { geminiService } from '../services/gemini';
import { marked } from 'marked';
import { db } from '../utils/persistence';

interface MaterialsViewProps {
  user: AuthUser;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({ user }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'File' | 'Note'>('File');
  const [aiSummary, setAiSummary] = useState<{ id: string, text: string } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const isAdminOrTeacher = user.role === 'Admin' || user.role === 'Teacher';

  useEffect(() => {
    setMaterials(db.getMaterials());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this educational resource?")) {
      db.deleteMaterial(id);
      setMaterials(db.getMaterials());
    }
  };

  const handleSummarize = async (material: Material) => {
    setIsSummarizing(material.id);
    try {
      const summary = await geminiService.summarizeMaterial(material.title, material.courseTitle);
      setAiSummary({ id: material.id, text: summary });
    } catch (e) {
      alert("AI Analysis failed. Please try again.");
    } finally {
      setIsSummarizing(null);
    }
  };

  const handleCopySummary = () => {
    if (aiSummary) {
      navigator.clipboard.writeText(aiSummary.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMaterial: Material = {
      id: `m${Date.now()}`,
      title: formData.get('title') as string,
      type: uploadType === 'Note' ? 'Note' : (formData.get('type') as any),
      courseTitle: formData.get('course') as string,
      uploadDate: new Date().toISOString().split('T')[0],
      size: uploadType === 'Note' ? undefined : '1.2 MB',
      author: user.name
    };
    db.saveMaterial(newMaterial);
    setMaterials(db.getMaterials());
    setIsUploading(false);
  };

  const handleRealDownload = (material: Material) => {
    const isDocx = material.title.endsWith('.docx');
    const mimeType = isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf';
    const dummyContent = `This is a placeholder content for ${material.title}. \n\nCourse: ${material.courseTitle}\nAuthor: ${material.author}`;
    const blob = new Blob([dummyContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = material.title; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getIcon = (type: Material['type'], title: string) => {
    if (title.endsWith('.docx') || title.endsWith('.doc')) return <FileText className="text-blue-600" />;
    if (title.endsWith('.pdf')) return <File className="text-rose-500" />;
    switch (type) {
      case 'Document': return <File className="text-blue-500" />;
      case 'Video': return <Video className="text-purple-500" />;
      case 'Link': return <LinkIcon className="text-emerald-500" />;
      case 'Note': return <StickyNote className="text-amber-500" />;
      default: return <FileText className="text-gray-500" />;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">Resource Vault</h2>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#0090C1] text-[9px] font-black rounded-full uppercase tracking-widest border border-sky-100">
               <Sparkles size={12} /> AI Enhanced
             </div>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">Textbooks, lecture notes, and digital learning assets.</p>
        </div>
        {isAdminOrTeacher && (
          <button 
            onClick={() => { setUploadType('File'); setIsUploading(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-[2rem] font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all hover:scale-105 active:scale-95"
          >
            <Upload size={22} />
            Publish Resource
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Asset Name</th>
                <th className="px-10 py-6">Context</th>
                <th className="px-10 py-6">AI Actions</th>
                <th className="px-10 py-6 text-center">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {materials.map(material => (
                <tr key={material.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {getIcon(material.type, material.title)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{material.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{material.size || material.type}</span>
                           <span className="text-[10px] text-slate-300">•</span>
                           <span className="text-[10px] text-slate-400 font-medium">{material.author}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-1.5 bg-sky-50 text-[#0090C1] rounded-full text-[9px] font-black uppercase border border-sky-100">
                      {material.courseTitle}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    {material.type !== 'Link' && (
                      <button 
                        onClick={() => handleSummarize(material)}
                        disabled={isSummarizing === material.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                      >
                        {isSummarizing === material.id ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={12} />}
                        AI Summarize
                      </button>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-2">
                       <button onClick={() => handleRealDownload(material)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#0090C1] hover:border-[#0090C1] transition-all shadow-sm">
                         <Download size={18} />
                       </button>
                       {isAdminOrTeacher && (
                         <button onClick={() => handleDelete(material.id)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm">
                           <Trash2 size={18} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aiSummary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setAiSummary(null)} />
          <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-sky-50/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#0090C1] shadow-xl shadow-sky-500/5 border border-white">
                  <BrainCircuit size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">AI Study Guide</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Generated by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button onClick={() => setAiSummary(null)} className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-400 shadow-sm transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 prose-chat max-w-none bg-slate-50/30 scroll-smooth" dangerouslySetInnerHTML={{ __html: marked.parse(aiSummary.text) }} />
            <div className="p-8 border-t border-slate-100 flex gap-4 shrink-0 bg-white">
               <button onClick={() => setAiSummary(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Close</button>
               <button onClick={handleCopySummary} className="flex-1 py-4 bg-[#0090C1] text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-[#007ba6] transition-all flex items-center justify-center gap-2">
                 {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Summary'}
               </button>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsUploading(false)} />
          <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="text-2xl font-black text-slate-800">Resource Publisher</h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Upload material to repository</p>
              </div>
              <button onClick={() => setIsUploading(false)} className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-400 shadow-sm"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpload} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Headline</label>
                <input name="title" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. Grade 11 Physics Notes" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Course</label>
                <input name="course" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. Physics (Grade 11)" />
              </div>
              <div className="p-12 border-2 border-dashed border-sky-100 rounded-[2.5rem] bg-sky-50/20 text-center space-y-4 group cursor-pointer hover:bg-sky-50/40 transition-all">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#0090C1] mx-auto shadow-sm group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                <div>
                   <p className="text-sm font-bold text-slate-800">Drop your file or browse</p>
                   <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">PDF, MP4, DOCX Supported</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsUploading(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-[#0090C1] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-[#007ba6] transition-all">Publish Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
