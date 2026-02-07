
import { User, School, Course, Exam, StudentAcademicRecord, SubjectGrade, Material, NewsPost, PaymentTransaction, Announcement, InstitutionalBranding } from '../types';

// INCREMENT THIS VERSION TO FORCE A RESET OF SEED DATA ON USER BROWSERS
const DB_VERSION = '1.9'; 
const STORAGE_KEYS = {
  VERSION: 'iftu_db_version',
  USERS: 'iftu_db_users',
  SCHOOLS: 'iftu_db_schools',
  COURSES: 'iftu_db_courses',
  EXAMS: 'iftu_db_exams',
  RESULTS: 'iftu_db_results',
  ACADEMIC_RECORDS: 'iftu_db_academic_records',
  MATERIALS: 'iftu_db_materials',
  NEWS: 'iftu_db_news',
  ANNOUNCEMENTS: 'iftu_db_announcements',
  PAYMENTS: 'iftu_db_payments',
  BRANDING: 'iftu_db_branding'
};

const DEFAULT_BRANDING: InstitutionalBranding = {
  bureauName: 'Oromia Education Bureau',
  bureauNameLocal: 'Biiroo Barnoota Oromiyaa',
  zoneName: 'West Arsi Zone',
  zoneNameLocal: 'Godina Arsii Lixaa',
  woredaName: 'Kore Woreda',
  woredaNameLocal: 'Aanaa Koree',
  schoolName: 'IFTU SECONDARY SCHOOL',
  schoolNameLocal: 'M.B. Sad. 2ffaa IFTU',
  academicYear: '2018 E.C.',
  themeColor: '#0090C1'
};

// ================= USER SEEDS (Expanded for realistic Gradebook) =================
const FIRST_NAMES = ['Abdisa', 'Chaltu', 'Obsa', 'Tolera', 'Bekele', 'Merga', 'Taye', 'Genet', 'Ayana', 'Birtukan'];
const LAST_NAMES = ['Haji', 'Fano', 'Tufa', 'Guta', 'Kebede', 'Girma', 'Dadi', 'Lemi', 'Negash', 'Sori'];

