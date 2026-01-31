
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
  const volumeIntervalRef = useRef<any>(null);

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
      
      // Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setIsLive(true);
            setIsConnecting(false);

            // Setup input processing
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 5)); // Amplify for visual

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
              // Ensure consistent playback timing
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
          onclose: () => {
            console.log('Live session closed');
            stopLiveSession();
          },
          onerror: (e) => {
            console.error('Live session error', e);
            stopLiveSession();
          }
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
    const prompt = `I have successfully completed my high school studies. Please generate my official High School Diploma/Certificate and Final GPA Report.
    
    My Details:
    Name: ${user.name}
    ID: ${user.id}
    Program: Secondary Education (Natural Sciences) - High School
    Cumulative GPA: 3.85 (Distinction)
    Completion Date: November 2024
    
    Please format the output as a professional certificate in Markdown, including:
    1. A congratulatory header.
    2. A structured "High School Diploma" box.
    3. A breakdown of my final GPA.
    4. A closing statement from the IFTU School Board.`;
    
    handleSend(prompt);
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked.parse(content) };
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-sky-500" />
            AI Smart Assistant
          </h2>
          <p className="text-sm text-gray-500 mt-1">Real-time educational insights powered by Gemini & Google Search.</p>
        </div>
        <button
          onClick={isLive ? stopLiveSession : startLiveSession}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
            isLive 
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isLive ? <MicOff size={16} /> : <Mic size={16} />}
          {isLive ? 'End Voice Session' : 'Start Voice Chat'}
        </button>
      </div>

      {isLive || isConnecting ? (
        <div className="flex-1 bg-gradient-to-br from-slate-900 via-[#0090C1] to-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center relative border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
          
          {isConnecting ? (
             <div className="text-center space-y-4 relative z-10">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto" />
                <p className="text-white font-bold tracking-widest uppercase text-sm">Connecting to Gemini Live...</p>
             </div>
          ) : (
             <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-md">
                <div className="relative">
                   {/* Visualizer Rings */}
                   <div 
                     className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-75"
                     style={{ transform: `scale(${1 + volume * 0.5})` }}
                   >
                     <div 
                        className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center transition-all duration-75"
                        style={{ transform: `scale(${1 + volume * 0.3})` }}
                     >
                        <Mic size={48} className="text-white" />
                     </div>
                   </div>
                   {/* Orbiting Particles */}
                   <div className="absolute inset-0 animate-spin-slow opacity-30">
                      <div className="absolute top-0 left-1/2 w-4 h-4 bg-sky-400 rounded-full blur-sm" />
                   </div>
                   <div className="absolute inset-0 animate-reverse-spin opacity-30">
                      <div className="absolute bottom-0 right-1/2 w-3 h-3 bg-indigo-400 rounded-full blur-sm" />
                   </div>
                </div>

                <div className="text-center space-y-2">
                   <h3 className="text-2xl font-black text-white tracking-tight">Listening...</h3>
                   <p className="text-white/60 text-sm font-medium">Speak naturally. IFTU Assistant is active.</p>
                </div>
                
                <div className="flex gap-4">
                   <button onClick={stopLiveSession} className="px-8 py-4 bg-rose-500/20 hover:bg-rose-50 text-white rounded-2xl font-bold uppercase tracking-widest text-xs border border-rose-500/50 transition-all backdrop-blur-sm">
                      Disconnect
                   </button>
                </div>
             </div>
          )}
          
          {/* Waveform Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20 flex items-end justify-center gap-1">
             {Array.from({length: 40}).map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-white rounded-t-full transition-all duration-100"
                  style={{ 
                    height: `${20 + Math.random() * 60 + (volume * 100)}%`,
                    opacity: Math.random()
                  }} 
                />
             ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === 'user' ? 'bg-[#0090C1] text-white' : 'bg-white border border-gray-200 text-[#0090C1]'
                  }`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-5 rounded-2xl shadow-sm relative group ${
                    m.role === 'user' ? 'bg-[#0090C1] text-white rounded-tr-none user-bubble' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                  }`}>
                    <div className="prose-chat" dangerouslySetInnerHTML={renderMarkdown(m.content || (loading && m.role === 'ai' ? '...' : ''))} />
                    {m.role === 'ai' && !m.content && loading && (
                       <div className="flex gap-1 mt-2">
                          <span className="w-1.5 h-1.5 bg-sky-200 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-200"></span>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <QuickAction icon={<Award size={14}/>} label="Final Certificate & GPA" onClick={handleGenerateCertificate} />
              <QuickAction icon={<ExternalLink size={14}/>} label="Latest EdTech News" onClick={() => handleSend('What are the top 5 global educational technology trends in November 2024?')} />
              <QuickAction icon={<Wand2 size={14}/>} label="Analyze Trends" onClick={() => handleSend('Analyze student performance trends for the last semester.')} />
              <QuickAction icon={<BookOpenCheck size={14}/>} label="Syllabus Helper" onClick={() => handleSend('Create a sample 8-week syllabus for a Modern UI/UX course.')} />
            </div>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ask me anything..."
                className="w-full pl-6 pr-24 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0090C1]/20 focus:border-[#0090C1] text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-[#0090C1] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#007ba6] disabled:opacity-50 transition-all shadow-lg shadow-sky-500/10 active:scale-95"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
               <Activity size={12} /> Powered by Gemini 3 Flash & 2.5 Live
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-3 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold hover:bg-sky-100 transition-all whitespace-nowrap border border-sky-100/50">
    {icon} {label}
  </button>
);
