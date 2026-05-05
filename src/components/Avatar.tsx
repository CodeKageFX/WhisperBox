import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 'md', 
  className = '', 
  color 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-cyan-500'
  ];

  // Simple hash to consistently pick a color based on name
  const getColor = (name: string) => {
    if (color) return color;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-medium shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
