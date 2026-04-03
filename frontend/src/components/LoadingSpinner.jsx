import React from 'react';

const LoadingSpinner = ({ message = "Analyzing document..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg animate-pulse backdrop-blur-sm border border-indigo-500/30"></div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-medium text-slate-200 animate-pulse">{message}</p>
        <p className="text-sm text-slate-400">Our AI models are processing your file</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
