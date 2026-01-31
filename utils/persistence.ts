
import { User, School, Course, Exam, StudentAcademicRecord, SubjectGrade, Material, NewsPost, PaymentTransaction, Announcement } from '../types';

// INCREMENT THIS VERSION TO FORCE A RESET OF SEED DATA ON USER BROWSERS
const DB_VERSION = '1.5'; 
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
  PAYMENTS: 'iftu_db_payments'
};

// ================= USER SEEDS =================
const SEED_USERS: User[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `U${100 + i}`,
  name: i % 3 === 0 ? `Alex Morgan ${i}` : i % 3 === 1 ? `Elena Smith ${i}` : `David O'Connell ${i}`,
  email: `user${i}@iftu.edu`,
  role: i % 2 === 0 ? 'Teacher' : 'Student',
  status: i === 3 || i === 7 ? 'Inactive' : 'Active',
  joinDate: 'Oct 12, 2024',
  avatar: `https://picsum.photos/seed/user${i}/100/100`,
  department: i % 3 === 0 ? 'Computer Science' : i % 3 === 1 ? 'Physics' : 'Literature',
  phone: `+251 911 000 ${100 + i}`,
  nationalId: `ETH-ID-${89000 + i}`,
  gender: i % 2 === 0 ? 'Male' : 'Female',
  birthday: '2005-01-15',
  motherName: 'Mother Name Placeholder',
  address: {
    country: 'Ethiopia',
    state: 'Oromia',
    zone: 'West Arsi',
    woreda: 'Kore'
  },
  // Student Specific
  currentGrade: i % 2 !== 0 ? 'Grade 12' : undefined,
  promotedGrade: i % 2 !== 0 ? 'Grade 11' : undefined,
  // Teacher Specific
  qualification: i % 2 === 0 ? 'MSc/MA' : undefined,
  employmentType: i % 2 === 0 ? 'Full-time' : undefined,
  campusId: i % 2 === 0 ? 'S1' : undefined,
  assignedSubjects: i % 2 === 0 ? ['Mathematics', 'Physics'] : undefined,
  assignedGrades: i % 2 === 0 ? ['Grade 11', 'Grade 12'] : undefined,
}));

// ================= SCHOOL SEEDS =================
const SEED_SCHOOLS: School[] = [
  { 
    id: 'S1', 
    name: 'IFTU Central Campus', 
    location: 'Shashemene, Oromia', 
    students: 4500, 
    phone: '+251 911 223344', 
    web: 'central.iftu.edu.et', 
    type: 'Central',
    principal: 'Dr. Gadaa B.',
    established: '1998',
    image: 'https://picsum.photos/seed/school1/800/400',
    programs: ['Grade 9-12', 'Natural Science', 'Social Science']
  },
  { 
    id: 'S2', 
    name: 'IFTU Kofele Branch', 
    location: 'Kofele, West Arsi', 
    students: 2800, 
    phone: '+251 911 556677', 
    web: 'kofele.iftu.edu.et', 
    type: 'Branch',
    principal: 'Mr. Ahmed T.',
    established: '2005',
    image: 'https://picsum.photos/seed/school2/800/400',
    programs: ['Grade 9-10 General', 'Adult Education']
  },
  { 
    id: 'S3', 
    name: 'IFTU Technical & Vocational Training Institute', 
    location: 'Addis Ababa, Bole', 
    students: 1200, 
    phone: '+251 911 889900', 
    web: 'tvet.iftu.edu.et', 
    type: 'Vocational',
    principal: 'Ms. Sena J.',
    established: '2019',
    image: 'https://picsum.photos/seed/school3/800/400',
    programs: ['IT Level 1-4', 'Accounting Level 1-4', 'Design Level 1-4', 'HRM Level 1-4']
  },
  { 
    id: 'S4', 
    name: 'IFTU Online Academy', 
    location: 'Global / Remote', 
    students: 12400, 
    phone: '+251 911 001122', 
    web: 'academy.iftu.edu', 
    type: 'Online',
    principal: 'Tech Lead Jemal',
    established: '2023',
    image: 'https://picsum.photos/seed/school4/800/400',
    programs: ['Distance Learning', 'Short Courses']
  },
];

