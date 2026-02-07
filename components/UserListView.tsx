
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
  Building,
  Eye,
  RotateCcw,
  KeyRound,
  Database,
  ScanFace,
  User as UserIcon,
  Fingerprint,
  Briefcase,
  BookOpen,
  Layers,
  ArrowRight,
  Loader2,
  Smartphone,
  CreditCard,
  Send,
  Lock,
  Copy,
  Users,
  GraduationCap,
  ShieldCheck,
  MoreHorizontal
} from 'lucide-react';
import { User, AuthUser, School, PaymentTransaction } from '../types';
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
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  // Registration Process States
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    user: User;
    tempPass: string;
    paymentLink: string;
  } | null>(null);

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
    setRegistrationSuccess(null); // Reset success state
    
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

  const generateCredential = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return 'IFTU-' + Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const formData = new FormData(e.currentTarget);
    const isNewUser = !editingUser;

    const qualification = formData.get('qualification');
    const employmentType = formData.get('employmentType');
    const status = formData.get('status');

    const userData: User = {
      id: editingUser?.id || `U${Date.now().toString().slice(-4)}`,
      role: role,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      status: (status === 'Active' || status === 'Inactive') ? status : 'Active',
      phone: formData.get('phone') as string,
      nationalId: formData.get('nationalId') as string,
      gender: formData.get('gender') as 'Male' | 'Female',
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
      qualification: role === 'Teacher' ? (qualification as 'Diploma' | 'BSc/BA' | 'MSc/MA' | 'PhD') : undefined,
      employmentType: role === 'Teacher' ? (employmentType as 'Full-time' | 'Part-time' | 'Contract') : undefined,
      campusId: role === 'Teacher' ? formData.get('campusId') as string : undefined,
      assignedSubjects: role === 'Teacher' ? assignedSubjects : undefined,
      assignedGrades: role === 'Teacher' ? selectedGrades : undefined,

      joinDate: editingUser?.joinDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: photoPreview || editingUser?.avatar || `https://picsum.photos/seed/${Date.now()}/100/100`,
    };

    if (isNewUser && role === 'Student') {
        setIsProcessing(true);
        // Simulate backend processing delay for generating account & links
        setTimeout(() => {
            db.saveUser(userData);
            
            // AUTOMATICALLY CREATE TUITION FEE RECORD
            const feeTx: PaymentTransaction = {
                id: `tuition-${userData.id}`,
                date: new Date().toISOString().split('T')[0],
                description: 'Annual Tuition Fee (2024/25)',
                amount: 12000,
                method: 'System',
                status: 'Pending',
                type: 'Debit'
            };
            db.savePayment(feeTx);

            setUsers(db.getUsers());
            
            setRegistrationSuccess({
                user: userData,
                tempPass: generateCredential(),
                paymentLink: `https://iftu.edu/pay/${userData.id}?amt=12000`
            });
            setIsProcessing(false);
        }, 2000);
    } else {
        // Normal save for teachers or edits
        db.saveUser(userData);
        setUsers(db.getUsers());
        setToastMessage(editingUser ? 'Database updated' : 'Record created');
        setIsModalOpen(false);
        setEditingUser(null);
        setPhotoPreview(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const getCampusName = (id?: string) => {
      const s = schools.find(sch => sch.id === id);
      return s ? s.name : 'Unassigned';
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className={`p-3 rounded-2xl ${role === 'Teacher' ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-[#0090C1]'}`}>
                {role === 'Teacher' ? <Briefcase size={28} /> : <GraduationCap size={28} />}
             </div>
             <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{role === 'Teacher' ? 'Faculty Directory' : 'Student Registry'}</h2>
                <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">{filteredUsers.length} Active Records</p>
             </div>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-3 px-8 py-4 bg-[#0090C1] text-white rounded-[2rem] font-bold shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={22} />
            <span className="uppercase tracking-widest text-xs">Add New {role}</span>
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
               <CheckCircle2 size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</p>
               <h4 className="text-2xl font-black text-slate-800">{users.filter(u => u.role === role && u.status === 'Active').length}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
               <Fingerprint size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified IDs</p>
               <h4 className="text-2xl font-black text-slate-800">{users.filter(u => u.role === role && u.nationalId).length}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
               <Building size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departments</p>
               <h4 className="text-2xl font-black text-slate-800">{new Set(users.filter(u => u.role === role).map(u => u.department)).size}</h4>
            </div>
         </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0090C1] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={`Search by Name, ID, or Department...`}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-600 outline-none focus:bg-white focus:border-[#0090C1] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {(['All', 'Active', 'Inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === s ? 'bg-white text-[#0090C1] shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="p-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-100">
                <th className="px-10 py-6">Record Identity</th>
                <th className="px-10 py-6">Department</th>
                {role === 'Student' && <th className="px-10 py-6">Grade Level</th>}
                {role === 'Teacher' && <th className="px-10 py-6">Assignment</th>}
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-center">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                        <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-300" alt="" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{user.id}</span>
                             {user.nationalId && (
                                <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                    <Fingerprint size={10} className="text-sky-500" /> Verified
                                </span>
                             )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 group-hover:border-slate-200 transition-colors">
                      {user.department}
                    </span>
                  </td>
                  {role === 'Student' && (
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                        {user.currentGrade || '-'}
                      </span>
                    </td>
                  )}
                  {role === 'Teacher' && (
                    <td className="px-10 py-6">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                <Building size={12} className="text-sky-500" /> {getCampusName(user.campusId)}
                            </span>
                            {user.assignedSubjects && user.assignedSubjects.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {user.assignedSubjects.slice(0, 2).map((sub, i) => (
                                        <span key={i} className="text-[9px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold border border-sky-100">{sub}</span>
                                    ))}
                                    {user.assignedSubjects.length > 2 && <span className="text-[9px] text-slate-400 font-bold">+{user.assignedSubjects.length - 2}</span>}
                                </div>
                            )}
                        </div>
                    </td>
                  )}
                  <td className="px-10 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      user.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewingUser(user)} className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"><Eye size={18} /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openModal(user)} className="p-2.5 text-slate-400 hover:text-[#0090C1] hover:bg-sky-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => handleResetPassword(user)} className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><KeyRound size={18} /></button>
                          <button onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={role === 'Student' ? 5 : 6} className="px-10 py-32 text-center">
                     <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Users size={48} />
                        <p className="font-bold text-sm uppercase tracking-widest">No records found matching your filters.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => !isProcessing && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {registrationSuccess ? (
                // SUCCESS / NOTIFICATION VIEW
                <div className="flex flex-col h-full bg-slate-50/50">
                    <div className="p-10 border-b border-slate-200 bg-white flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 animate-in zoom-in shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Registration Complete</h3>
                            <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Credentials Dispatched</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="ml-auto p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={24} /></button>
                    </div>

                    <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Email Simulation */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Mail size={14} className="text-sky-500" /> Sent to {registrationSuccess.user.email}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500" />
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-slate-800">Welcome to IFTU LMS</p>
                                    <p className="text-xs text-slate-400 font-medium">From: admissions@iftu.edu</p>
                                </div>
                                <div className="space-y-3 text-sm text-slate-600 leading-relaxed font-medium">
                                    <p>Dear {registrationSuccess.user.name},</p>
                                    <p>Your student account has been created. Please complete your registration payment to activate full access.</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider">Username</span>
                                        <span className="font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold">{registrationSuccess.user.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider">Temp Password</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold">{registrationSuccess.tempPass}</span>
                                            <Copy size={14} className="text-slate-400 cursor-pointer hover:text-sky-500" />
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-[#0090C1] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
                                    <CreditCard size={16} /> Pay Tuition (Telebirr/CBE)
                                </button>
                            </div>
                        </div>

                        {/* SMS Simulation */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Smartphone size={14} className="text-emerald-500" /> Sent to {registrationSuccess.user.phone}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm w-full max-w-sm mx-auto relative group hover:shadow-md transition-shadow">
                                <div className="bg-slate-100 rounded-3xl rounded-tl-none p-5 text-xs text-slate-700 leading-relaxed relative font-medium">
                                    <p className="font-black mb-2 text-slate-900">IFTU ALERT:</p>
                                    <p>Welcome {registrationSuccess.user.name.split(' ')[0]}! Your registration is pending payment.</p>
                                    <p className="mt-3 bg-white p-2 rounded-lg border border-slate-200 text-sky-600 underline truncate">{registrationSuccess.paymentLink}</p>
                                </div>
                                <div className="mt-3 text-[10px] text-slate-400 text-right font-black uppercase tracking-widest">Just now</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-10 border-t border-slate-200 bg-white flex justify-end">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl"
                        >
                            Done <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                // FORM VIEW
                <>
                    <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-[#0090C1] shadow-xl shadow-sky-500/5 border border-white">
                                {role === 'Teacher' ? <Briefcase size={32} /> : <UserIcon size={32} />}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingUser ? 'Update Profile' : `Register ${role}`}</h3>
                                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">
                                    {role === 'Teacher' ? 'Manage Staff Details' : 'Enrollment Wizard'}
                                </p>
                            </div>
                        </div>
                        {!isProcessing && (
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm"><X size={24} /></button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSave} className="p-10 space-y-10 overflow-y-auto relative bg-white">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in">
                            <div className="relative">
                                <div className="w-20 h-20 border-[6px] border-slate-100 border-t-[#0090C1] rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={32} className="text-[#0090C1] animate-pulse" />
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 mt-6">Creating Account...</h4>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Generating credentials & payment links</p>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Photo Upload Section */}
                        <div className="lg:w-1/4 flex flex-col items-center gap-6">
                            <div 
                                className="w-full aspect-[4/5] rounded-[2.5rem] bg-slate-900 border-[6px] border-white shadow-2xl flex items-center justify-center overflow-hidden relative cursor-pointer group transition-all hover:scale-[1.02]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {/* Camera UI Overlay */}
                                <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
                                    <div className="absolute top-6 left-6 w-8 h-8 border-t-[3px] border-l-[3px] border-white/50 rounded-tl-xl" />
                                    <div className="absolute top-6 right-6 w-8 h-8 border-t-[3px] border-r-[3px] border-white/50 rounded-tr-xl" />
                                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-[3px] border-l-[3px] border-white/50 rounded-bl-xl" />
                                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[3px] border-r-[3px] border-white/50 rounded-br-xl" />
                                </div>

                                {photoPreview ? (
                                    <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <div className="text-center text-slate-500 group-hover:text-white transition-colors flex flex-col items-center gap-4 relative z-0">
                                        <div className="w-20 h-20 rounded-full border-2 border-slate-700 flex items-center justify-center group-hover:border-sky-400 group-hover:bg-sky-500/20 transition-all">
                                            <ScanFace size={40} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Photo</p>
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4 z-20">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
                                        <span className="text-[8px] text-white font-mono uppercase tracking-widest">REC</span>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </div>
                        </div>

                        {/* Form Fields Section */}
                        <div className="flex-1 space-y-10">
                        {/* Personal Details */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2">
                                <UserIcon size={14} /> Personal Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input name="name" required defaultValue={editingUser?.name} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" placeholder="e.g. Abebe Bikila" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">National ID <Fingerprint size={12} /></label>
                                    <input name="nationalId" defaultValue={editingUser?.nationalId} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 font-mono text-sm" placeholder="ETH-ID-XXXXX" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <input name="email" type="email" required defaultValue={editingUser?.email} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" placeholder="user@iftu.edu" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input name="phone" required defaultValue={editingUser?.phone} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" placeholder="+251..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                    <select name="gender" defaultValue={editingUser?.gender || 'Male'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                    <option>Male</option>
                                    <option>Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mother's Name</label>
                                    <input name="motherName" defaultValue={editingUser?.motherName} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Building size={14} /> Location Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <input name="country" required defaultValue={editingUser?.address?.country || 'Ethiopia'} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700 focus:border-[#0090C1]" placeholder="Country" />
                                <input name="state" required defaultValue={editingUser?.address?.state || 'Oromia'} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700 focus:border-[#0090C1]" placeholder="State" />
                                <input name="zone" required defaultValue={editingUser?.address?.zone} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700 focus:border-[#0090C1]" placeholder="Zone" />
                                <input name="woreda" required defaultValue={editingUser?.address?.woreda} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-slate-700 focus:border-[#0090C1]" placeholder="Woreda" />
                            </div>
                        </div>

                        {/* Role Specific Section - Student */}
                        {role === 'Student' && (
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <GraduationCap size={14} /> Academic Profile
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Grade</label>
                                        <input name="currentGrade" defaultValue={editingUser?.currentGrade} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700" placeholder="e.g. Grade 12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                        <select name="department" defaultValue={editingUser?.department || 'Natural Science'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                        <option>Natural Science</option>
                                        <option>Social Science</option>
                                        </select>
                                    </div>
                                </div>
                                {!editingUser && (
                                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                                        <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Payment Link Automation</p>
                                            <p className="text-xs text-amber-600/80 mt-1 font-medium leading-relaxed">
                                                Upon saving, the system will automatically generate a tuition payment link and send it via Email/SMS to the student.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Role Specific Section - Teacher / Employee */}
                        {role === 'Teacher' && (
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-[#0090C1] uppercase tracking-[0.2em] border-b border-slate-100 pb-3 flex items-center gap-2">
                                    <Briefcase size={14} /> Professional Assignment
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualification</label>
                                        <select name="qualification" defaultValue={editingUser?.qualification || 'BSc/BA'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                        <option>Diploma</option>
                                        <option>BSc/BA</option>
                                        <option>MSc/MA</option>
                                        <option>PhD</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Type</label>
                                        <select name="employmentType" defaultValue={editingUser?.employmentType || 'Full-time'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                        <select name="department" defaultValue={editingUser?.department || 'Natural Science'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                        <option>Computer Science</option>
                                        <option>Natural Science</option>
                                        <option>Social Science</option>
                                        <option>Languages</option>
                                        <option>Agriculture</option>
                                        <option>Business</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Campus</label>
                                    <select name="campusId" defaultValue={editingUser?.campusId} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                        <option value="">Select Campus...</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    {/* Grade Assignment */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={12} /> Assign Grades/Levels</label>
                                        <div className="p-6 border border-slate-100 rounded-[2rem] bg-slate-50 h-40 overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-2 gap-3">
                                                {[...ACADEMIC_GRADES, ...TVET_LEVELS].map(grade => (
                                                    <label key={grade} className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 bg-white p-2 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-[#0090C1]">
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
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><BookOpen size={12} /> Assign Subjects</label>
                                        <div className="p-4 border border-slate-100 rounded-[2rem] bg-slate-50 h-40 flex flex-col gap-3">
                                            <div className="flex-1 flex flex-wrap content-start gap-2 overflow-y-auto mb-2 custom-scrollbar">
                                                {assignedSubjects.map(sub => (
                                                    <span key={sub} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-sky-700 text-[10px] font-black rounded-lg border border-sky-100 shadow-sm">
                                                        {sub} <X size={12} className="cursor-pointer hover:text-rose-500 transition-colors" onClick={() => removeSubject(sub)} />
                                                    </span>
                                                ))}
                                                {assignedSubjects.length === 0 && <span className="text-xs text-slate-400 font-bold italic p-2">No subjects assigned.</span>}
                                            </div>
                                            <input 
                                                value={inputSubject}
                                                onChange={(e) => setInputSubject(e.target.value)}
                                                onKeyDown={addSubject}
                                                placeholder="Type Subject & Enter..." 
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-[#0090C1] transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                            <select name="status" defaultValue={editingUser?.status || 'Active'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0090C1] transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex gap-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white text-slate-500 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Cancel</button>
                        <button type="submit" disabled={isProcessing} className="flex-[2] py-5 bg-[#0090C1] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007ba6] shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                            {isProcessing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Processing...
                                </>
                            ) : (
                                editingUser ? 'Update Record' : 'Register & Notify'
                            )}
                        </button>
                    </div>
                    </form>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
