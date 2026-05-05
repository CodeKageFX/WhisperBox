"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import EmptyState from '@/components/EmptyState';
import NewChatModal from '@/components/NewChatModal';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeConversation } = useChat();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl" />
          <span className="text-text-secondary text-sm font-medium">WhisperBox is waking up...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="flex h-screen w-screen bg-brand-bg text-text-primary overflow-hidden">
      {/* Sidebar Panel */}
<div className={`flex flex-col border-r border-white/5 md:w-[350px] shrink-0
    ${activeConversation ? 'hidden md:flex' : 'flex w-full'}`}>
    <Sidebar onNewChat={() => setIsNewChatModalOpen(true)} />
</div>

<div className={`flex-1 flex flex-col min-w-0
    ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
    {activeConversation ? <ChatWindow /> : <EmptyState />}
</div>

      {/* Modal Overlays */}
      <NewChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)} 
      />
    </main>
  );
}
