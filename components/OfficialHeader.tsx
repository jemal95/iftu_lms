
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
    <div className="flex justify-between items-start mb-6">
      {showFlags && (
        <div className="w-24 h-14 border border-gray-200 flex flex-col shadow-sm shrink-0">
          <div className="h-1/3 bg-[#009A44]"></div>
          <div className="h-1/3 bg-[#FEDD00] flex items-center justify-center relative">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[8px]">★</span>
            </div>
          </div>
          <div className="h-1/3 bg-[#D52B1E]"></div>
        </div>
      )}

      <div className="text-center flex-1 mx-8">
        <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900 font-serif leading-tight">
          {branding.bureauName} | {branding.bureauNameLocal}
        </h1>
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 my-1">
          <span>{branding.zoneName}</span>
          <span className="text-slate-300">|</span>
          <span>{branding.woredaName}</span>
        </div>
        <div className="w-full h-px bg-slate-800 my-2"></div>
        <h2 className="text-3xl font-black text-[#0090C1] uppercase tracking-wide font-sans mt-2">
          {branding.schoolName}
        </h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] font-sans mt-1">
          {branding.schoolNameLocal} | {subTitle}
        </p>
      </div>

      {showFlags && (
        <div className="w-24 h-14 border border-gray-200 flex flex-col shadow-sm shrink-0">
          <div className="h-1/3 bg-[#D52B1E]"></div>
          <div className="h-1/3 bg-white flex items-center justify-center relative">
            <div className="text-black font-bold text-[10px] scale-150">♣</div>
          </div>
          <div className="h-1/3 bg-black"></div>
        </div>
      )}
    </div>
  );
};
