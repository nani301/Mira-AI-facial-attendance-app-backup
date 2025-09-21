import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="animate-splash-sequence">
        {/* 
          USER: To use your own image, replace the SVG below with an <img> tag like this:
          <img src="/path/to/your/image.png" alt="App Logo" className="w-32 h-32" />
        */}
        <div className="bg-indigo-500/30 rounded-2xl p-6 border border-indigo-500/50" style={{ filter: 'drop-shadow(0 0 2rem #4f46e5)' }}>
            <svg className="w-24 h-24 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"></path>
            </svg>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