// ================= COURSE SEEDS =================
const SEED_COURSES: Course[] = [
  // General Education (Assigned to Central Campus S1)
  { 
    id: 'sub1', 
    title: 'Mathematics', 
    instructor: 'Mr. Abebe Kebede', 
    students: 450, 
    progress: 75, 
    category: 'Natural Science', 
    image: 'https://picsum.photos/seed/math/400/200', 
    campusId: 'S1', 
    duration: 'Grade 9',
    objectives: ['Master algebraic expressions', 'Understand geometric properties', 'Solve quadratic equations'],
    curriculum: [
      { id: 'm1', title: 'Module 1: Number Systems', lessons: ['Natural Numbers', 'Integers', 'Rational Numbers'] },
      { id: 'm2', title: 'Module 2: Algebra', lessons: ['Variables & Expressions', 'Linear Equations', 'Polynomials'] },
      { id: 'm3', title: 'Module 3: Geometry', lessons: ['Points & Lines', 'Triangles', 'Circle Properties'] }
    ]
  },
  { 
    id: 'sub2', 
    title: 'Physics', 
    instructor: 'Dr. Sarah Johnson', 
    students: 320, 
    progress: 60, 
    category: 'Natural Science', 
    image: 'https://picsum.photos/seed/physics/400/200', 
    campusId: 'S1', 
    duration: 'Grade 10',
    objectives: ['Analyze motion and forces', 'Understand energy conservation', 'Introduction to electricity'],
    curriculum: [
      { id: 'm1', title: 'Unit 1: Kinematics', lessons: ['Displacement & Velocity', 'Acceleration', 'Free Fall'] },
      { id: 'm2', title: 'Unit 2: Dynamics', lessons: ['Newtons Laws', 'Friction', 'Circular Motion'] },
      { id: 'm3', title: 'Unit 3: Energy', lessons: ['Work & Power', 'Kinetic Energy', 'Potential Energy'] }
    ]
  },
  
  // ================= TVET - Information Technology (Level 1-4) =================
  { id: 'tv-it-l1', title: 'IT Support (Level 1)', instructor: 'Inst. Daniel', students: 150, progress: 85, category: 'Technology', image: 'https://picsum.photos/seed/tvetit1/400/200', duration: 'Level 1', campusId: 'S3', description: 'Fundamentals of computer hardware, operating systems, and basic network troubleshooting.' },
  { id: 'tv-it-l2', title: 'Database Admin (Level 2)', instructor: 'Inst. Daniel', students: 120, progress: 80, category: 'Technology', image: 'https://picsum.photos/seed/tvetit2/400/200', duration: 'Level 2', campusId: 'S3', description: 'Introduction to SQL, database design, and administration.' },
  { id: 'tv-it-l3', title: 'Web Development (Level 3)', instructor: 'Inst. Sara', students: 100, progress: 78, category: 'Technology', image: 'https://picsum.photos/seed/tvetit3/400/200', duration: 'Level 3', campusId: 'S3', description: 'Building dynamic websites using HTML, CSS, JavaScript, and React.' },
  { id: 'tv-it-l4', title: 'Network Management (Level 4)', instructor: 'Inst. Jemal', students: 80, progress: 75, category: 'Technology', image: 'https://picsum.photos/seed/tvetit4/400/200', duration: 'Level 4', campusId: 'S3', description: 'Advanced networking concepts, routing, switching, and security.' },

  // ================= TVET - Accounting & Finance (Level 1-4) =================
  { id: 'tv-acc-l1', title: 'Basic Clerical Works (Level 1)', instructor: 'Inst. Bereket', students: 180, progress: 80, category: 'Business', image: 'https://picsum.photos/seed/acc1/400/200', duration: 'Level 1', campusId: 'S3', description: 'Introduction to office procedures, basic numeracy, and record keeping.' },
  { id: 'tv-acc-l2', title: 'Bookkeeping & Accounts (Level 2)', instructor: 'Inst. Bereket', students: 160, progress: 82, category: 'Business', image: 'https://picsum.photos/seed/acc2/400/200', duration: 'Level 2', campusId: 'S3', description: 'Double-entry bookkeeping, journals, ledgers, and trial balance preparation.' },
  { id: 'tv-acc-l3', title: 'Financial Accounting (Level 3)', instructor: 'Inst. Bereket', students: 200, progress: 82, category: 'Business', image: 'https://picsum.photos/seed/tvetacc/400/200', duration: 'Level 3', campusId: 'S3', description: 'Financial accounting principles, reporting standards, and partnership accounts.' },
  { id: 'tv-acc-l4', title: 'Auditing & Taxation (Level 4)', instructor: 'Inst. Bereket', students: 140, progress: 85, category: 'Business', image: 'https://picsum.photos/seed/acc4/400/200', duration: 'Level 4', campusId: 'S3', description: 'Advanced financial management, auditing principles, and Ethiopian tax systems.' },

  // ================= TVET - Drawing & Design (Level 1-4) =================
  { id: 'tv-draw-l1', title: 'Drafting Fundamentals (Level 1)', instructor: 'Inst. Tadesse', students: 100, progress: 85, category: 'Engineering', image: 'https://picsum.photos/seed/draw1/400/200', duration: 'Level 1', campusId: 'S3', description: 'Basic sketching, geometric construction, and lettering techniques.' },
  { id: 'tv-draw-l2', title: 'Technical Drawing (Level 2)', instructor: 'Inst. Tadesse', students: 90, progress: 88, category: 'Engineering', image: 'https://picsum.photos/seed/tvetdraw/400/200', duration: 'Level 2', campusId: 'S3', description: 'Orthographic projection, isometric drawing, and sectional views.' },
  { id: 'tv-draw-l3', title: 'CAD & Modeling (Level 3)', instructor: 'Inst. Tadesse', students: 80, progress: 90, category: 'Engineering', image: 'https://picsum.photos/seed/draw3/400/200', duration: 'Level 3', campusId: 'S3', description: 'Computer-Aided Design (AutoCAD), 2D drafting, and basic 3D modeling.' },
  { id: 'tv-draw-l4', title: 'Architectural Design (Level 4)', instructor: 'Inst. Tadesse', students: 60, progress: 92, category: 'Engineering', image: 'https://picsum.photos/seed/draw4/400/200', duration: 'Level 4', campusId: 'S3', description: 'Building design, structural detailing, and advanced architectural projects.' },

  // ================= TVET - Human Resources Management (Level 1-4) =================
  { id: 'tv-hrm-l1', title: 'Office Administration (Level 1)', instructor: 'Inst. Lemlem', students: 120, progress: 80, category: 'Business', image: 'https://picsum.photos/seed/hrm1/400/200', duration: 'Level 1', campusId: 'S3', description: 'Front desk operations, filing systems, and workplace communication.' },
  { id: 'tv-hrm-l2', title: 'Personnel Records (Level 2)', instructor: 'Inst. Lemlem', students: 110, progress: 82, category: 'Business', image: 'https://picsum.photos/seed/hrm2/400/200', duration: 'Level 2', campusId: 'S3', description: 'Maintaining employee databases, leave management, and record confidentiality.' },
  { id: 'tv-hrm-l3', title: 'Recruitment & Selection (Level 3)', instructor: 'Inst. Lemlem', students: 100, progress: 84, category: 'Business', image: 'https://picsum.photos/seed/hrm3/400/200', duration: 'Level 3', campusId: 'S3', description: 'Job analysis, advertising vacancies, interviewing techniques, and onboarding.' },
  { id: 'tv-hrm-l4', title: 'HR Management (Level 4)', instructor: 'Inst. Lemlem', students: 110, progress: 85, category: 'Business', image: 'https://picsum.photos/seed/tvethrm/400/200', duration: 'Level 4', campusId: 'S3', description: 'Strategic HR planning, labor laws, performance appraisal systems, and conflict resolution.' }
];

