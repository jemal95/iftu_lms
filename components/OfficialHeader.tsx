import React from 'react';
import { InstitutionalBranding } from '../types';

interface OfficialHeaderProps {
  branding: InstitutionalBranding;
  subTitle?: string;
  showFlags?: boolean;
}

export const OfficialHeader: React.FC<OfficialHeaderProps> = ({ 
  branding, 
  subTitle = "Student Mark List", 
  showFlags = true 
}) => {
  return (
    <div className="flex justify-between items-start mb-8 no-print">
      {showFlags && (
        <div className="w-28 h-16 border-2 border-slate-800 flex flex-col shadow-lg shrink-0 flag-texture rounded-sm">
          <div className="h-1/3 bg-[#009A44]"></div>
          <div className="h-1/3 bg-[#FEDD00] flex items-center justify-center relative">
            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shadow-inner">
              <span className="text-white text-[8px]">★</span>
            </div>
          </div>
          <div className="h-1/3 bg-[#D52B1E]"></div>
        </div>
      )}

      <div className="text-center flex-1 mx-12">
        <h1 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 font-serif leading-tight">
          {branding.bureauName}
        </h1>
        <h2 className="text-lg font-bold uppercase tracking-widest text-slate-600 font-serif mt-1">
          {branding.bureauNameLocal}
        </h2>
        
        <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 my-3">
          <span className="px-3 py-1 border border-slate-200 rounded-full">{branding.zoneName}</span>
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
          <span className="px-3 py-1 border border-slate-200 rounded-full">{branding.woredaName}</span>
        </div>

        <div className="w-full h-0.5 bg-slate-900 my-4 shadow-sm"></div>
        
        <h2 className="text-4xl font-black text-[#0090C1] uppercase tracking-tighter font-sans">
          {branding.schoolName}
        </h2>
        <div className="mt-2 flex items-center justify-center gap-3">
           <div className="h-px bg-slate-200 flex-1"></div>
           <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] font-sans px-4">
             {branding.schoolNameLocal}
           </p>
           <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="mt-6 inline-block bg-slate-900 px-6 py-2 rounded-xl">
           <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
             {subTitle}
           </p>
        </div>
      </div>

      {showFlags && (
        <div className="w-28 h-16 border-2 border-slate-800 flex flex-col shadow-lg shrink-0 flag-texture rounded-sm">
          <div className="h-1/3 bg-[#D52B1E]"></div>
          <div className="h-1/3 bg-white flex items-center justify-center relative">
            <div className="text-black font-black text-xs scale-150 drop-shadow-sm">♣</div>
          </div>
          <div className="h-1/3 bg-black"></div>
        </div>
      )}
    </div>
  );
};