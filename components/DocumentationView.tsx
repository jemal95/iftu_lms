
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
  Settings
} from 'lucide-react';
import { Signature } from './Signature';

interface DocumentationViewProps {
  onBack: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadGuide = async () => {
    setIsGenerating(true);
    const element = document.getElementById('guidance-document');
    
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0.5, 0.5],
        filename: 'IFTU_SCHOOL_Comprehensive_Guide.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
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
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl text-gray-500 transition-all shadow-sm hover:shadow-md"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">System Knowledge Base</h2>
            <p className="text-sm text-gray-500 font-medium">Master the IFTU SCHOOL System Operations & AI Tools</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadGuide}
          disabled={isGenerating}
          className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all disabled:opacity-75 flex-shrink-0"
        >
          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          {isGenerating ? 'Synthesizing...' : 'Download Full User Guide'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DocCard 
          icon={<Shield className="text-sky-500" />} 
          title="Step 1: Access & Security" 
          description="Login via Role-Based profiles or the Enterprise Institutional Sign-In (SSO) for maximum security."
        />
        <DocCard 
          icon={<Layout className="text-indigo-500" />} 
          title="Step 2: Dashboard Command" 
          description="Analyze institutional growth, stay updated via the News Bulletin, and monitor active subjects."
        />
        <DocCard 
          icon={<Book className="text-emerald-500" />} 
          title="Step 3: Academic Management" 
          description="Teachers: Create syllabi, record grades in the live Gradebook, and manage student rosters."
        />
        <DocCard 
          icon={<Video className="text-rose-500" />} 
          title="Step 4: Media Studio" 
          description="Harness Gemini Veo to generate high-fidelity promotional videos using text scripts and reference photos."
        />
        <DocCard 
          icon={<Sparkles className="text-sky-500" />} 
          title="Step 5: AI Assistant" 
          description="Generate certificates, transcripts, and study guides instantly using natural language prompts."
        />
        <DocCard 
          icon={<Users className="text-amber-500" />} 
          title="Step 6: Admin Controls" 
          description="Manage campuses, register faculty, and export comprehensive institutional reports in Excel or PDF."
        />
      </div>

      {/* Hidden container for PDF generation */}
      <div className="hidden">
        <div id="guidance-document" className="p-10 font-sans text-slate-800 bg-white">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#0090C1]">IFTU SCHOOL</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Complete Institutional Guidance Document</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-slate-500">System v2.1.0</p>
              <p className="text-xs font-bold text-slate-400">Updated: Nov 2024</p>
            </div>
          </div>

          <div className="space-y-8">
            <GuideSection title="Phase 1: Secure Authentication">
              <p>The IFTU workspace is a high-security environment. Users can enter via:</p>
              <ul className="list-disc ml-5 mt-2 space-y-2">
                <li><strong>Institutional Sign-In (SSO):</strong> Use your organization's official Google or Microsoft account. This ensures your identity is verified across all school platforms without needing separate passwords.</li>
                <li><strong>Profile Selector:</strong> Manual entry for specific roles (Admin, Teacher, Student) to unlock specialized dashboards.</li>
              </ul>
            </GuideSection>

            <GuideSection title="Phase 2: Administrative Onboarding">
              <p>System Directors follow these steps to initialize a workspace:</p>
              <ul className="list-disc ml-5 mt-2 space-y-2">
                <li><strong>Campus Setup:</strong> Register geographic learning centers under the 'Schools' module.</li>
                <li><strong>User Registry:</strong> Use the 'Teachers' and 'Students' tabs to enroll members of the institutional community.</li>
                <li><strong>Global Reports:</strong> Generate live data visualizations and export database snapshots for audit purposes.</li>
              </ul>
            </GuideSection>

            <GuideSection title="Phase 3: Academic Lifecycle">
              <p>Education delivery is managed through:</p>
              <ul className="list-disc ml-5 mt-2 space-y-2">
                <li><strong>Subject Catalog:</strong> Defining curriculums, uploading lecture notes, and setting prerequisites.</li>
                <li><strong>Examination Engine:</strong> Deploying AI-powered MCQs. Use the 'Assessment Architect' to extract questions from source text files automatically.</li>
                <li><strong>Gradebook Verification:</strong> Recording scores that instantly update student transcripts and performance charts.</li>
              </ul>
            </GuideSection>

            <GuideSection title="Phase 4: AI Media Production (Media Studio)">
              <p>IFTU SCHOOL features a cutting-edge video production facility powered by Gemini Veo:</p>
              <ul className="list-disc ml-5 mt-2 space-y-2">
                <li><strong>Script Writing:</strong> Enter a cinematic description of the video you want to create (e.g., 'A teacher presenting a tech hologram').</li>
                <li><strong>Character Consistency:</strong> Upload a photo of the main subject. The AI will ensure the video character looks like the reference photo.</li>
                <li><strong>High-Fidelity Rendering:</strong> The system synthesizes frames in 720p HD. You can preview, export, and download the finished MP4.</li>
              </ul>
            </GuideSection>

            <GuideSection title="Phase 5: Institutional Intelligence">
              <p>Powered by Gemini, our AI Assistant handles documentation:</p>
              <ul className="list-disc ml-5 mt-2 space-y-2">
                <li><strong>Certificate Issuance:</strong> Students can request official Completion Certificates via chat.</li>
                <li><strong>Transcript Generation:</strong> Automated creation of academic records in professional PDF formats.</li>
                <li><strong>Research:</strong> Use grounding with Google Search to find the latest educational trends and resources.</li>
              </ul>
            </GuideSection>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between opacity-50">
             <div className="flex items-center gap-2">
               <ShieldCheck className="text-[#0090C1]" size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Certified Institutional Document</span>
             </div>
             <div className="flex flex-col items-center">
                <Signature className="w-24 h-12 -mb-3" />
                <p className="text-[8px] font-bold uppercase tracking-widest">Authorized System Director</p>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest">© 2024 IFTU International</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        <div className="relative space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 text-sky-600">
            <Info size={24} />
            <h3 className="text-2xl font-black text-gray-800">Support & Inquiries</h3>
          </div>
          <p className="text-gray-500 leading-relaxed font-medium">
            For technical onboarding, Enterprise API access, or system errors, contact our institutional support hub. 
            Connect with us on our official social platforms for real-time updates.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all">
              Institutional Support Portal
            </button>
            <a 
              href="https://www.facebook.com/100074004668688/posts/pfbid02RZ36w8yVKKMJVREKUEh474GAj13AzaYwSRiryGD86ofpWVpEKsg4rquo3Pcnqc3Ul/?app=fbl" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl font-bold hover:bg-white transition-all flex items-center gap-2"
            >
              <ExternalLink size={18} /> Official Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
    <p className="text-sm text-gray-500 leading-relaxed font-medium">{description}</p>
    <button className="mt-6 text-xs font-black uppercase tracking-widest text-[#0090C1] flex items-center gap-1 hover:gap-2 transition-all">
      Open Module <span>→</span>
    </button>
  </div>
);

const GuideSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-2">
      <CheckCircle2 size={18} className="text-emerald-500" />
      <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
    </div>
    <div className="text-sm text-slate-600 leading-relaxed pl-7 font-medium">
      {children}
    </div>
  </div>
);
