import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, FileDigit } from 'lucide-react';

const UploadSection = ({ onUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [base64Input, setBase64Input] = useState('');
  const [mode, setMode] = useState('file'); // 'file' or 'base64'
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.type)) {
      setFile(file);
    } else {
      alert('Invalid file type. Please upload PDF, DOCX, or Image (PNG/JPG).');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (mode === 'file' && file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        onUpload({
          fileName: file.name,
          fileType: file.name.split('.').pop().toLowerCase(),
          fileBase64: reader.result
        });
      };
    } else if (mode === 'base64' && base64Input) {
      onUpload({
        fileName: 'Pasted Content',
        fileType: 'pdf', // Default assume PDF for pasted base64 if not specified
        fileBase64: base64Input
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 w-fit mx-auto">
        <button 
          onClick={() => setMode('file')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'file' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          File Upload
        </button>
        <button 
          onClick={() => setMode('base64')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'base64' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Base64 Paste
        </button>
      </div>

      {mode === 'file' ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group cursor-pointer transition-all duration-300 rounded-2xl border-2 border-dashed 
            ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
            accept=".pdf,.docx,.png,.jpg,.jpeg"
          />
          
          <div className="p-12 flex flex-col items-center text-center space-y-4" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            
            {file ? (
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-200">{file.name}</p>
                <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-200">Drag & drop document here</p>
                <p className="text-sm text-slate-400">Supports PDF, DOCX, PNG, JPG (Max 10MB)</p>
              </div>
            )}
          </div>

          {file && (
            <button 
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder="Paste Base64 string here (with or without data:application/pdf;base64 prefix)..."
              className="w-full min-h-[200px] p-4 rounded-2xl bg-slate-900/40 border-2 border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-300 placeholder:text-slate-600 transition-all font-mono text-xs overflow-y-auto"
            />
            {base64Input && (
              <button 
                onClick={() => setBase64Input('')}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || (mode === 'file' ? !file : !base64Input)}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-xl
          ${isLoading || (mode === 'file' ? !file : !base64Input) 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99]'}`}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            <span>Analyze Document</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-6 text-slate-500">
         <div className="flex items-center gap-1.5">
           <FileDigit className="w-4 h-4" />
           <span className="text-xs uppercase tracking-widest font-semibold">Verified AI Pipeline</span>
         </div>
         <div className="flex items-center gap-1.5">
           <AlertCircle className="w-4 h-4" />
           <span className="text-xs uppercase tracking-widest font-semibold">Secure Extraction</span>
         </div>
      </div>
    </div>
  );
};

export default UploadSection;
