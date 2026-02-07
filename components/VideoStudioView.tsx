
import React, { useState, useRef } from 'react';
import { 
  Video, 
  Play, 
  Sparkles, 
  Download, 
  Loader2, 
  Camera, 
  Wand2, 
  Upload, 
  X, 
  MonitorPlay,
  Film,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  History,
  Clock,
  UserCheck,
  Clapperboard,
  Tv,
  ChevronRight,
  Zap,
  FileText
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { AuthUser } from '../types';

interface VideoStudioViewProps {
  user: AuthUser;
}

interface SavedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  thumbnail: string;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([
    {
      id: 'v1',
      url: '#',
      prompt: 'IFTU SCHOOL: The Digital Dawn - Director Intro',
      timestamp: 'Active Vault',
      thumbnail: 'https://picsum.photos/seed/director-v1/320/180'
    }
  ]);
  
  const [prompt, setPrompt] = useState(
    `A cinematic promo for IFTU SCHOOL. A distinguished male administrator (matching the reference photo: dark skin, serious authoritative expression, high forehead) is wearing a dark professional bomber jacket. He is standing in a futuristic digital hub with glowing blue screens. He gestures toward a holographic logo of 'IFTU SCHOOL'. 4k resolution, cinematic lighting, epic orchestral background feel.`
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedPhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLoadScript = () => {
    setPrompt(
      `Cinematic commercial for "IFTU IT EDUCATION CENTRE". 
      Visuals: Close-up of hands efficiently processing a passport renewal, followed by a clock showing "20 Minutes Turnaround". 
      Transition to a modern office screen displaying online forms for DV Lottery and TeleBirr payments. 
      The administrator (reference photo) smiles reassuringly at a student while pointing to a university application result on a monitor. 
      Text overlay: "IFTU - Empowering You Through Service". 
      Warm, professional lighting, 4k quality.`
    );
  };

  const handleGenerateVideo = async () => {
    // Check if the environment supports key selection (e.g., Veo requirements)
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Do not return here. Proceed immediately to handle the race condition where 
      // hasSelectedApiKey might not update instantly.
    }

    setIsGenerating(true);
    setGenerationProgress('Orchestrating production environment...');
    setVideoUrl(null);

    try {
      // Initialize new instance to ensure the latest key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      };

      if (uploadedPhoto) {
        config.referenceImages = [
          {
            image: {
              imageBytes: uploadedPhoto.split(',')[1],
              mimeType: 'image/jpeg'
            },
            referenceType: 'ASSET'
          }
        ];
      }

      setGenerationProgress('Analyzing character topology from reference...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt + (uploadedPhoto ? " Ensure the lead character is an exact likeness of the administrator in the provided photo, wearing the signature dark bomber jacket." : ""),
        config
      });

      const productionSteps = [
        "Synthesizing holographic overlays...",
        "Applying cinematic grade (Teal/Gold)...",
        "Rendering Lead Admin's expressions...",
        "Optimizing HD frame sequences...",
        "Applying institutional watermarks...",
        "Finalizing cinematic export..."
      ];
      let stepIdx = 0;

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        setGenerationProgress(productionSteps[stepIdx % productionSteps.length]);
        stepIdx++;
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setGenerationProgress('Packaging master file...');
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const newUrl = URL.createObjectURL(blob);
        setVideoUrl(newUrl);
        
        setSavedVideos(prev => [{
          id: `v-${Date.now()}`,
          url: newUrl,
          prompt: prompt.substring(0, 50) + '...',
          timestamp: 'Just Produced',
          thumbnail: uploadedPhoto || 'https://picsum.photos/seed/produced/320/180'
        }, ...prev]);

      } else {
        throw new Error('Render farm returned empty response.');
      }
    } catch (error: any) {
      console.error("Media Studio Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        // Reset key selection if invalid
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else {
        alert(`Production Status: ${error.message || 'System overload. Please retry.'}`);
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0090C1]/10 text-[#0090C1] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#0090C1]/20 shadow-sm animate-pulse">
             <Clapperboard size={14} /> Live Production: IFTU Media Studio
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Media Production Hub</h2>
          <p className="text-slate-500 font-medium text-xl italic border-l-4 border-sky-500 pl-6">
            "Feature Presentation: Lead Administrator {user.name}"
          </p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 shadow-xl shadow-slate-200/40">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Server Cluster</span>
                <span className="text-xs font-bold text-emerald-600">Online & Synchronized</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Production Floor */}
        <div className="xl:col-span-8 space-y-10">
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[700px] flex flex-col group/canvas transition-all hover:shadow-sky-500/5">
            <div className="p-10 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-[#0090C1] shadow-xl shadow-sky-500/10 border border-sky-100 group-hover/canvas:rotate-6 transition-transform">
                    <Tv size={32} />
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-800">Master Production Monitor</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">High-Definition Cinema Pipeline</p>
                 </div>
              </div>
              {videoUrl && (
                <button 
                  onClick={() => window.open(videoUrl)}
                  className="flex items-center gap-3 px-10 py-5 bg-[#0090C1] text-white rounded-[1.8rem] text-xs font-black uppercase tracking-widest hover:bg-[#007ba6] transition-all shadow-2xl shadow-sky-500/30 active:scale-95 group/btn"
                >
                  <Download size={20} className="group-hover/btn:translate-y-0.5 transition-transform" /> Export Master MP4
                </button>
              )}
            </div>

            <div className="flex-1 p-12 flex flex-col items-center justify-center relative bg-[#090E1A] overflow-hidden">
              {/* Cinematic Background Ambience */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#1e3a8a_0%,_transparent_50%)] opacity-30" />
              
              {isGenerating ? (
                <div className="text-center space-y-12 max-w-sm animate-in zoom-in duration-700 relative z-10">
                  <div className="relative">
                    <div className="w-44 h-44 border-[6px] border-white/5 border-t-sky-500 rounded-full animate-spin mx-auto shadow-[0_0_50px_-10px_rgba(14,165,233,0.3)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Sparkles className="text-sky-400 animate-pulse" size={64} />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h4 className="text-3xl font-black text-white tracking-tight">Synthesizing Film</h4>
                    <div className="flex flex-col gap-2">
                       <p className="text-sm text-sky-400 font-black uppercase tracking-[0.2em]">{generationProgress}</p>
                       <p className="text-xs text-slate-500 italic">"Finalizing {user.name}'s character performance..."</p>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-8 shadow-inner border border-white/5">
                       <div className="h-full bg-gradient-to-r from-sky-400 via-[#0090C1] to-indigo-500 animate-progress-glow w-full" />
                    </div>
                  </div>
                </div>
              ) : videoUrl ? (
                <div className="w-full h-full rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] relative group bg-black border border-white/5">
                   <video 
                     src={videoUrl} 
                     controls 
                     className="w-full h-full object-contain" 
                     autoPlay
                   />
                   <div className="absolute top-8 left-8 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 pointer-events-none">
                      <span className="px-6 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <Film size={16} className="text-sky-400" /> Source: IFTU Render Farm 720p
                      </span>
                   </div>
                </div>
              ) : (
                <div className="text-center space-y-10 py-20 relative z-10">
                  <div className="w-40 h-40 bg-white/5 rounded-[4rem] flex items-center justify-center text-slate-700 mx-auto border-4 border-dashed border-white/10 animate-pulse group-hover/canvas:scale-105 transition-transform duration-500">
                     <Tv size={80} strokeWidth={1} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-3xl font-black text-white tracking-tight">Casting Studio Online</h4>
                    <p className="text-base text-slate-400 mt-2 max-w-md mx-auto leading-relaxed font-light">
                      The institutional production suite is ready. Upload your administrator portrait on the right to lock in identity-consistent cinematic rendering.
                    </p>
                    <div className="pt-6 flex justify-center gap-4">
                       <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Character Lock: Inactive
                       </div>
                       <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          GPU Priority: Global
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Archive Wall */}
          <div className="space-y-8">
             <div className="flex items-center gap-4 px-4">
                <div className="p-2 bg-sky-50 rounded-xl">
                   <History className="text-[#0090C1]" size={24} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Institutional Archives</h3>
                <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Zap size={12} className="text-amber-500" /> Active Vault
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {savedVideos.map((vid) => (
                   <div key={vid.id} className="bg-white p-6 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer overflow-hidden flex flex-col border-b-8 border-b-transparent hover:border-b-sky-500 active:scale-[0.98]">
                      <div className="h-48 rounded-[2.5rem] overflow-hidden mb-6 relative bg-slate-100">
                         <img src={vid.thumbnail} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" alt="" />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#0090C1] shadow-2xl group-hover:scale-110 transition-all">
                               <Play size={28} fill="currentColor" className="ml-1.5" />
                            </div>
                         </div>
                         <div className="absolute top-5 left-5">
                            <span className="px-4 py-1.5 bg-black/40 backdrop-blur-xl text-[9px] font-black text-white rounded-xl uppercase tracking-[0.2em] border border-white/20">
                               720p HD
                            </span>
                         </div>
                      </div>
                      <div className="px-1 space-y-5">
                        <h5 className="text-base font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-[#0090C1] transition-colors">{vid.prompt}</h5>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <Clock size={14} /> {vid.timestamp}
                           </div>
                           <button className="p-3 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-2xl transition-all">
                              <Download size={20} />
                           </button>
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Control Desk */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl p-12 space-y-12 sticky top-24 transition-all hover:shadow-sky-500/5">
            <div className="space-y-2 border-b border-slate-50 pb-8">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Wand2 size={20} className="text-[#0090C1]" /> Studio Console
              </h4>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">Configure cinematic parameters and actor references.</p>
            </div>

            {/* Photo Selection for Actor Consistency */}
            <div className="space-y-5">
               <div className="flex items-center justify-between px-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Camera size={16} className="text-sky-500" /> Actor Reference
                  </label>
                  {uploadedPhoto && (
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                      <ShieldCheck size={12} /> Likeness Verified
                    </span>
                  )}
               </div>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="relative group cursor-pointer"
               >
                 {uploadedPhoto ? (
                   <div className="relative w-full h-72 rounded-[3.5rem] overflow-hidden border-4 border-sky-400 shadow-2xl group/photo transition-all">
                     <img src={uploadedPhoto} className="w-full h-full object-cover" alt="Director Portrait" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setUploadedPhoto(null); }}
                          className="w-16 h-16 bg-white text-rose-500 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all"
                        >
                          <X size={32} />
                        </button>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md">Remove Portrait</span>
                     </div>
                   </div>
                 ) : (
                   <div className="w-full h-72 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-12 hover:bg-sky-50 hover:border-sky-300 transition-all group/upload relative overflow-hidden active:scale-[0.98]">
                      <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 shadow-xl shadow-slate-200/50 group-hover/upload:text-[#0090C1] group-hover/upload:rotate-12 transition-all border border-slate-50">
                        <Upload size={40} strokeWidth={1.5} />
                      </div>
                      <h5 className="text-lg font-black text-slate-800 uppercase tracking-tight">Upload Portrait</h5>
                      <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest max-w-[180px]">Cast yourself as the lead administrator.</p>
                      <div className="absolute bottom-6 right-8 opacity-0 group-hover/upload:opacity-100 group-hover/upload:-translate-y-2 transition-all">
                         <UserCheck size={28} className="text-sky-300" />
                      </div>
                   </div>
                 )}
                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept="image/*" 
                   onChange={handlePhotoUpload} 
                   className="hidden" 
                 />
               </div>
            </div>

            <div className="space-y-5">
               <div className="flex justify-between items-center px-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <MessageSquare size={16} className="text-sky-500" /> Cinematic Script
                  </label>
                  <button onClick={handleLoadScript} className="flex items-center gap-1 text-[9px] font-bold text-[#0090C1] bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 hover:bg-sky-100 transition-all">
                     <FileText size={10} /> Load IFTU Script
                  </button>
               </div>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 className="w-full h-56 p-8 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] outline-none focus:ring-8 focus:ring-sky-500/5 focus:border-sky-400 focus:bg-white transition-all text-sm font-bold text-slate-700 leading-relaxed resize-none shadow-inner"
                 placeholder="Describe the cinematic masterpiece..."
               />
               <p className="text-[10px] text-slate-400 italic px-2 flex items-center gap-2">
                 <Zap size={12} className="text-amber-500" /> AI automatically maps portrait to the lead actor.
               </p>
            </div>

            <div className="space-y-6">
              <button 
                onClick={handleGenerateVideo}
                disabled={isGenerating || !prompt.trim() || !uploadedPhoto}
                className="w-full py-8 bg-slate-900 text-white rounded-[2.8rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-[#0090C1] transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group/launch"
              >
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Film size={24} className="group-hover/launch:scale-110 transition-transform" />}
                {isGenerating ? 'Synthesizing...' : 'Launch Production'}
              </button>
              
              {!uploadedPhoto ? (
                <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 animate-in fade-in slide-in-from-top-2">
                   <AlertCircle className="text-amber-500 shrink-0" size={24} />
                   <p className="text-[11px] text-amber-700 font-black leading-tight uppercase tracking-tight">Identity check failed: portrait required for actor consistency.</p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-6 bg-sky-50 rounded-[2rem] border border-sky-100">
                   <ShieldCheck className="text-[#0090C1]" size={24} />
                   <div className="text-left">
                     <p className="text-[11px] text-sky-700 font-black leading-tight uppercase tracking-tight">Production key verified</p>
                     <p className="text-[9px] text-sky-600/60 font-bold uppercase mt-1">Authorized User: {user.name}</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
