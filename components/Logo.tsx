
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`${dimensions[size]} ${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        {/* Background Shield/Circle */}
        <path d="M50 5C25.147 5 5 25.147 5 50C5 74.853 25.147 95 50 95C74.853 95 95 74.853 95 50C95 25.147 74.853 5 50 5Z" fill="url(#logo-gradient)" />
        
        {/* Stylized Open Book & J Path */}
        <path d="M30 65C30 65 40 60 50 60C60 60 70 65 70 65V45C70 45 60 40 50 40C40 40 30 45 30 45V65Z" fill="white" />
        <path d="M50 70V40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        
        {/* The 'J' Hook */}
        <path d="M50 40C50 40 45 35 40 35C35 35 32 38 32 42" stroke="white" strokeWidth="4" strokeLinecap="round" />
        
        {/* Rising Star/Sun (Jannat Theme) */}
        <circle cx="50" cy="25" r="6" fill="#F59E0B" className="animate-pulse" />
        <path d="M50 15V18M50 32V35M40 25H43M57 25H60M43 18L45 20M55 30L57 32M43 32L45 30M55 20L57 18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        
        <defs>
          <linearGradient id="logo-gradient" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
