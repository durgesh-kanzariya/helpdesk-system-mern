import { useState } from 'react';
import { LifeBuoy } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Helpdesk System</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Frontend initialized with React, Vite, and Tailwind CSS.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Ready for Step 2
        </div>
      </div>
    </div>
  );
}

export default App;
