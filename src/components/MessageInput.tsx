"use client";

import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';

const MessageInput = () => {
  const [text, setText] = useState('');
  const { sendMessage } = useChat();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(text);
      setText('');
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="min-h-[62px] px-4 py-2 bg-sidebar-bg flex items-center gap-3 border-l border-white/5 shadow-inner"
    >
      <button type="button" className="p-2 text-text-secondary hover:text-text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      <button type="button" className="p-2 text-text-secondary hover:text-text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <div className="flex-1">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full bg-input-bg text-text-primary text-[15px] border-none rounded-xl py-2.5 px-4 focus:outline-none placeholder:text-text-secondary/50"
        />
      </div>

      <button 
        type="submit"
        disabled={!text.trim() || isSending}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
          !text.trim() || isSending 
            ? 'bg-white/5 text-text-secondary/30 cursor-not-allowed' 
            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
        }`}
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        )}
      </button>
    </form>
  );
};

export default MessageInput;
