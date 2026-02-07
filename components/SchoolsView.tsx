
import React, { useState, useEffect } from 'react';
import { 
  School as SchoolIcon, 
  MapPin, 
  Globe, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Building2, 
  Users, 
  Search,
  Check,
  ChevronRight,
  ExternalLink,
  Navigation,
  Sparkles,
  Loader2,
  Briefcase,
  CalendarDays,
  Image as ImageIcon,
  GraduationCap
} from 'lucide-react';
import { School } from '../types';
import { geminiService } from '../services/gemini';
import { marked } from 'marked';
import { db } from '../utils/persistence';

export const SchoolsView: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [search, setSearch] = useState('');
  const [areaReport, setAreaReport] = useState<{ name: string, content: string, sources: any[] } | null>(null);
  const [isLoadingArea, setIsLoadingArea] = useState<string | null>(null);

  useEffect(() => {
    setSchools(db.getSchools());
  }, []);

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleLocateArea = async (school: School) => {
    setIsLoadingArea(school.id);
    try {
      const { text, sources } = await geminiService.getAreaDescription(school.location);
      setAreaReport({ name: school.name, content: text, sources });
    } catch (e) {
      alert("Mapping engine failed.");
    } finally {
      setIsLoadingArea(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently remove this campus from the database?")) {
      db.deleteSchool(id);
      setSchools(db.getSchools());
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const programsInput = formData.get('programs') as string;
    const typeValue = formData.get('type') as string;
    
    // Ensure type safety for School Type
    let schoolType: School['type'] = 'Central';
    if (['Central', 'Branch', 'Hub', 'Online', 'Vocational'].includes(typeValue)) {
        schoolType = typeValue as School['type'];
    }

    const schoolData: Partial<School> = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      phone: formData.get('phone') as string,
      web: formData.get('web') as string,
      type: schoolType,
      students: parseInt(formData.get('students') as string) || 0,
      principal: formData.get('principal') as string,
      established: formData.get('established') as string,
      image: formData.get('image') as string || `https://picsum.photos/seed/${Date.now()}/800/400`,
      programs: programsInput ? programsInput.split(',').map(p => p.trim()) : []
    };

    const schoolToSave: School = {
      ...schoolData,
      id: editingSchool?.id || `S${Date.now()}`
    } as School;

    db.saveSchool(schoolToSave);
    setSchools(db.getSchools());
    setIsModalOpen(false);
    setEditingSchool(null);
  };

  const totalEnrollment = schools.reduce((acc, s) => acc + s.students, 0);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Institutional Network</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage IFTU campuses, branches, and global learning hubs.</p>
        </div>
        <button 
          onClick={() => { setEditingSchool(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-[2rem] font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={22} /> Add Campus
        </button>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 bg-sky-50 text-[#0090C1] rounded-2xl flex items-center justify-center">
               <Building2 size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Campuses</p>
               <h4 className="text-3xl font-black text-slate-800">{schools.length}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
               <Users size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Capacity</p>
               <h4 className="text-3xl font-black text-slate-800">{totalEnrollment.toLocaleString()}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
               <Globe size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Regions</p>
               <h4 className="text-3xl font-black text-slate-800">4 Zones</h4>
            </div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search campuses by name, location, or code..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-600 focus:border-[#0090C1] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {filteredSchools.map(school => (
          <div key={school.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-0 relative group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-default">
            {/* Image Section */}
            <div className="w-full md:w-64 h-64 md:h-auto relative shrink-0 overflow-hidden">
               <img src={school.image || 'https://picsum.photos/seed/campus/400/600'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={school.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 md:hidden" />
               <div className="absolute top-6 left-6">
                  <span className={`px-4 py-2 bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg ${
                     school.type === 'Central' ? 'text-[#0090C1]' : 
                     school.type === 'Vocational' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                     {school.type}
                  </span>
               </div>
            </div>
            
            <div className="flex-1 p-10 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-[#0090C1] transition-colors">{school.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <MapPin size={16} className="text-sky-500" /> {school.location}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <CalendarDays size={16} className="text-amber-500" /> Est. {school.established || '2000'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
                    <button onClick={() => { setEditingSchool(school); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-2xl transition-all shadow-sm"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(school.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
                  </div>
                </div>

                {/* Programs Tags */}
                {school.programs && school.programs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {school.programs.map((prog, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {prog}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Principal Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-3xl border border-slate-100">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Briefcase size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Director</p>
                    <p className="text-sm font-bold text-slate-800">{school.principal || 'Pending Appointment'}</p>
                 </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => handleLocateArea(school)}
                  disabled={isLoadingArea === school.id}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0090C1] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]"
                >
                  {isLoadingArea === school.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  AI Campus Intel
                </button>
                <a href={`https://${school.web}`} target="_blank" rel="noreferrer" className="px-5 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-sky-600 hover:border-sky-200 transition-all flex items-center gap-2 shadow-sm">
                  <Globe size={20} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Report Modal */}
      {areaReport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setAreaReport(null)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#0090C1] shadow-xl shadow-sky-500/5 border border-slate-100">
                  <Navigation size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{areaReport.name} Intelligence</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AI-generated geographic & strategic analysis</p>
                </div>
              </div>
              <button onClick={() => setAreaReport(null)} className="p-3 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 prose-chat max-w-none bg-white scroll-smooth" dangerouslySetInnerHTML={{ __html: marked.parse(areaReport.content) }} />
            {areaReport.sources.length > 0 && (
              <div className="px-12 py-8 bg-slate-50 border-t border-slate-100 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grounding Sources:</p>
                <div className="flex flex-wrap gap-3">
                  {areaReport.sources.map((s, i) => s.maps && (
                    <a key={i} href={s.maps.uri} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-sky-600 hover:border-sky-400 hover:text-sky-700 transition-all flex items-center gap-2 shadow-sm">
                      <ExternalLink size={12} /> {s.maps.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-[#0090C1] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                    <SchoolIcon size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800">{editingSchool ? 'Edit Campus Profile' : 'New Campus Registry'}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Enter official institutional details</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full text-slate-400 shadow-sm transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campus Name</label>
                   <input name="name" required defaultValue={editingSchool?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. IFTU East Coast Hub" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                   <select name="type" defaultValue={editingSchool?.type} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:bg-white focus:border-[#0090C1]">
                      <option>Central</option>
                      <option>Branch</option>
                      <option>Hub</option>
                      <option>Online</option>
                      <option>Vocational</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                   <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="location" required defaultValue={editingSchool?.location} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="City, Region" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Name</label>
                   <div className="relative">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="principal" defaultValue={editingSchool?.principal} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="Director Name" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</label>
                   <input name="students" type="number" required defaultValue={editingSchool?.students} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. 1500" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Established Year</label>
                   <input name="established" type="number" defaultValue={editingSchool?.established} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="e.g. 2005" />
                 </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campus Programs</label>
                 <div className="relative">
                    <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input name="programs" defaultValue={editingSchool?.programs?.join(', ')} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="IT Level 1, Accounting, Design (Comma separated)" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campus Image URL</label>
                 <div className="relative">
                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input name="image" type="url" defaultValue={editingSchool?.image} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-[#0090C1] transition-all" placeholder="https://..." />
                 </div>
              </div>

              <div className="flex gap-6 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingSchool(null); }} className="flex-1 py-5 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-5 bg-[#0090C1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#007ba6] transition-all active:scale-[0.98]">Confirm & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
