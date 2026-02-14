import React from 'react';
import DemoWidget from './components/DemoWidget';
import { LOGO_URL } from './constants';

function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[color:rgb(var(--brand-bg))]">
      
      {/* Ambient Background Gradients (BharatGen Colors: Orange & Blue) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[color:rgb(var(--brand-orange)/0.18)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[color:rgb(var(--brand-blue)/0.14)] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main Container */}
      <div className="w-full max-w-[1200px] flex flex-col gap-6 z-10">
        
        {/* Minimal Header */}
        <div className="flex items-center gap-3 pl-2">
            <img src={LOGO_URL} className="h-8 w-8 object-contain" alt="Logo" />
            <h1 className="text-2xl font-bold text-[color:rgb(var(--brand-ink))] tracking-tight">
              BharatGen <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:rgb(var(--brand-orange))] to-[color:rgb(var(--brand-blue))]">Sooktam 2</span>
            </h1>
        </div>

        {/* The Component */}
        <div className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden border border-white">
           <DemoWidget />
        </div>

      </div>

    </div>
  );
}

export default App;
