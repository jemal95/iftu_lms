
import React, { useState, useEffect } from 'react';
import { Download, Loader2, Award, Stamp } from 'lucide-react';
import { AuthUser, InstitutionalBranding } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Signature } from './Signature';
import { db } from '../utils/persistence';

interface CertificateViewProps {
  user: AuthUser;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ user }) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [branding, setBranding] = useState<InstitutionalBranding>(db.getBranding());

  useEffect(() => {
    setBranding(db.getBranding());
  }, []);

  const fullUser = db.getUsers().find(u => u.id === user.id);
  const currentGrade = fullUser?.currentGrade || '';
  const department = fullUser?.department || '';

  const isTVET = currentGrade.includes('Level') || department.includes('Vocational');
  const certificateTitle = isTVET ? "Certificate of Competency" : "High School Diploma";
  const certificateSubTitle = isTVET ? "Mirkaneessa Gahumsaa Ogummaa" : "Ragaa Xumura Barnoota Sad. 2ffaa";
  const programTitle = isTVET ? `TVET Program - ${currentGrade}` : "Natural Sciences Stream";
  const completionText = isTVET 
    ? "Has demonstrated the required competencies and skills prescribed for the Technical & Vocational Education Training."
    : "Has satisfactorily completed the Course of Study prescribed for the Secondary Schools of Oromia.";

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('certificate-doc');
    if (element && (window as any).html2pdf) {
      const opt = {
        margin: [0, 0],
        filename: `Diploma_${user.name.replace(/\s/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      try {
        await (window as any).html2pdf().set(opt).from(element).save();
      } catch (error) {
        alert("PDF Generation failed.");
      }
    } else {
      window.print();
    }
    setIsGenerating(false);
  };

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const stampColor = isTVET ? "#92400e" : "#2e1065";

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-html2canvas-ignore="true">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('certificate')}</h2>
          <p className="text-sm text-slate-500 mt-1 font-bold uppercase tracking-widest">Formal Graduation Award</p>
        </div>
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex items-center gap-3 px-10 py-5 bg-[#0090C1] text-white rounded-[2rem] font-black shadow-2xl hover:bg-[#007ba6] transition-all disabled:opacity-75">
           {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />} {isGenerating ? 'Rendering...' : 'Download Diploma PDF'}
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-12">
        <div className="min-w-fit flex justify-center p-4">
          <div id="certificate-doc" className="bg-white overflow-hidden shadow-2xl relative shrink-0" style={{ width: '1100px', height: '778px', fontFamily: '"Times New Roman", serif' }}>
            <div className={`absolute inset-4 border-[12px] border-double ${isTVET ? 'border-amber-600' : 'border-[#0090C1]'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><Award size={500} /></div>
            <div className="absolute top-16 right-16 w-36 h-44 border-[3px] border-slate-300 bg-slate-50 shadow-sm flex items-center justify-center overflow-hidden z-20">
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-90 contrast-110" />
            </div>

            <div className="relative h-full flex flex-col items-center justify-center p-20 text-center z-10">
              <div className="mb-6 w-full space-y-2">
                  <h1 className="text-xl font-bold text-slate-900 uppercase tracking-widest font-serif">{branding.bureauName} | {branding.bureauNameLocal}</h1>
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest font-serif">{branding.zoneName} | {branding.woredaName}</h2>
                  <div className={`mt-3 border-b-2 ${isTVET ? 'border-amber-600' : 'border-[#0090C1]'} pb-2 inline-block px-10`}>
                      <h4 className={`text-2xl font-black ${isTVET ? 'text-amber-700' : 'text-[#0090C1]'} uppercase tracking-[0.15em]`}>{branding.schoolName}</h4>
                      <h4 className={`text-xl font-black ${isTVET ? 'text-amber-700' : 'text-[#0090C1]'} uppercase tracking-[0.15em] mt-1`}>{branding.schoolNameLocal}</h4>
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mt-4">{certificateTitle} | {certificateSubTitle}</p>
              </div>

              <h2 className={`text-5xl font-serif ${isTVET ? 'text-amber-800' : 'text-[#1e40af]'} mb-4 font-bold italic`} style={{ fontFamily: 'Pinyon Script, cursive' }}>{certificateTitle}</h2>
              <p className="text-xl text-slate-600 mb-4 font-serif italic">This certifies that / Waraqaan kun kan mirkaneessu barataa/tuu</p>
              <div className="mb-6 w-full max-w-3xl border-b-2 border-slate-300 pb-2"><h3 className="text-5xl font-bold text-slate-900 font-serif capitalize">{user.name}</h3></div>
              <p className="text-lg text-slate-600 mb-2 font-serif italic max-w-4xl leading-relaxed">{completionText}</p>
              <h4 className="text-2xl font-bold text-slate-800 mb-10 uppercase mt-2">{programTitle}</h4>

              <div className="w-full flex justify-between items-end px-16">
                 <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-slate-800">{currentDate}</p>
                    <div className="w-64 border-t-2 border-slate-800 pt-2"><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Date Issued / Guyyaa</p></div>
                 </div>

                 <div className="relative">
                    <div className="absolute -top-36 left-1/2 -translate-x-1/2 opacity-90 pointer-events-none">
                       <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <defs><path id="cTextTop" d="M 20,100 A 80,80 0 0,1 180,100" /><path id="cTextBottom" d="M 180,100 A 80,80 0 0,1 20,100" /></defs>
                          <circle cx="100" cy="100" r="98" fill="none" stroke={stampColor} strokeWidth="2.5" /><circle cx="100" cy="100" r="65" fill="none" stroke={stampColor} strokeWidth="1" />
                          <text fill={stampColor} fontSize="11" fontWeight="900" letterSpacing="1.2"><textPath href="#cTextTop" startOffset="50%" textAnchor="middle">{branding.bureauNameLocal.toUpperCase()}</textPath></text>
                          <text fill={stampColor} fontSize="10" fontWeight="bold" letterSpacing="1"><textPath href="#cTextBottom" startOffset="50%" textAnchor="middle">{branding.bureauName.toUpperCase()}</textPath></text>
                          <text x="100" y="55" fontSize="6.5" fontWeight="bold" fill={stampColor} textAnchor="middle">{branding.zoneName.toUpperCase()}</text>
                          <text x="100" y="64" fontSize="6.5" fontWeight="bold" fill={stampColor} textAnchor="middle">{branding.woredaName.toUpperCase()}</text>
                          <g transform="translate(100, 110) scale(0.7)"><path d="M-55,0 C-55,-45 0,-55 0,-55 C0,-55 55,-45 55,0 C45,10 0,5 0,5 C0,5 -45,10 -55,0 Z" fill={stampColor} /><path d="M-12,0 L-18,45 Q-25,55 -35,55 L35,55 Q25,55 18,45 L12,0 Z" fill={stampColor} /><path d="M0,0 L0,-35 M0,0 L-25,-20 M0,0 L25,-20" stroke="white" strokeWidth="2" fill="none" /></g>
                          <text x="100" y="155" fontSize="7" fontWeight="900" fill={stampColor} textAnchor="middle">{branding.schoolNameLocal.toUpperCase()}</text>
                          <text x="100" y="163" fontSize="6" fontWeight="bold" fill={stampColor} textAnchor="middle">{branding.schoolName.toUpperCase()}</text>
                       </svg>
                    </div>
                 </div>

                 <div className="text-center flex flex-col items-center">
                    <Signature className="w-40 h-24 -mb-6 text-blue-800" color={stampColor} />
                    <div className="w-64 border-t-2 border-slate-800 pt-2">
                       <p className="text-sm font-black text-slate-900 uppercase tracking-widest">JEMAL FANO HAJI</p>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Institutional Director</p>
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
