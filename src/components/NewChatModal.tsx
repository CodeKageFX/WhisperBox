"use client";

import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { useChat } from '@/context/ChatContext';
import { UserPublicInfo } from '@/app/types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { searchUsers, startNewConversation } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserPublicInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await searchUsers(query);
        setResults(users);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  if (!isOpen) return null;

  const handleSelectUser = (user: UserPublicInfo) => {
    startNewConversation(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="bg-sidebar-bg w-full max-w-[400px] rounded-2xl shadow-2xl border border-white/5 z-10 overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-text-primary font-bold text-lg">New Chat</h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-input-bg rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-input-bg flex items-center gap-3 px-4 py-2.5 rounded-xl group focus-within:ring-2 focus-within:ring-primary/30 transition-all mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 transition-colors ${isSearching ? 'text-primary animate-pulse' : 'text-text-secondary group-focus-within:text-primary'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a user by username..."
              className="bg-transparent text-text-primary text-[15px] w-full outline-none placeholder:text-text-secondary/50"
              autoFocus
            />
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-1">
            {results.length > 0 ? (
              results.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-input-bg/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.display_name} size="md" />
                    <div className="flex flex-col">
                      <span className="text-text-primary font-medium text-[15px]">{user.display_name}</span>
                      <span className="text-text-secondary text-[12px]">@{user.username}</span>
                    </div>
                  </div>
                  
                  <button className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all transform active:scale-95">
                    Start Chat
                  </button>
                </div>
              ))
            ) : query.trim() && !isSearching ? (
              <div className="p-8 text-center text-text-secondary/50 text-sm italic">
                No users found matching &quot;{query}&quot;
              </div>
            ) : !query.trim() ? (
              <div className="p-8 text-center text-text-secondary/50 text-sm">
                Search for someone to start a secure conversation.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
