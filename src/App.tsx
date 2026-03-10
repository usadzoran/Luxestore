import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Hand, ArrowRightLeft } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center text-center"
      >
        {/* App Name */}
        <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">
          Sign <span className="text-indigo-600">Bridge</span>
        </h1>
        <p className="text-slate-500 font-medium mb-8">Communication without boundaries</p>

        {/* Hero Image */}
        <div className="relative w-full aspect-square max-w-[320px] mb-12">
          <div className="absolute inset-0 bg-indigo-600 rounded-[40px] rotate-6 opacity-10" />
          <img 
            src="https://picsum.photos/seed/signlanguage/800/800" 
            alt="Two men communicating with sign language" 
            referrerPolicy="no-referrer"
            className="relative z-10 w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white"
          />
          {/* Floating Icon */}
          <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl z-20">
            <Hand className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <button className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            <Hand className="w-6 h-6" />
            Sign to Text
            <ArrowRightLeft className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>

          <button className="group w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 py-5 px-8 rounded-2xl font-bold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Text to Signs
            <ArrowRightLeft className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-slate-400 text-sm font-medium uppercase tracking-widest">
          Empowering Conversations
        </p>
      </motion.div>
    </div>
  );
}

export default App;