const SEED_USERS: User[] = Array.from({ length: 60 }).map((_, i) => {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[Math.floor(i / 6) % LAST_NAMES.length];
  const role = i < 5 ? 'Teacher' : 'Student';
  
  // Distribute students across grades 9-12
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const grade = role === 'Student' ? grades[(i - 5) % 4] : undefined;
  
  return {
    id: `U${100 + i}`,
    name: `${fName} ${lName} ${i + 1}`,
    email: `${role.toLowerCase()}${i}@iftu.edu`,
    role: role as 'Teacher' | 'Student' | 'Admin',
    status: 'Active',
    joinDate: 'Sept 01, 2018 (E.C.)',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    department: (i % 2 === 0 || grade === 'Grade 9' || grade === 'Grade 10') ? 'Natural Science' : 'Social Science',
    phone: `+251 911 000 ${100 + i}`,
    nationalId: `ETH-ID-${89000 + i}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    birthday: '2009-05-15', 
    motherName: 'Genet Ayele',
    address: {
      country: 'Ethiopia',
      state: 'Oromia',
      zone: 'West Arsi',
      woreda: 'Kore'
    },
    currentGrade: grade,
    promotedGrade: 'Grade 8',
    campusId: 'S1',
    assignedSubjects: role === 'Teacher' ? ['AMHARIC', 'MATHEMATICS', 'IT'] : undefined,
    assignedGrades: role === 'Teacher' ? ['Grade 9', 'Grade 10'] : undefined,
  };
});

// ================= SCHOOL SEEDS =================
const SEED_SCHOOLS: School[] = [
  { 
    id: 'S1', 
    name: 'IFTU Secondary School', 
    location: 'Shashemene, Oromia', 
    students: 1200, 
    phone: '+251 911 223344', 
    web: 'iftu.edu.et', 
    type: 'Central',
    principal: 'Jemal Fano Haji',
    established: '2010',
    image: 'https://images.unsplash.com/photo-1523050335392-93851179ae22?auto=format&fit=crop&q=80&w=800',
    programs: ['Grade 9-12', 'Natural Science', 'Social Science']
  }
];

// ================= COURSE SEEDS =================
const SEED_COURSES: Course[] = [
  { 
    id: 'it-g9', 
    title: 'Information Technology (IT)', 
    instructor: 'Abdisa Tolera', 
    students: 150, 
    progress: 82, 
    category: 'Natural Science', 
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400', 
    campusId: 'S1', 
    duration: 'Grade 9',
    description: 'Introduction to computer systems.',
    curriculum: []
  },
  { 
    id: 'mat-g9', 
    title: 'Mathematics', 
    instructor: 'Abdisa Tolera', 
    students: 150, 
    progress: 74, 
    category: 'Natural Science', 
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400', 
    campusId: 'S1', 
    duration: 'Grade 9'
  }
];

// ================= EXAM SEEDS =================
const SEED_EXAMS: Exam[] = [
  { 
    id: 'ex-it-1', title: 'IT Unit 1 & 2 Test', courseTitle: 'Information Technology (Grade 9)', courseId: 'it-g9', 
    teacherId: 'U100', date: '2018-03-15', duration: '45 mins', totalQuestions: 15, status: 'Upcoming' 
  }
];

// ================= MATERIAL SEEDS =================
const SEED_MATERIALS: Material[] = [
  { id: 'it-manual', title: 'Grade 9 IT Student Textbook.pdf', type: 'Document', courseTitle: 'Information Technology (Grade 9)', uploadDate: '2018-01-10', size: '15.2 MB', author: 'Ministry of Education' }
];

// ================= NEWS SEEDS =================
const SEED_NEWS: NewsPost[] = [
  { id: 'n1', title: '2018 Academic Year Launch', content: 'Welcome to the 2018 Ethiopian Calendar academic year at IFTU.', date: '2018-01-01', author: 'Jemal Fano', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800', category: 'Institutional' }
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'IT Lab Schedule', content: 'Grade 9 IT students have lab sessions every Tuesday.', date: '2018-01-05', priority: 'High' }
];

// ================= PAYMENT SEEDS =================
const SEED_PAYMENTS: PaymentTransaction[] = [
  { id: 'tx1', date: '2018-01-01', description: 'Registration Fee - 2018 E.C.', amount: 500, method: 'System', status: 'Completed', type: 'Debit' }
];

// ================= TRANSCRIPT SEEDS =================
const SEED_ACADEMIC_RECORDS: StudentAcademicRecord[] = [
  {
    studentId: 'U101', 
    subjects: {
      'IT': { sem1: 88, sem2: 92 },
      'MATHEMATICS': { sem1: 85, sem2: 80 },
      'ENGLISH': { sem1: 90, sem2: 88 },
      'AFAAN OROMOO': { sem1: 92, sem2: 94 }
    }
  }
];

const TRANSCRIPT_SUBJECTS = [
  'AFAAN OROMOO', 'AMHARIC', 'ENGLISH', 'MATHEMATICS',
  'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
  'GEOGRAPHY', 'HISTORY',
  'CIVICS', 'IT', 'HPE'
];

export const db = {
  _get: <T>(key: string, seed: T[]): T[] => {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion !== DB_VERSION) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(SEED_SCHOOLS));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(SEED_EXAMS));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(SEED_NEWS));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_RECORDS, JSON.stringify(SEED_ACADEMIC_RECORDS));
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(DEFAULT_BRANDING));
      localStorage.setItem(STORAGE_KEYS.VERSION, DB_VERSION);
    }

    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  },
  _set: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getBranding: (): InstitutionalBranding => {
    const data = localStorage.getItem(STORAGE_KEYS.BRANDING);
    return data ? JSON.parse(data) : DEFAULT_BRANDING;
  },
  saveBranding: (branding: InstitutionalBranding) => {
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
  },

  getUsers: () => db._get<User>(STORAGE_KEYS.USERS, SEED_USERS),
  saveUser: (user: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user;
    else users.unshift(user);
    db._set(STORAGE_KEYS.USERS, users);
  },
  deleteUser: (id: string) => {
    const users = db.getUsers().filter(u => u.id !== id);
    db._set(STORAGE_KEYS.USERS, users);
  },

  getSchools: () => db._get<School>(STORAGE_KEYS.SCHOOLS, SEED_SCHOOLS),
  saveSchool: (school: School) => {
    const schools = db.getSchools();
    const index = schools.findIndex(s => s.id === school.id);
    if (index > -1) schools[index] = school;
    else schools.unshift(school);
    db._set(STORAGE_KEYS.SCHOOLS, schools);
  },
  deleteSchool: (id: string) => {
    const schools = db.getSchools().filter(s => s.id !== id);
    db._set(STORAGE_KEYS.SCHOOLS, schools);
  },

  getCourses: () => db._get<Course>(STORAGE_KEYS.COURSES, SEED_COURSES),
  saveCourse: (course: Course) => {
    const courses = db.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index > -1) courses[index] = course;
    else courses.unshift(course);
    db._set(STORAGE_KEYS.COURSES, courses);
  },

  getExams: () => db._get<Exam>(STORAGE_KEYS.EXAMS, SEED_EXAMS),
  saveExam: (exam: Exam) => {
    const exams = db.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    if (index > -1) exams[index] = exam;
    else exams.unshift(exam);
    db._set(STORAGE_KEYS.EXAMS, exams);
  },
  deleteExam: (id: string) => {
    const exams = db.getExams().filter(e => e.id !== id);
    db._set(STORAGE_KEYS.EXAMS, exams);
  },

  getMaterials: () => db._get<Material>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS),
  saveMaterial: (item: Material) => {
    const items = db.getMaterials();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) items[index] = item;
    else items.unshift(item);
    db._set(STORAGE_KEYS.MATERIALS, items);
  },
  deleteMaterial: (id: string) => {
    const items = db.getMaterials().filter(i => i.id !== id);
    db._set(STORAGE_KEYS.MATERIALS, items);
  },

  getNews: () => db._get<NewsPost>(STORAGE_KEYS.NEWS, SEED_NEWS),
  saveNews: (item: NewsPost) => {
    const items = db.getNews();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) items[index] = item;
    else items.unshift(item);
    db._set(STORAGE_KEYS.NEWS, items);
  },
  getAnnouncements: () => db._get<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS),

  getPayments: () => db._get<PaymentTransaction>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS),
  savePayment: (item: PaymentTransaction) => {
    const items = db.getPayments();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) items[index] = item;
    else items.unshift(item);
    db._set(STORAGE_KEYS.PAYMENTS, items);
  },

  getAcademicRecords: () => db._get<StudentAcademicRecord>(STORAGE_KEYS.ACADEMIC_RECORDS, SEED_ACADEMIC_RECORDS),
  
  ensureStudentHistory: (studentId: string, studentName: string): StudentAcademicRecord => {
    const records = db.getAcademicRecords();
    let record = records.find(r => r.studentId === studentId);

    if (!record) {
      record = { studentId, subjects: {}, previousGrades: {} };
      records.push(record);
    }

    if (!record.previousGrades) {
      record.previousGrades = {};
    }

    [9, 10, 11].forEach(gradeLevel => {
      if (!record!.previousGrades![gradeLevel]) {
        record!.previousGrades![gradeLevel] = {};
        TRANSCRIPT_SUBJECTS.forEach(subject => {
           const seed = subject.charCodeAt(0) + (studentName.length) + gradeLevel;
           const base = 70 + (seed % 25);
           const s1 = Math.min(100, base + (seed % 5));
           const s2 = Math.min(100, base - (seed % 3));
           record!.previousGrades![gradeLevel][subject] = { sem1: s1, sem2: s2 };
        });
      }
    });

    db._set(STORAGE_KEYS.ACADEMIC_RECORDS, records);
    return record;
  },

  saveStudentGrade: (studentId: string, subject: string, type: 'sem1' | 'sem2', score: number) => {
    const records = db.getAcademicRecords();
    let record = records.find(r => r.studentId === studentId);
    
    if (!record) {
      record = { studentId, subjects: {}, previousGrades: {} };
      records.push(record);
    }

    if (!record.subjects[subject]) {
      record.subjects[subject] = { sem1: 0, sem2: 0 };
    }

    record.subjects[subject][type] = score;
    db._set(STORAGE_KEYS.ACADEMIC_RECORDS, records);
  },

  getSystemStats: () => {
    const users = db.getUsers();
    const courses = db.getCourses();
    const schools = db.getSchools();
    return {
      totalUsers: users.length,
      teachers: users.filter(u => u.role === 'Teacher').length,
      students: users.filter(u => u.role === 'Student').length,
      campuses: schools.length,
      subjects: courses.length,
      totalEnrollment: schools.reduce((acc, s) => acc + s.students, 0),
      lastSync: new Date().toLocaleTimeString(),
      storageUsage: (JSON.stringify(localStorage).length / 1024).toFixed(2) + ' KB'
    };
  }
};
