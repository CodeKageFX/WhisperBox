import React from 'react';
import ConversationItem from './ConversationItem';
import { useChat } from '@/context/ChatContext';

const ConversationList = () => {
  const { conversations, activeConversation, setActiveConversation, isLoadingConversations } = useChat();

  if (isLoadingConversations) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="opacity-20 pointer-events-none p-4 space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-2 w-24 bg-white/10 rounded" />
                <div className="h-2 w-full bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-text-secondary/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </div>
        <h3 className="text-text-primary font-medium text-sm">No conversations yet</h3>
        <p className="text-text-secondary text-xs mt-1">Start a new chat to begin messaging securely.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <ConversationItem 
          key={conv.user_id}
          name={conv.display_name}
          lastMessage={conv.last_message_at ? "Encrypted message" : "New conversation"}
          time={conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
          unreadCount={0}
          isActive={activeConversation?.user_id === conv.user_id}
          onClick={() => setActiveConversation(conv)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
