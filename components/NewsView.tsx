
import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Bell, 
  Plus, 
  Calendar, 
  User, 
  Tag, 
  MoreHorizontal, 
  X, 
  Send, 
  Image as ImageIcon,
  CheckCircle,
  Download,
  Users,
  FileText,
  Briefcase,
  ClipboardList
} from 'lucide-react';
import { AuthUser, NewsPost, Announcement } from '../types';
import { db } from '../utils/persistence';

interface NewsViewProps {
  user: AuthUser;
}

export const NewsView: React.FC<NewsViewProps> = ({ user }) => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isRegistering, setIsRegistering] = useState<NewsPost | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isAdmin = user.role === 'Admin';

  useEffect(() => {
    setPosts(db.getNews());
    setAnnouncements(db.getAnnouncements());
  }, []);

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hasReg = formData.get('hasRegistration') === 'on';
    const categoryValue = formData.get('category') as string;
    
    // Ensure type safety
    let category: NewsPost['category'] = 'Update';
    if (['Update', 'Event', 'Institutional', 'Recruitment', 'HR'].includes(categoryValue)) {
        category = categoryValue as NewsPost['category'];
    }

    const newPost: NewsPost = {
      id: `np${Date.now()}`,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      date: new Date().toISOString().split('T')[0],
      author: user.name,
      image: 'https://picsum.photos/seed/' + Date.now() + '/800/400',
      category: category,
      hasRegistration: hasReg,
      registrationCount: hasReg ? 0 : undefined,
      attachment: formData.get('attachment') ? 'Resource_File.pdf' : undefined // Mock attachment
    };
    
    db.saveNews(newPost);
    setPosts(db.getNews());
    setIsPosting(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
       const updatedPost = { ...isRegistering, registrationCount: (isRegistering.registrationCount || 0) + 1 };
       db.saveNews(updatedPost);
       setPosts(db.getNews());
    }
    setIsRegistering(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-[70] animate-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle size={24} />
            <div>
              <p className="font-bold text-sm">Registration Successful</p>
              <p className="text-xs opacity-90">Your details have been forwarded.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Institutional Bulletin</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">News, recruitment notices, and event registrations.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsPosting(true)}
            className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all active:scale-95"
          >
            <Plus size={22} />
            Publish Update
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Main News Feed */}
        <div className="xl:col-span-3 space-y-10">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-64 sm:h-80 overflow-hidden relative">
                <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-1.5 bg-white/95 backdrop-blur-sm text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm ${
                    post.category === 'Recruitment' ? 'text-purple-600' : 
                    post.category === 'HR' ? 'text-emerald-600' : 'text-[#0090C1]'
                  }`}>
                    {post.category}
                  </span>
                </div>
                {post.attachment && (
                   <div className="absolute bottom-6 right-6">
                     <button className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition-colors shadow-lg">
                       <Download size={14} /> Download Material
                     </button>
                   </div>
                )}
              </div>
              <div className="p-10 space-y-6">
                <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-sky-500" /> {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-sky-500" /> {post.author}
                  </div>
                  {post.hasRegistration && (
                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                      <Users size={14} /> {post.registrationCount} Registered
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-800 leading-tight group-hover:text-[#0090C1] transition-colors">{post.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-light">{post.content}</p>
                
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex gap-3">
                     {post.hasRegistration && (
                       <button 
                        onClick={() => setIsRegistering(post)}
                        className="px-6 py-3 bg-[#0090C1] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95 flex items-center gap-2"
                       >
                         <ClipboardList size={16} /> Register Now
                       </button>
                     )}
                     <button className="text-sm font-bold text-slate-500 hover:text-[#0090C1] px-4 py-3 rounded-xl hover:bg-slate-50 transition-all">
                       Details →
                     </button>
                   </div>
                   <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                     <MoreHorizontal size={20} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Announcements */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Bell size={20} className="text-amber-500" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Global Alerts</h4>
              </div>
              <div className="space-y-6">
                {announcements.map(a => (
                  <div key={a.id} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                         a.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                       }`}>
                         {a.priority} Priority
                       </span>
                       <span className="text-[9px] font-bold text-slate-300">{a.date}</span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-800 group-hover:text-[#0090C1] transition-colors">{a.title}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                Archived Alerts
              </button>
           </div>

           <div className="bg-gradient-to-br from-[#0090C1] to-indigo-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-sky-500/20 relative overflow-hidden">
              <Briefcase size={120} strokeWidth={1} className="absolute -bottom-8 -right-8 opacity-20" />
              <div className="relative z-10 space-y-6">
                <Tag size={32} strokeWidth={1.5} className="opacity-50" />
                <h4 className="text-xl font-bold leading-tight">Faculty & Staff Opportunities</h4>
                <p className="text-sm opacity-80 leading-relaxed font-light">
                  Browse internal postings for teaching positions, administrative roles, and training workshops.
                </p>
                <button className="w-full py-3 bg-white text-[#0090C1] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-50 transition-all shadow-lg">
                  View HR Portal
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {isPosting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsPosting(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
                    <Newspaper size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800">Draft Bulletin</h3>
               </div>
               <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                 <X size={24} />
               </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headline</label>
                <input name="title" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-500 transition-colors" placeholder="Catchy title for the update..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select name="category" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none focus:border-sky-500 transition-colors">
                    <option>Update</option>
                    <option>Event</option>
                    <option>Institutional</option>
                    <option>Recruitment</option>
                    <option>HR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Features</label>
                  <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="hasRegistration" id="hasReg" className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500" />
                      <label htmlFor="hasReg" className="text-sm font-bold text-slate-600 cursor-pointer">Registration Form</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachment</label>
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="attachment" id="att" className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500" />
                      <label htmlFor="att" className="text-sm font-bold text-slate-600 cursor-pointer">Include Material Download</label>
                    </div>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Body</label>
                <textarea name="content" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none h-32 resize-none focus:border-sky-500 transition-colors" placeholder="Elaborate on the news..." />
              </div>
              <button type="submit" className="w-full py-5 bg-[#0090C1] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#007ba6] transition-all">
                <Send size={18} />
                Publish to Network
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {isRegistering && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsRegistering(null)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-sky-50/50">
               <h3 className="text-xl font-black text-slate-800 text-center">Event Registration</h3>
               <p className="text-xs text-slate-500 font-medium text-center mt-1">{isRegistering.title}</p>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Participant Name</label>
                <input 
                  defaultValue={user.name} 
                  required 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  defaultValue={user.email} 
                  required 
                  type="email" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department / ID</label>
                <input 
                  placeholder="e.g. Physics Dept - ID 4021"
                  required 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
                <textarea 
                  placeholder="Dietary restrictions or special accommodations..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none h-24 resize-none" 
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsRegistering(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-4 bg-[#0090C1] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