// ================= EXAM SEEDS =================
const SEED_EXAMS: Exam[] = [
  { 
    id: 'ex1', title: 'Midterm Physics', courseTitle: 'Physics (Grade 11)', courseId: 'sub2', 
    teacherId: 'U100', date: '2024-11-20', duration: '90 mins', totalQuestions: 20, status: 'Active' 
  }
];

// ================= MATERIAL SEEDS =================
const SEED_MATERIALS: Material[] = [
  { id: 'it-g9', title: 'Information Technology Grade 9 - Units 1-6.pdf', type: 'Document', courseTitle: 'IT (Grade 9)', uploadDate: '2024-11-15', size: '12.5 MB', author: 'Ministry of Education' },
  { id: 'it-g10', title: 'Information Technology Grade 10 - Textbook.docx', type: 'Document', courseTitle: 'IT (Grade 10)', uploadDate: '2024-11-15', size: '8.2 MB', author: 'Curriculum Dept' },
  { id: 'it-g11', title: 'Information Technology Grade 11 - Units 1-6.pdf', type: 'Document', courseTitle: 'IT (Grade 11)', uploadDate: '2024-11-16', size: '14.1 MB', author: 'Ministry of Education' },
  { id: 'it-g12', title: 'Information Technology Grade 12 - Entrance Prep & Units 1-6.pdf', type: 'Document', courseTitle: 'IT (Grade 12)', uploadDate: '2024-11-16', size: '15.3 MB', author: 'Ministry of Education' },
  { id: 'm1', title: 'Grade 9 Algebra Formulas.pdf', type: 'Document', courseTitle: 'Mathematics (Grade 9)', uploadDate: '2024-10-25', size: '1.4 MB', author: 'Mr. Abebe Kebede' },
  { id: 'm2', title: 'Safety in the Chemistry Lab', type: 'Video', courseTitle: 'Chemistry (Grade 11)', uploadDate: '2024-10-28', size: '145 MB', author: 'Ms. Tigist Haile' },
  { id: 'm4', title: 'Calculus Limits Practice', type: 'Link', courseTitle: 'Mathematics (Grade 12)', uploadDate: '2024-11-05', author: 'Mr. Abebe Kebede' },
];

