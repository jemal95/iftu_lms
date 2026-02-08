import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Wand2, BookOpenCheck, ExternalLink, Award, Mic, MicOff, X, Activity, Headphones, Loader2 } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { marked } from 'marked';
import { AuthUser } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface AIAssistantProps {
  user: AuthUser;
}

// Audio Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello ${user.name}! I'm your **IFTU LMS Assistant**. \n\nI can help you:\n* Analyze student attendance\n* Draft course syllabuses\n* **Generate your High School Diploma & Transcript**\n* Research latest education news` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    marked.setOptions({ breaks: true, gfm: true });
    return () => stopLiveSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setLoading(true);

    let streamContent = '';
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    const stream = geminiService.getLMSInsightStream(messageToSend);
    
    try {
      for await (const chunk of stream) {
        streamContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = streamContent;
          return newMessages;
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 5));

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onclose: () => stopLiveSession(),
          onerror: () => stopLiveSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are IFTU's friendly voice assistant. Keep answers concise and conversational.`,
        },
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start live session", error);
      setIsConnecting(false);
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    setIsLive(false);
    setIsConnecting(false);
    setVolume(0);
  };

  const handleGenerateCertificate = () => {
    const prompt = `I have successfully completed my high school studies. Please generate my official High School Diploma/Certificate and Final GPA Report. Details: Name: ${user.name}, ID: ${user.id}, GPA: 3.85. Markdown format please.`;
    handleSend(prompt);
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked.parse(content) };
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6 view-transition relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="text-sky-500" />
            AI Smart Assistant
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Institutional Intelligence powered by Google Gemini.</p>
        </div>
        <button
          onClick={isLive ? stopLiveSession : startLiveSession}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${
            isLive 
              ? 'bg-rose-500 text-white shadow-rose-500/30' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isLive ? <MicOff size={16} /> : <Mic size={16} />}
          {isLive ? 'End Session' : 'Voice Chat'}
        </button>
      </div>

      {isLive || isConnecting ? (
        <div className="flex-1 bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center relative border border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0090C122_0%,_transparent_70%)]" />
          
          {isConnecting ? (
             <div className="text-center space-y-4 relative z-10">
                <Loader2 className="w-16 h-16 text-sky-400 animate-spin mx-auto" />
                <p className="text-white font-black tracking-widest uppercase text-xs">Synchronizing Neural Stream...</p>
             </div>
          ) : (
             <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-md">
                <div className="relative">
                   <div 
                     className="w-56 h-56 rounded-full bg-sky-500/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-75 shadow-[0_0_50px_rgba(0,144,193,0.1)]"
                     style={{ transform: `scale(${1 + volume * 0.4})` }}
                   >
                     <div 
                        className="w-40 h-40 rounded-full bg-sky-400/20 flex items-center justify-center transition-all duration-75"
                        style={{ transform: `scale(${1 + volume * 0.2})` }}
                     >
                        <Headphones size={64} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                     </div>
                   </div>
                   <div className="absolute -inset-4 border-2 border-dashed border-sky-500/20 rounded-full animate-spin-slow opacity-50" />
                </div>

                <div className="text-center space-y-2">
                   <h3 className="text-2xl font-black text-white tracking-tight">Listening to your query</h3>
                   <p className="text-sky-400/60 text-sm font-bold uppercase tracking-widest">Aura Sync: {Math.round(volume * 100)}%</p>
                </div>
                
                <button onClick={stopLiveSession} className="px-10 py-5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] border border-rose-500/30 transition-all backdrop-blur-md">
                   End Conversation
                </button>
             </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20 flex items-end justify-center gap-1.5 px-12">
             {Array.from({length: 60}).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-gradient-to-t from-sky-400 to-indigo-500 rounded-t-full transition-all duration-100"
                  style={{ 
                    height: `${15 + Math.random() * 50 + (volume * 150)}%`,
                    opacity: 0.3 + Math.random() * 0.7
                  }} 
                />
             ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col glass-card">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg ${
                    m.role === 'user' ? 'bg-[#0090C1] text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-6 rounded-[2rem] shadow-sm relative ${
                    m.role === 'user' ? 'bg-[#0090C1] text-white user-bubble' : 'bg-white text-slate-700 border border-slate-100 ai-bubble'
                  }`}>
                    <div className="prose-chat" dangerouslySetInnerHTML={renderMarkdown(m.content || (loading && m.role === 'ai' ? '...' : ''))} />
                    {m.role === 'ai' && !m.content && loading && (
                       <div className="flex gap-2 mt-4">
                          <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 border-t border-slate-100 bg-white/50 backdrop-blur-md">
            <div className="flex flex-wrap gap-2 mb-6">
              <QuickAction icon={<Award size={14}/>} label="Diploma Template" onClick={handleGenerateCertificate} />
              <QuickAction icon={<ExternalLink size={14}/>} label="Education Trends" onClick={() => handleSend('Current global trends in EdTech')} />
              <QuickAction icon={<Wand2 size={14}/>} label="GPA Analyzer" onClick={() => handleSend('How can I improve my 3.85 GPA?')} />
            </div>
            <div className="relative group">
              <input 
                type="text"
                placeholder="Ask IFTU AI anything..."
                className="w-full pl-8 pr-28 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-[#0090C1]/5 focus:border-[#0090C1] text-sm font-bold text-slate-700 transition-all shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 px-8 bg-[#0090C1] text-white rounded-[1.6rem] font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-[#007ba6] disabled:opacity-50 transition-all shadow-xl shadow-sky-500/20 btn-elevated"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-sky-300 transition-all shadow-sm">
    {icon} {label}
  </button>
);