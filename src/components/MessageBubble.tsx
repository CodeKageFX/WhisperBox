import React from 'react';

interface MessageBubbleProps {
  text: string;
  time: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  time,
  isSent,
  status = 'read'
}) => {
  return (
    <div className={`flex w-full mb-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] px-3 py-2 rounded-xl shadow-sm relative group animate-in slide-in-from-bottom-2 duration-300 ${
          isSent 
            ? 'bg-sent-bubble text-text-primary rounded-tr-none' 
            : 'bg-received-bubble text-text-primary rounded-tl-none'
        }`}
      >
        <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{text}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-60 font-medium">{time}</span>
          {isSent && (
            <span className={`text-[10px] ${status === 'read' ? 'text-[#53bdeb]' : 'text-text-secondary'}`}>
              {status === 'sent' ? '✓' : '✓✓'}
            </span>
          )}
        </div>
        
        {/* Triangle arrow */}
        <div 
          className={`absolute top-0 w-2 h-2 ${
            isSent 
              ? 'right-[-8px] border-l-8 border-l-sent-bubble border-b-8 border-b-transparent' 
              : 'left-[-8px] border-r-8 border-r-received-bubble border-b-8 border-b-transparent'
          }`}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
