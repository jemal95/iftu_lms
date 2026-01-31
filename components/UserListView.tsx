
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  X, 
  Plus, 
  CheckCircle2, 
  Calendar,
  Building,
  Eye,
  RotateCcw,
  KeyRound,
  ShieldAlert,
  Database,
  Camera,
  MapPin,
  User as UserIcon,
  GraduationCap,
  Fingerprint,
  ScanFace,
  Briefcase,
  BookOpen,
  Layers,
  Award,
  Hash,
  School as SchoolIcon
} from 'lucide-react';
import { User, AuthUser, School } from '../types';
import { db } from '../utils/persistence';

interface UserListViewProps {
  role: 'Teacher' | 'Student';
  currentUser: AuthUser;
}

const ACADEMIC_GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const TVET_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

export const UserListView: React.FC<UserListViewProps> = ({ role, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Advanced Form State for Teachers
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [inputSubject, setInputSubject] = useState('');
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  
  // Image Upload State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === 'Admin';

  // Load from DB on mount
  useEffect(() => {
    setUsers(db.getUsers());
    setSchools(db.getSchools());
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const roleMatches = user.role === role;
      const statusMatches = statusFilter === 'All' || user.status === statusFilter;
      const searchTerm = search.toLowerCase().trim();
      const searchMatches = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm) ||
        (user.nationalId && user.nationalId.toLowerCase().includes(searchTerm)) ||
        user.department.toLowerCase().includes(searchTerm);
      return roleMatches && statusMatches && searchMatches;
    });
  }, [users, role, statusFilter, search]);

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm(`DATABASE ACTION: Permanently remove this ${role.toLowerCase()} record?`)) {
      db.deleteUser(id);
      setUsers(db.getUsers()); // Sync state
      setToastMessage(`${role} deleted from database`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleResetPassword = (user: User) => {
    if (!isAdmin) return;
    if (window.confirm(`SECURITY: Reset credentials for ${user.name}?`)) {
      setToastMessage(`New secure access link sent to ${user.email}`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (user?: User) => {
    setEditingUser(user || null);
    setPhotoPreview(user?.avatar || null);
    
    // Reset or populate advanced fields
    if (user && role === 'Teacher') {
        setSelectedGrades(user.assignedGrades || []);
        setAssignedSubjects(user.assignedSubjects || []);
    } else {
        setSelectedGrades([]);
        setAssignedSubjects([]);
    }
    
    setIsModalOpen(true);
  };

  // Helper functions for Multi-selects
  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const addSubject = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputSubject.trim()) {
        e.preventDefault();
        if (!assignedSubjects.includes(inputSubject.trim())) {
            setAssignedSubjects([...assignedSubjects, inputSubject.trim()]);
        }
        setInputSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setAssignedSubjects(prev => prev.filter(s => s !== subject));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const formData = new FormData(e.currentTarget);
    
    const userToSave: User = {
      id: editingUser?.id || `U${Date.now().toString().slice(-4)}`,
      role: role,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      status: formData.get('status') as any,
      phone: formData.get('phone') as string,
      nationalId: formData.get('nationalId') as string,
      gender: formData.get('gender') as any,
      birthday: formData.get('birthday') as string,
      motherName: formData.get('motherName') as string,
      
      // Address
      address: {
        country: formData.get('country') as string,
        state: formData.get('state') as string,
        zone: formData.get('zone') as string,
        woreda: formData.get('woreda') as string,
      },
      
      // Student Specific
      promotedGrade: role === 'Student' ? formData.get('promotedGrade') as string : undefined,
      currentGrade: role === 'Student' ? formData.get('currentGrade') as string : undefined,

      // Teacher Specific
      qualification: role === 'Teacher' ? formData.get('qualification') as any : undefined,
      employmentType: role === 'Teacher' ? formData.get('employmentType') as any : undefined,
      campusId: role === 'Teacher' ? formData.get('campusId') as string : undefined,
      assignedSubjects: role === 'Teacher' ? assignedSubjects : undefined,
      assignedGrades: role === 'Teacher' ? selectedGrades : undefined,

      joinDate: editingUser?.joinDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: photoPreview || editingUser?.avatar || `https://picsum.photos/seed/${Date.now()}/100/100`,
    };

    db.saveUser(userToSave);
    setUsers(db.getUsers()); // Sync state
    setToastMessage(editingUser ? 'Database updated' : 'Record created');
    setIsModalOpen(false);
    setEditingUser(null);
    setPhotoPreview(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const getCampusName = (id?: string) => {
      const s = schools.find(sch => sch.id === id);
      return s ? s.name : 'Unassigned';
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-[70] animate-in slide-in-from-right-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <Database size={24} />
            <div>
              <p className="font-bold text-sm">System Update</p>
              <p className="text-xs opacity-90">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{role === 'Teacher' ? 'Faculty & Staff' : 'Student Registry'}</h2>
          <p className="text-sm text-gray-500 mt-1">{role === 'Teacher' ? 'Manage teaching staff, assignments, and campus deployment.' : 'Institutional database of registered students.'}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all"
          >
            <Plus size={22} />
            Add New {role}
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search by Name, ID, or Department...`}
            className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
            {(['All', 'Active', 'Inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === s ? 'bg-white text-[#0090C1] shadow-sm' : 'text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-black border-b border-gray-100">
                <th className="px-10 py-6">Record Identity</th>
                <th className="px-10 py-6">Department</th>
                {role === 'Student' && <th className="px-10 py-6">Grade</th>}
                {role === 'Teacher' && <th className="px-10 py-6">Assignment</th>}
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-center">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                             {user.nationalId && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                    <Fingerprint size={10} className="text-sky-500" /> {user.nationalId}
                                </span>
                             )}
                             {role === 'Teacher' && user.qualification && (
                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{user.qualification}</span>
                             )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-tight border border-gray-200">
                      {user.department}
                    </span>
                  </td>
                  {role === 'Student' && (
                    <td className="px-10 py-6 text-xs font-bold text-slate-600">
                      {user.currentGrade || '-'}
                    </td>
                  )}
                  {role === 'Teacher' && (
                    <td className="px-10 py-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                <Building size={10} /> {getCampusName(user.campusId)}
                            </span>
                            {user.assignedSubjects && user.assignedSubjects.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {user.assignedSubjects.slice(0, 2).map((sub, i) => (
                                        <span key={i} className="text-[9px] bg-sky-50 text-sky-600 px-1.5 rounded font-bold">{sub}</span>
                                    ))}
                                    {user.assignedSubjects.length > 2 && <span className="text-[9px] text-slate-400">+{user.assignedSubjects.length - 2}</span>}
                                </div>
                            )}
                        </div>
                    </td>
                  )}
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewingUser(user)} className="p-3 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"><Eye size={18} /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openModal(user)} className="p-3 text-gray-400 hover:text-[#0090C1] hover:bg-sky-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => handleResetPassword(user)} className="p-3 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><KeyRound size={18} /></button>
                          <button onClick={() => handleDelete(user.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={role === 'Student' ? 5 : 6} className="px-10 py-24 text-center text-gray-400">Database query returned zero results.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0090C1] shadow-lg">
                   {role === 'Teacher' ? <Briefcase size={24} /> : <UserIcon size={24} />}
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-gray-800">{editingUser ? 'Update Profile' : `Register ${role}`}</h3>
                   <p className="text-xs text-gray-500 font-medium mt-1">
                       {role === 'Teacher' ? 'Manage comprehensive employee records & assignments' : 'Complete student enrollment details'}
                   </p>
                 </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Photo Upload Section */}
                <div className="lg:w-1/4 flex flex-col items-center gap-4">
                   <div 
                     className="w-full aspect-[4/5] rounded-[2rem] bg-slate-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden relative cursor-pointer group transition-all hover:scale-[1.02]"
                     onClick={() => fileInputRef.current?.click()}
                   >
                      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/50" />
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/50" />
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50" />

                      {photoPreview ? (
                        <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="text-center text-slate-500 group-hover:text-white transition-colors flex flex-col items-center gap-3">
                           <div className="w-16 h-16 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover:border-sky-400 group-hover:bg-sky-500/20 transition-all">
                              <ScanFace size={32} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Capture Photo</p>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-md flex items-center justify-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                         <span className="text-[8px] text-white font-mono uppercase">ID-CAM READY</span>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                   </div>
                </div>

                {/* Form Fields Section */}
                <div className="flex-1 space-y-8">
                   {/* Personal Details */}
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-widest border-b border-gray-100 pb-2">Personal Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Full Name</label>
                            <input name="name" required defaultValue={editingUser?.name} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]" placeholder="e.g. Abebe Bikila" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">National ID <Fingerprint size={10} /></label>
                            <input name="nationalId" defaultValue={editingUser?.nationalId} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1] font-mono text-sm" placeholder="ETH-ID-XXXXX" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email</label>
                            <input name="email" type="email" required defaultValue={editingUser?.email} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]" placeholder="user@iftu.edu" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Phone</label>
                            <input name="phone" required defaultValue={editingUser?.phone} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]" placeholder="+251..." />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Gender</label>
                            <select name="gender" defaultValue={editingUser?.gender || 'Male'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                               <option>Male</option>
                               <option>Female</option>
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Mother's Name</label>
                            <input name="motherName" defaultValue={editingUser?.motherName} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]" />
                         </div>
                      </div>
                   </div>

                   {/* Address */}
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-widest border-b border-gray-100 pb-2">Location</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <input name="country" required defaultValue={editingUser?.address?.country || 'Ethiopia'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" placeholder="Country" />
                         <input name="state" required defaultValue={editingUser?.address?.state || 'Oromia'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" placeholder="State" />
                         <input name="zone" required defaultValue={editingUser?.address?.zone} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" placeholder="Zone" />
                         <input name="woreda" required defaultValue={editingUser?.address?.woreda} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" placeholder="Woreda" />
                      </div>
                   </div>

                   {/* Role Specific Section - Student */}
                   {role === 'Student' && (
                       <div className="space-y-4">
                          <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-widest border-b border-gray-100 pb-2">Academic Profile</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Current Grade</label>
                                <input name="currentGrade" defaultValue={editingUser?.currentGrade} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]" placeholder="e.g. Grade 12" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Department</label>
                                <select name="department" defaultValue={editingUser?.department || 'Natural Science'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                                   <option>Natural Science</option>
                                   <option>Social Science</option>
                                </select>
                             </div>
                          </div>
                       </div>
                   )}

                   {/* Role Specific Section - Teacher / Employee */}
                   {role === 'Teacher' && (
                       <div className="space-y-4">
                          <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-widest border-b border-gray-100 pb-2">Professional Assignment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Qualification</label>
                                <select name="qualification" defaultValue={editingUser?.qualification || 'BSc/BA'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                                   <option>Diploma</option>
                                   <option>BSc/BA</option>
                                   <option>MSc/MA</option>
                                   <option>PhD</option>
                                </select>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Employment Type</label>
                                <select name="employmentType" defaultValue={editingUser?.employmentType || 'Full-time'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                                   <option>Full-time</option>
                                   <option>Part-time</option>
                                   <option>Contract</option>
                                </select>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Department</label>
                                <select name="department" defaultValue={editingUser?.department || 'Natural Science'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                                   <option>Computer Science</option>
                                   <option>Natural Science</option>
                                   <option>Social Science</option>
                                   <option>Languages</option>
                                   <option>Agriculture</option>
                                   <option>Business</option>
                                </select>
                             </div>
                          </div>

                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Assign Campus</label>
                             <select name="campusId" defaultValue={editingUser?.campusId} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                                <option value="">Select Campus...</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                             {/* Grade Assignment */}
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1"><Layers size={10} /> Assign Grades/Levels</label>
                                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 h-32 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2">
                                        {[...ACADEMIC_GRADES, ...TVET_LEVELS].map(grade => (
                                            <label key={grade} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedGrades.includes(grade)}
                                                    onChange={() => toggleGrade(grade)}
                                                    className="w-4 h-4 rounded text-[#0090C1] focus:ring-[#0090C1]"
                                                />
                                                {grade}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                             </div>

                             {/* Subject Assignment */}
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1"><BookOpen size={10} /> Assign Subjects</label>
                                <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 h-32 flex flex-col">
                                    <div className="flex-1 flex flex-wrap content-start gap-1 overflow-y-auto mb-2">
                                        {assignedSubjects.map(sub => (
                                            <span key={sub} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-700 text-[10px] font-bold rounded">
                                                {sub} <X size={10} className="cursor-pointer hover:text-sky-900" onClick={() => removeSubject(sub)} />
                                            </span>
                                        ))}
                                        {assignedSubjects.length === 0 && <span className="text-xs text-slate-400 italic p-1">No subjects assigned.</span>}
                                    </div>
                                    <input 
                                        value={inputSubject}
                                        onChange={(e) => setInputSubject(e.target.value)}
                                        onKeyDown={addSubject}
                                        placeholder="Type Subject & Enter..." 
                                        className="w-full bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#0090C1]" 
                                    />
                                </div>
                             </div>
                          </div>
                       </div>
                   )}

                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Account Status</label>
                      <select name="status" defaultValue={editingUser?.status || 'Active'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0090C1]">
                         <option value="Active">Active</option>
                         <option value="Inactive">Inactive</option>
                      </select>
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancel</button>
                 <button type="submit" className="flex-[2] py-4 bg-[#0090C1] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#007ba6] shadow-xl transition-all">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
