import React from 'react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg relative border-l border-white/5">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://whatsapp-clone-nextjs.vercel.app/chat-bg.png')] opacity-[0.04] pointer-events-none" />
      
      <div className="max-w-md text-center px-8 z-10 animate-in fade-in zoom-in duration-700">
        <div className="relative mb-8 flex justify-center">
          <div className="w-24 h-24 bg-sidebar-bg rounded-full flex items-center justify-center border border-white/5 shadow-2xl relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-primary opacity-80">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary border-4 border-chat-bg rounded-full animate-pulse-slow" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">WhisperBox Desktop</h1>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          Select a conversation to start messaging securely. <br />
          Your messages are protected by industry-standard encryption.
        </p>
        
        <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-8">
          <div className="flex items-center gap-2 text-text-secondary text-[13px] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-text-secondary/30 text-[11px] uppercase tracking-widest font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
        WhisperBox Secure
      </div>
    </div>
  );
};

export default EmptyState;
