import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Root Error Boundary
 * Prevents the entire application from crashing on a single component failure.
 */
interface GlobalErrorBoundaryProps {
  children?: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public state: GlobalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical IFTU LMS Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 font-sans">
          <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-4">Core Integrity Failure</h1>
          <p className="text-slate-400 text-center max-w-md leading-relaxed mb-8">
            The IFTU environment encountered a non-recoverable runtime error. 
            Local state data has been preserved, but the view layer must be reset.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-[#0090C1] hover:bg-[#007ba6] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-sky-500/20"
          >
            Restart Environment
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

/**
 * Main Application Bootstrap
 */
const bootstrap = () => {
  // Professional console ident
  console.info(
    "%c IFTU LMS v2.5.2 %c PRODUCTION PORTAL ACCESS GRANTED ",
    "color: white; background: #0090C1; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;",
    "color: #0090C1; background: #0f172a; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;"
  );

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Bootstrap Aborted: DOM anchor 'root' not found.");
  }

  // Clear pre-load animations or artifacts
  if (rootElement.hasChildNodes()) {
    rootElement.innerHTML = '';
  }

  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
};

// Start application
try {
  bootstrap();
} catch (err) {
  console.error("FATAL: Application bootstrap failed.", err);
}