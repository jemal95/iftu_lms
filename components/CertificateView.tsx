
import React, { useState } from 'react';
import { Download, Loader2, Award, Stamp } from 'lucide-react';
import { AuthUser } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Signature } from './Signature';

interface CertificateViewProps {
  user: AuthUser;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ user }) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine Certificate Type based on Grade/Department
  const isTVET = user.currentGrade?.includes('Level') || user.department?.includes('Vocational');
  const certificateTitle = isTVET ? "Certificate of Competency" : "High School Diploma";
  const certificateSubTitle = isTVET ? "Mirkaneessa Gahumsaa Ogummaa" : "Ragaa Xumura Barnoota Sad. 2ffaa";
  const programTitle = isTVET ? `TVET Program - ${user.currentGrade}` : "Natural Sciences Stream";
  const completionText = isTVET 
    ? "Has demonstrated the required competencies and skills prescribed for the Technical & Vocational Education Training."
    : "Has satisfactorily completed the Course of Study prescribed for the Secondary Schools of Oromia.";
  const distinctionText = isTVET
    ? "Awarded for occupational proficiency and readiness."
    : "Awarded with Distinction and verified for Higher Education Entrance.";

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('certificate-doc');
    
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0, 0],
        filename: `IFTU_${isTVET ? 'TVET' : 'HS'}_Certificate_${user.name.replace(/\s/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };

      try {
        await (window as any).html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Could not generate PDF.");
      }
    } else {
      window.print();
    }
    setIsGenerating(false);
  };

  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Stamp Color Logic
  const stampColor = isTVET ? "#92400e" : "#2e1065"; // Amber for TVET, Purple/Indigo for HS

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-html2canvas-ignore="true">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('certificate')}</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isTVET ? "Official Technical & Vocational Competency Award." : "Official High School Diploma (Grade 12)."}
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleDownloadPDF}
             disabled={isGenerating}
             className="flex items-center gap-2 px-8 py-4 bg-[#0090C1] text-white rounded-2xl font-bold shadow-2xl shadow-sky-500/20 hover:bg-[#007ba6] transition-all disabled:opacity-75 disabled:cursor-wait"
           >
             {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
             {isGenerating ? 'Generating...' : 'Download Official PDF'}
           </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-12">
        <div className="min-w-fit flex justify-center p-4">
          <div 
            id="certificate-doc" 
            className="bg-white overflow-hidden shadow-2xl relative shrink-0"
            style={{ width: '1100px', height: '778px', fontFamily: '"Times New Roman", serif' }}
          >
            {/* Decorative Border */}
            <div className={`absolute inset-4 border-[12px] border-double ${isTVET ? 'border-amber-600' : 'border-[#0090C1]'}`}></div>
            <div className={`absolute inset-8 border-[2px] ${isTVET ? 'border-amber-800' : 'border-[#1e40af]'}`}></div>
            
            {/* Corner Ornaments */}
            <div className={`absolute top-8 left-8 w-16 h-16 border-t-[4px] border-l-[4px] ${isTVET ? 'border-amber-800' : 'border-[#1e40af]'}`}></div>
            <div className={`absolute top-8 right-8 w-16 h-16 border-t-[4px] border-r-[4px] ${isTVET ? 'border-amber-800' : 'border-[#1e40af]'}`}></div>
            <div className={`absolute bottom-8 left-8 w-16 h-16 border-b-[4px] border-l-[4px] ${isTVET ? 'border-amber-800' : 'border-[#1e40af]'}`}></div>
            <div className={`absolute bottom-8 right-8 w-16 h-16 border-b-[4px] border-r-[4px] ${isTVET ? 'border-amber-800' : 'border-[#1e40af]'}`}></div>

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award size={500} />
            </div>

            {/* Student Photo Area */}
            <div className="absolute top-16 right-16 w-36 h-44 border-[3px] border-slate-300 bg-slate-50 shadow-sm flex items-center justify-center overflow-hidden z-20">
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-90 contrast-110" />
            </div>

            <div className="relative h-full flex flex-col items-center justify-center p-20 text-center z-10">
              
              {/* Header */}
              <div className="mb-6 w-full">
                 <div className="flex flex-col items-center justify-center gap-2 mb-2">
                    <div className="text-center space-y-1">
                        <h1 className="text-xl font-bold text-slate-900 uppercase tracking-widest leading-relaxed font-serif">
                            Oromia Education Bureau | Biiroo Barnoota Oromiyaa
                        </h1>
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest leading-relaxed font-serif">
                            West Arsi Zone | Godina Arsii Lixaa
                        </h2>
                        <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest leading-relaxed font-serif">
                            Kore Woreda | Aanaa Koree
                        </h3>
                        <div className={`mt-3 border-b-2 ${isTVET ? 'border-amber-600' : 'border-[#0090C1]'} pb-2 inline-block px-10`}>
                            <h4 className={`text-2xl font-black ${isTVET ? 'text-amber-700' : 'text-[#0090C1]'} uppercase tracking-[0.15em]`}>
                                {isTVET ? "IFTU TVET INSTITUTE" : "IFTU PRIVATE SECONDARY SCHOOL"}
                            </h4>
                            <h4 className={`text-xl font-black ${isTVET ? 'text-amber-700' : 'text-[#0090C1]'} uppercase tracking-[0.15em] mt-1`}>
                                {isTVET ? "KOLLEEJJII TEK. & OGUMMAA IFTU" : "M.B. DHUUNFAA IFTU"}
                            </h4>
                        </div>
                    </div>
                 </div>
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mt-4">
                    {certificateTitle} | {certificateSubTitle}
                 </p>
              </div>

              {/* Title */}
              <h2 className={`text-5xl font-serif ${isTVET ? 'text-amber-800' : 'text-[#1e40af]'} mb-4 font-bold italic`} style={{ fontFamily: 'Pinyon Script, cursive' }}>
                {certificateTitle}
              </h2>

              <p className="text-xl text-slate-600 mb-4 font-serif italic">
                This certifies that / Waraqaan kun kan mirkaneessu barataa/tuu
              </p>

              {/* Student Name */}
              <div className="mb-6 w-full max-w-3xl border-b-2 border-slate-300 pb-2">
                 <h3 className="text-5xl font-bold text-slate-900 font-serif capitalize">{user.name}</h3>
              </div>

              <p className="text-lg text-slate-600 mb-2 font-serif italic max-w-4xl leading-relaxed">
                {completionText}
              </p>
              <h4 className="text-2xl font-bold text-slate-800 mb-4 uppercase mt-2">{programTitle}</h4>
              
              <p className="text-lg text-slate-600 mb-10 font-serif">
                {distinctionText}
              </p>

              {/* Signatures */}
              <div className="w-full flex justify-between items-end px-16 mt-4">
                 <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 mb-2">{currentDate}</p>
                    <div className="w-64 border-t-2 border-slate-800 pt-2">
                       <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Date Issued / Guyyaa</p>
                    </div>
                 </div>

                 <div className="relative">
                    {/* Official Stamp with Oda Tree - Reduced Font Size */}
                    <div className="absolute -top-36 left-1/2 -translate-x-1/2 opacity-90 pointer-events-none">
                       <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            {/* Paths for text between circles */}
                            <path id="certTextTop" d="M 20,100 A 80,80 0 0,1 180,100" />
                            <path id="certTextBottom" d="M 180,100 A 80,80 0 0,1 20,100" />
                          </defs>

                          {/* Outer Rings */}
                          <circle cx="100" cy="100" r="98" fill="none" stroke={stampColor} strokeWidth="2.5" />
                          <circle cx="100" cy="100" r="65" fill="none" stroke={stampColor} strokeWidth="1" />
                          
                          {/* Top Text - Reduced Font Size */}
                          <text fill={stampColor} fontSize="11" fontWeight="900" letterSpacing="1.2">
                            <textPath href="#certTextTop" startOffset="50%" textAnchor="middle">
                              BIIROO BARNOOTAA OROMIYAA
                            </textPath>
                          </text>

                          {/* Bottom Text - Reduced Font Size */}
                          <text fill={stampColor} fontSize="10" fontWeight="bold" letterSpacing="1">
                            <textPath href="#certTextBottom" startOffset="50%" textAnchor="middle">
                              OROMIA EDUCATION BUREAU
                            </textPath>
                          </text>

                          {/* Inner Text - Reduced Font Size */}
                          <text x="100" y="55" fontSize="6.5" fontWeight="bold" fill={stampColor} textAnchor="middle">
                            GODINA ARSII LIXAA / WEST ARSI ZONE
                          </text>
                          <text x="100" y="64" fontSize="6.5" fontWeight="bold" fill={stampColor} textAnchor="middle">
                            AANAA KOREE / KORE WOREDA
                          </text>

                          {/* The Oda Tree - Authentic Silhouette */}
                          <g transform="translate(100, 110) scale(0.7)">
                              {/* Authentic Canopy */}
                              <path d="M-55,0 C-55,-45 0,-55 0,-55 C0,-55 55,-45 55,0 C45,10 0,5 0,5 C0,5 -45,10 -55,0 Z" fill={stampColor} />
                              {/* Trunk and Branches */}
                              <path d="M-12,0 L-18,45 Q-25,55 -35,55 L35,55 Q25,55 18,45 L12,0 Z" fill={stampColor} />
                              <path d="M0,0 L0,-35 M0,0 L-25,-20 M0,0 L25,-20" stroke="white" strokeWidth="2" fill="none" />
                          </g>

                          {/* School Name Bottom Center - Reduced Font Size */}
                          <text x="100" y="155" fontSize="7" fontWeight="900" fill={stampColor} textAnchor="middle" letterSpacing="0.5">
                            M.B. DHUUNFAA IFTU
                          </text>
                          <text x="100" y="163" fontSize="6" fontWeight="bold" fill={stampColor} textAnchor="middle">
                            IFTU PRIVATE SCHOOL
                          </text>
                       </svg>
                    </div>
                 </div>

                 <div className="text-center flex flex-col items-center">
                    <div className="mb-2">
                      <Signature className={`w-40 h-24 -mb-6 ${isTVET ? 'text-amber-800' : 'text-blue-800'}`} color={stampColor} />
                    </div>
                    <div className="w-64 border-t-2 border-slate-800 pt-2">
                       <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">JEMAL FANO HAJI</p>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Dean / Principal</p>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
