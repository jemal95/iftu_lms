
import React, { useState } from 'react';
import { 
  Book, 
  ChevronLeft, 
  GraduationCap, 
  Layout, 
  Users, 
  Shield, 
  Zap, 
  Sparkles, 
  Download, 
  Loader2,
  CheckCircle2,
  FileText,
  Info,
  ExternalLink,
  ShieldCheck,
  Video,
  MonitorPlay,
  Settings,
  CreditCard,
  PenTool,
  Wand2,
  Search
} from 'lucide-react';
import { Signature } from './Signature';

interface DocumentationViewProps {
  onBack: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'General' | 'Student' | 'Teacher' | 'Admin'>('General');

  const handleDownloadGuide = async () => {
    setIsGenerating(true);
    const element = document.getElementById('guidance-document');
    
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0.3, 0.3],
        filename: 'IFTU_LMS_Official_User_Manual.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      try {
        await (window as any).html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Could not generate PDF Guide.");
      }
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl text-gray-500 transition-all shadow-sm hover:shadow-md"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">User Manual & Guide</h2>
            <p className="text-sm text-gray-500 font-medium">Official instructions for Students, Teachers, and Administrators.</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadGuide}
          disabled={isGenerating}
          className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all disabled:opacity-75 flex-shrink-0"
        >
          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          {isGenerating ? 'Compiling PDF...' : 'Download Full Manual (PDF)'}
        </button>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm w-fit">
        {(['General', 'Student', 'Teacher', 'Admin'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab} Guide
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* General Overview */}
          {activeTab === 'General' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
               <GuideCard 
                 title="Welcome to IFTU LMS" 
                 icon={<Zap size={24} className="text-amber-500" />}
                 steps={[
                   "IFTU LMS is a comprehensive platform for managing academic life.",
                   "Users log in with specific roles: Student, Teacher, or Administrator.",
                   "The sidebar allows navigation between Dashboard, Courses, Exams, and Reports.",
                   "Use the 'Language Settings' in Profile to switch between English and Afaan Oromoo."
                 ]}
               />
               <GuideCard 
                 title="Security & Access" 
                 icon={<ShieldCheck size={24} className="text-emerald-500" />}
                 steps={[
                   "Default passwords should be changed upon first login via the Profile > Security section.",
                   "Admins have full database access; Teachers have gradebook access; Students have read-only academic access.",
                   "Always log out when using public computers."
                 ]}
               />
            </div>
          )}

          {/* Student Guide */}
          {activeTab === 'Student' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
               <GuideCard 
                 title="How to Check Results & Transcripts" 
                 icon={<GraduationCap size={24} className="text-[#0090C1]" />}
                 steps={[
                   "Navigate to the 'My Results' tab to see recent exam scores.",
                   "Go to 'Academic Transcript' to generate your official grade report.",
                   "Click 'Download PDF' to save a copy of your transcript.",
                   "Use the 'Certificate' tab to download your High School Diploma or TVET Competency Certificate."
                 ]}
               />
               <GuideCard 
                 title="Using the AI Assistant" 
                 icon={<Sparkles size={24} className="text-purple-500" />}
                 steps={[
                   "Open 'AI Assistant' from the sidebar.",
                   "Ask questions like 'Summarize Physics Chapter 1' or 'Create a study plan'.",
                   "You can also ask the AI to draft formal letters or explain complex topics.",
                   "Use the Voice Mode (Microphone icon) for hands-free study help."
                 ]}
               />
            </div>
          )}

          {/* Teacher Guide */}
          {activeTab === 'Teacher' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
               <GuideCard 
                 title="Creating Courses & Syllabus" 
                 icon={<Book size={24} className="text-indigo-500" />}
                 steps={[
                   "Go to 'Subjects' and click 'New Subject'.",
                   "Fill in the Title and Grade Level.",
                   "**New Feature:** Click the 'Auto-Fill via Ethiopian Curriculum' button.",
                   "The AI will automatically generate the Units and Lessons according to the Ministry of Education standards.",
                   "Click 'Create Subject' to save."
                 ]}
               />
               <GuideCard 
                 title="Managing Grades" 
                 icon={<PenTool size={24} className="text-emerald-500" />}
                 steps={[
                   "Navigate to 'Gradebook'.",
                   "Select your Subject from the dropdown.",
                   "Enter Semester 1 and Semester 2 scores for each student.",
                   "Click 'Save to Transcript' to update the official records."
                 ]}
               />
            </div>
          )}

          {/* Admin Guide */}
          {activeTab === 'Admin' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
               <GuideCard 
                 title="Registering Students & Automating Payments" 
                 icon={<Users size={24} className="text-rose-500" />}
                 steps={[
                   "Go to 'Students' and click 'Add New Student'.",
                   "Fill in the personal details and upload a photo.",
                   "**Important:** Upon clicking 'Register & Notify', the system simulates a backend process.",
                   "An email and SMS are automatically generated containing:",
                   "1. The student's temporary password.",
                   "2. A direct payment link for tuition fees via Telebirr/CBE.",
                   "You will see a success confirmation with a preview of the sent messages."
                 ]}
               />
               <GuideCard 
                 title="Financial Reports" 
                 icon={<CreditCard size={24} className="text-slate-600" />}
                 steps={[
                   "Go to the 'Payments' section.",
                   "View the 'Outstanding Balance' for the institution.",
                   "Track incoming payments via Telebirr or CBE.",
                   "Export transaction histories to CSV for auditing."
                 ]}
               />
            </div>
          )}

        </div>

        {/* Quick Links / Help */}
        <div className="space-y-6">
           <div className="bg-[#0090C1] rounded-[2.5rem] p-8 text-white shadow-xl shadow-sky-500/20">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                 <Info size={28} />
              </div>
              <h3 className="text-2xl font-black">Need Help?</h3>
              <p className="text-sky-100 mt-2 text-sm leading-relaxed">
                If you encounter system errors or need password resets, contact the IT Department via the sidebar link.
              </p>
              <button className="mt-6 w-full py-3 bg-white text-[#0090C1] font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-sky-50 transition-all">
                Contact Support
              </button>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Video size={18} className="text-rose-500" /> Video Tutorials
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs font-medium text-slate-500 hover:text-rose-500 cursor-pointer transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><MonitorPlay size={14} /></div>
                  Getting Started for Students
                </li>
                <li className="flex items-center gap-3 text-xs font-medium text-slate-500 hover:text-rose-500 cursor-pointer transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><MonitorPlay size={14} /></div>
                  Teacher Gradebook Training
                </li>
                <li className="flex items-center gap-3 text-xs font-medium text-slate-500 hover:text-rose-500 cursor-pointer transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><MonitorPlay size={14} /></div>
                  Admin Dashboard Overview
                </li>
              </ul>
           </div>
        </div>
      </div>

      {/* HIDDEN DOCUMENT FOR PDF GENERATION */}
      <div className="hidden">
        <div id="guidance-document" className="p-10 font-sans text-slate-900 bg-white">
          <div className="border-b-4 border-[#0090C1] pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase">IFTU LMS</h1>
              <p className="text-lg font-medium text-slate-500 mt-2">Official User Manual & Operational Guide</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">Version 2.5</p>
              <p className="text-sm text-slate-500">Updated: Nov 2024</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-[#0090C1] mb-4 border-b border-slate-200 pb-2">1. Introduction</h2>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                Welcome to the IFTU Learning Management System. This document serves as the official guide for all users.
                The system is designed to streamline academic processes, from curriculum planning to grade reporting and financial management.
                It incorporates advanced AI features powered by Google Gemini to assist with content generation and analysis.
              </p>
            </section>

            {/* Student Section */}
            <section>
              <h2 className="text-2xl font-bold text-[#0090C1] mb-4 border-b border-slate-200 pb-2">2. Student Guide</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Accessing Academic Records</h3>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li><strong>Results:</strong> View your exam scores under the 'My Results' tab.</li>
                    <li><strong>Transcript:</strong> Generate an official transcript PDF from the 'Academic Transcript' section. This document includes the Oromia Education Bureau stamp.</li>
                    <li><strong>Certificate:</strong> Upon graduation, download your 'High School Diploma' or 'TVET Competency Certificate'.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Using AI Assistant</h3>
                  <p className="text-sm text-slate-700">
                    The 'AI Assistant' sidebar allows you to chat with a virtual tutor. Use it to:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 mt-1">
                    <li>Summarize difficult lecture notes.</li>
                    <li>Generate practice questions for upcoming exams.</li>
                    <li>Find explanations for complex topics in Natural or Social Sciences.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Teacher Section */}
            <section>
              <h2 className="text-2xl font-bold text-[#0090C1] mb-4 border-b border-slate-200 pb-2">3. Teacher Guide</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Curriculum & Syllabus</h3>
                  <p className="text-sm text-slate-700">
                    When creating a new subject (Sidebar > Subjects > New Subject), use the 
                    <strong> "Auto-Fill via Ethiopian Curriculum" </strong> button.
                  </p>
                  <p className="text-sm text-slate-700 mt-2">
                    This feature uses AI to instantly populate the course with the official Ministry of Education syllabus 
                    (Modules, Units, and Lessons) relevant to the chosen Grade Level.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Gradebook Management</h3>
                  <p className="text-sm text-slate-700">
                    Navigate to 'Gradebook' to enter student scores. The system automatically calculates:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 mt-1">
                    <li>Semester Averages.</li>
                    <li>Pass/Fail Status (based on 50% threshold).</li>
                    <li>Data entered here is immediately reflected on student Transcripts.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Admin Section */}
            <section>
              <h2 className="text-2xl font-bold text-[#0090C1] mb-4 border-b border-slate-200 pb-2">4. Administrator Guide</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Student Registration & Payments</h3>
                  <p className="text-sm text-slate-700">
                    The registration process is now automated to ensure fee collection.
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-slate-700 mt-2 space-y-1">
                    <li>Go to <strong>Students > Add New Student</strong>.</li>
                    <li>Fill in the student details (Name, ID, Phone, Grade).</li>
                    <li>Click <strong>Register & Notify</strong>.</li>
                    <li>The system will automatically generate a secure account.</li>
                    <li>An <strong>Email and SMS</strong> will be sent to the student containing a <strong>Payment Link</strong> for tuition.</li>
                  </ol>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Reporting</h3>
                  <p className="text-sm text-slate-700">
                    Use the 'Reports' dashboard to visualize enrollment growth, track teacher assignments, and monitor system health.
                    Reports can be exported to PDF for official board meetings.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-500">
                 <ShieldCheck size={20} />
                 <span className="text-xs font-bold uppercase tracking-widest">Authorized Documentation</span>
               </div>
               <div className="text-center">
                  <Signature className="w-32 h-12 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase">System Director</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideCard: React.FC<{ title: string, icon: React.ReactNode, steps: string[] }> = ({ title, icon, steps }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    </div>
    <ul className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed font-medium">
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0090C1] shrink-0" />
          {step}
        </li>
      ))}
    </ul>
  </div>
);
