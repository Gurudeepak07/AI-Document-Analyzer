import React, { useState } from 'react';
import axios from 'axios';
import { Brain, Sparkles, RefreshCcw } from 'lucide-react';
import UploadSection from './components/UploadSection';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const API_KEY = 'AIzaSyBQDqohcHRcGEaF-Q22LrZAnEYce5q1pe0';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDocumentUpload = async ({ fileName, fileType, fileBase64 }) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post('/api/document-analyze', {
        fileName,
        fileType,
        fileBase64
      }, {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      setResults(response.data);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to analyze document. Please check the backend connection.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full gradient-bg overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background blobs for aesthetics */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto px-6 py-12 lg:py-20 flex flex-col items-center">
        {/* Header */}
        <header className="mb-16 text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Advanced Transformers
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            AI Document <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Analysis</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Extract insights from documents in seconds. Upload a PDF, DOCX or image and let our AI models summarize, extract entities, and analyze sentiment for you.
          </p>
        </header>

        {/* Content Section */}
        <div className="w-full">
          {!results && !isLoading && (
            <UploadSection onUpload={handleDocumentUpload} isLoading={isLoading} />
          )}

          {isLoading && <LoadingSpinner />}

          {error && (
            <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4">
               <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                 <RefreshCcw className="w-6 h-6 text-rose-400" />
               </div>
               <div className="space-y-1">
                 <h3 className="text-lg font-bold text-rose-400">Analysis Failed</h3>
                 <p className="text-slate-400">{error}</p>
               </div>
               <button 
                onClick={reset}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-semibold"
               >
                 Try Again
               </button>
            </div>
          )}

          {results && !isLoading && (
            <div className="space-y-8">
              <ResultDisplay results={results} />
              <div className="flex justify-center">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all border border-white/5 active:scale-95"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Analyze Another Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sub-features */}
        {!results && !isLoading && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            {[
              { icon: <Brain className="text-indigo-400" />, title: "NLP Engine", desc: "Using BART and T5 transformer models for high-accuracy summarization." },
              { icon: <Sparkles className="text-purple-400" />, title: "NER Extraction", desc: "Identify persons, organizations, and monetary values automatically." },
              { icon: <RefreshCcw className="text-emerald-400" />, title: "OCR Integration", desc: "State-of-the-art text extraction from images and scanned PDFs." }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl glass-morphism space-y-4 hover:translate-y-[-4px] transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {f.icon}
                </div>
                <h4 className="font-bold text-white uppercase tracking-wider text-sm">{f.title}</h4>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="w-full py-12 border-t border-white/5 mt-20">
        <div className="container mx-auto px-6 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.3em]">
          Built with React & Python FastAPI • 2026 Production Ready
        </div>
      </footer>
    </div>
  );
}

export default App;