// ================= NEWS SEEDS =================
const SEED_NEWS: NewsPost[] = [
  { id: 'n1', title: 'IFTU Global Summit 2024 Announced', content: 'We are thrilled to announce the upcoming Global Summit focused on "The Future of AI in Pedagogy".', date: '2024-11-10', author: 'Admin Office', image: 'https://picsum.photos/seed/summit/800/400', category: 'Event', hasRegistration: true, registrationCount: 142, attachment: 'Summit_Agenda_v2.pdf' },
  { id: 'n2', title: 'Fall 2024 Teacher Recruitment Drive', content: 'Applications are now open for Senior Lecturers in Computer Science and Physics.', date: '2024-11-09', author: 'HR Dept', image: 'https://picsum.photos/seed/recruit/800/400', category: 'Recruitment', hasRegistration: true, registrationCount: 45, attachment: 'Job_Descriptions_2024.pdf' },
  { id: 'n3', title: 'Employee Wellness Program Launch', content: 'A new initiative to support mental and physical health for all staff members.', date: '2024-11-08', author: 'Human Resources', image: 'https://picsum.photos/seed/wellness/800/400', category: 'HR', hasRegistration: true, registrationCount: 89 },
  { id: 'n4', title: 'Platform Maintenance Scheduled', content: 'Routine server maintenance will take place this Sunday.', date: '2024-11-07', author: 'IT Dept', image: 'https://picsum.photos/seed/tech/800/400', category: 'Update' }
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Winter Break Schedule', content: 'Offices will be closed from Dec 20 to Jan 5.', date: '2024-11-01', priority: 'Medium' },
  { id: 'a2', title: 'Security Alert: Phishing Attempts', content: 'Be cautious of emails asking for your IFTU credentials.', date: '2024-11-05', priority: 'High' }
];

// ================= PAYMENT SEEDS =================
const SEED_PAYMENTS: PaymentTransaction[] = [
  { id: 'tx1', date: '2024-11-01', description: 'Tuition Fee - Semester 1', amount: 12000, method: 'System', status: 'Completed', type: 'Debit' },
  { id: 'tx2', date: '2024-11-02', description: 'Payment via Telebirr', amount: 5000, method: 'Telebirr', status: 'Completed', type: 'Credit' },
  { id: 'tx3', date: '2024-11-05', description: 'Lab Material Fee', amount: 1500, method: 'System', status: 'Pending', type: 'Debit' },
];

