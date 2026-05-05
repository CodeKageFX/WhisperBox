"use client";

import React, { useEffect, useRef } from 'react';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

const ChatWindow = () => {
  const { activeConversation, messages, isLoadingMessages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!activeConversation) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-chat-bg relative">
      
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://whatsapp-clone-nextjs.vercel.app/chat-bg.png')] opacity-[0.06] pointer-events-none" />

      {/* Header */}
      <div className="h-[60px] px-4 flex items-center justify-between bg-sidebar-bg z-10 border-l border-white/5 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer">
          <Avatar name={activeConversation.display_name} size="md" />
          <div className="flex flex-col">
            <span className="text-text-primary font-medium text-[15px]">{activeConversation.display_name}</span>
            <span className="text-[11px] text-green-500 font-medium">🔒 End-to-end encrypted</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-text-secondary">
          <button className="hover:text-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          <button className="hover:text-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col z-0">
        <div className="flex justify-center mb-6">
          <div className="bg-[#182229] rounded-lg px-4 py-2 text-center text-[12px] text-text-secondary/80 max-w-[80%] border border-white/5">
             🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhisperBox, can read them.
          </div>
        </div>

        {isLoadingMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             <span className="text-xs text-text-secondary italic">Fetching secure messages...</span>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id}
                isSent={msg.from_user_id === user?.id} 
                text={msg.text} 
                time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                status={msg.delivered ? 'delivered' : 'sent'}
              />
            ))}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
