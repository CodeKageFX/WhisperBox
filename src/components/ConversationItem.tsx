import React from 'react';
import Avatar from './Avatar';

interface ConversationItemProps {
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isActive?: boolean;
  onClick?: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  name,
  lastMessage,
  time,
  unreadCount = 0,
  isActive = false,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 px-4 cursor-pointer transition-colors duration-150 relative group ${isActive ? 'bg-input-bg' : 'hover:bg-input-bg/50'}`}>
      <Avatar name={name} size="lg" />
      
      <div className="flex-1 min-w-0 border-b border-white/5 py-3 pr-1 group-last:border-none">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="text-text-primary font-medium truncate">{name}</h3>
          <span className={`text-[11px] ${unreadCount > 0 ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
            {time}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-text-secondary truncate flex items-center gap-1.5">
            <span className="opacity-70">🔒</span>
            <span className="italic">{lastMessage}</span>
          </p>
          
          {unreadCount > 0 && (
            <div className="bg-primary text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 animate-in zoom-in duration-300">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-full" />
      )}
    </div>
  );
};

export default ConversationItem;
