import React from 'react';
import ConversationList from './ConversationList';
import { useAuth } from '@/context/AuthContext';
import Avatar from './Avatar';

interface SidebarProps {
  onNewChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const { user, logout } = useAuth();

  return (
    <div className="w-[350px] min-w-[350px] h-full bg-sidebar-bg flex flex-col border-r border-white/5">
      {/* Top Bar */}
      <div className="h-[60px] px-4 flex items-center justify-between bg-sidebar-bg z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-sidebar-bg rounded-full animate-pulse-slow" />
          </div>
          <span className="text-text-primary font-bold text-lg tracking-tight">WhisperBox</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-text-secondary hover:bg-input-bg rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          <button 
            onClick={onNewChat}
            className="p-2 text-primary hover:bg-input-bg rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 6.25a.75.75 0 01.75.75v4.25H17a.75.75 0 010 1.5h-4.25V17a.75.75 0 01-1.5 0v-4.25H7a.75.75 0 010-1.5h4.25V7a.75.75 0 01.75-.75z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="bg-input-bg flex items-center gap-3 px-4 py-1.5 rounded-xl group focus-within:ring-1 focus-within:ring-primary/30 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search conversations..."
            className="bg-transparent text-text-primary text-sm w-full outline-none placeholder:text-text-secondary/50"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ConversationList />
      
      {/* Bottom Profile / Settings */}
      <div className="h-[70px] px-4 flex items-center justify-between border-t border-white/5 bg-sidebar-bg/50 mt-auto">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar name={user?.display_name || "Me"} size="md" />
          <div className="flex flex-col min-w-0">
            <span className="text-text-primary text-sm font-medium truncate">{user?.display_name || "My Account"}</span>
            <span className="text-[10px] text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Secure Session
            </span>
          </div>
        </div>
        <button 
          onClick={logout}
          title="Logout"
          className="p-2 text-text-secondary hover:text-primary transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