// ================= TRANSCRIPT SEEDS =================
const SEED_ACADEMIC_RECORDS: StudentAcademicRecord[] = [
  {
    studentId: 'U101', // Elena Smith
    subjects: {
      'MATHEMATICS': { sem1: 85, sem2: 92 },
      'PHYSICS': { sem1: 78, sem2: 88 },
      'ENGLISH': { sem1: 90, sem2: 95 }
    }
  },
  {
    studentId: 'U103', // Alex Morgan
    subjects: {
      'MATHEMATICS': { sem1: 65, sem2: 70 },
      'PHYSICS': { sem1: 60, sem2: 65 },
      'ENGLISH': { sem1: 80, sem2: 82 }
    }
  }
];

const TRANSCRIPT_SUBJECTS = [
  'AFAAN OROMOO', 'AMHARIC', 'ENGLISH', 'MATHEMATICS',
  'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
  'GEOGRAPHY', 'HISTORY',
  'CIVICS', 'IT', 'HPE',
  'ECONOMICS', 'GENERAL BUSINESS', 'TECHNICAL DRAWING'
];

export const db = {
  // Generic Read/Write with Version Check
  _get: <T>(key: string, seed: T[]): T[] => {
    // Version Migration Logic
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion !== DB_VERSION) {
      // Version mismatch: Reset critical seeds to ensure new structure availability
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(SEED_COURSES));
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(SEED_SCHOOLS));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(SEED_EXAMS));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(SEED_NEWS));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
      // Update version
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

  // Users
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

  // Schools
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

  // Courses
  getCourses: () => db._get<Course>(STORAGE_KEYS.COURSES, SEED_COURSES),
  saveCourse: (course: Course) => {
    const courses = db.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index > -1) courses[index] = course;
    else courses.unshift(course);
    db._set(STORAGE_KEYS.COURSES, courses);
  },

  // Exams
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

  // Materials
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

  // News
  getNews: () => db._get<NewsPost>(STORAGE_KEYS.NEWS, SEED_NEWS),
  saveNews: (item: NewsPost) => {
    const items = db.getNews();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) items[index] = item;
    else items.unshift(item);
    db._set(STORAGE_KEYS.NEWS, items);
  },
  getAnnouncements: () => db._get<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS),

  // Payments
  getPayments: () => db._get<PaymentTransaction>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS),
  savePayment: (item: PaymentTransaction) => {
    const items = db.getPayments();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) items[index] = item;
    else items.unshift(item);
    db._set(STORAGE_KEYS.PAYMENTS, items);
  },

  // Academic Records (Transcript)
  getAcademicRecords: () => db._get<StudentAcademicRecord>(STORAGE_KEYS.ACADEMIC_RECORDS, SEED_ACADEMIC_RECORDS),
  
  getStudentGrades: (studentId: string): StudentAcademicRecord | undefined => {
    const records = db.getAcademicRecords();
    return records.find(r => r.studentId === studentId);
  },

  // Ensures historical grades (9, 10, 11) exist and freeze them.
  ensureStudentHistory: (studentId: string, studentName: string): StudentAcademicRecord => {
    const records = db.getAcademicRecords();
    let record = records.find(r => r.studentId === studentId);

    // If record doesn't exist at all, create it
    if (!record) {
      record = { studentId, subjects: {}, previousGrades: {} };
      records.push(record);
    }

    // Initialize previousGrades container if missing
    if (!record.previousGrades) {
      record.previousGrades = {};
    }

    // Check and generate for G9, G10, G11 if missing
    [9, 10, 11].forEach(gradeLevel => {
      if (!record!.previousGrades![gradeLevel]) {
        record!.previousGrades![gradeLevel] = {};
        
        TRANSCRIPT_SUBJECTS.forEach(subject => {
           // Seed logic: Deterministic based on name+subject+grade
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

  // System Stats
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
