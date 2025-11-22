import React from 'react';

interface SandaProps {
  mood?: 'happy' | 'thinking' | 'excited' | 'waiting';
  size?: 'sm' | 'md' | 'lg';
  speaking?: boolean;
}

export const Sanda: React.FC<SandaProps> = ({ mood = 'happy', size = 'md', speaking = false }) => {
  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }[size];

  // Simple SVG composition for "Sanda" - An Afro-Angolan girl character style
  // Using simple shapes to draw her face.
  return (
    <div className={`relative ${sizeClass} ${speaking ? 'animate-bounce-slow' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        {/* Hair (Puffs) */}
        <circle cx="20" cy="30" r="15" fill="#2d2d2d" />
        <circle cx="80" cy="30" r="15" fill="#2d2d2d" />
        
        {/* Face */}
        <circle cx="50" cy="50" r="30" fill="#8D5524" />
        
        {/* Eyes */}
        <ellipse cx="40" cy="45" rx="3" ry="4" fill="black" />
        <ellipse cx="60" cy="45" rx="3" ry="4" fill="black" />
        <circle cx="41" cy="43" r="1" fill="white" />
        <circle cx="61" cy="43" r="1" fill="white" />

        {/* Cheeks */}
        <circle cx="35" cy="55" r="4" fill="#C68642" opacity="0.6" />
        <circle cx="65" cy="55" r="4" fill="#C68642" opacity="0.6" />

        {/* Mouth */}
        {mood === 'happy' && <path d="M 40 60 Q 50 70 60 60" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />}
        {mood === 'excited' && <path d="M 40 60 Q 50 75 60 60" fill="#5f0a0a" />}
        {mood === 'thinking' && <line x1="45" y1="65" x2="55" y2="65" stroke="black" strokeWidth="2" />}
        {mood === 'waiting' && <circle cx="50" cy="65" r="3" fill="black" />}
        
        {/* Hair Accessories (Colors of Angola flag) */}
        <circle cx="18" cy="28" r="5" fill="#EF4444" /> {/* Red */}
        <circle cx="82" cy="28" r="5" fill="#FFC107" /> {/* Yellow */}

      </svg>
      {speaking && (
         <div className="absolute -top-4 right-0 bg-white p-2 rounded-xl rounded-bl-none text-xs shadow-lg border border-gray-200 animate-pulse">
            Falando... 🔊
         </div>
      )}
    </div>
  );
};