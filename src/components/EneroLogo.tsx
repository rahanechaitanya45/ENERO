import React from 'react';

interface EneroLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const EneroLogo: React.FC<EneroLogoProps> = ({
  variant = 'horizontal',
  showTagline = false,
  className = '',
  size = 'md',
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtitleSizeClasses = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  // High-fidelity SVG recreation of the official ENERO emblem from the financial snapshot:
  // Circular blue frame with electric plug prongs, internal green energy bar chart columns, and a green eco leaf on the right.
  const LogoIcon = (
    <svg 
      className={`${iconSizeClasses[size]} shrink-0`} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Blue Circular Ring */}
      <circle 
        cx="46" 
        cy="50" 
        r="38" 
        stroke="#0b3b82" 
        strokeWidth="6" 
        strokeLinecap="round"
      />

      {/* Electric Plug Cable and Socket Prongs (Deep Blue) */}
      {/* Left Prong */}
      <rect x="36" y="27" width="4.5" height="11" rx="2" fill="#0b3b82" />
      {/* Right Prong */}
      <rect x="51.5" y="27" width="4.5" height="11" rx="2" fill="#0b3b82" />

      {/* Plug Body Arch */}
      <path 
        d="M32 38 C32 35, 60 35, 60 38 L60 48 C60 55, 32 55, 32 48 Z" 
        stroke="#0b3b82" 
        strokeWidth="4" 
        fill="white"
      />
      {/* Cable down */}
      <path 
        d="M46 54 L46 64 C46 69, 36 71, 36 76" 
        stroke="#0b3b82" 
        strokeWidth="4" 
        strokeLinecap="round"
      />

      {/* Internal Energy Meter Bar Chart (Vibrant Green) */}
      <rect x="38" y="44" width="4" height="14" rx="1" fill="#16a34a" />
      <rect x="44" y="40" width="4" height="18" rx="1" fill="#16a34a" />
      <rect x="50" y="36" width="4" height="22" rx="1" fill="#16a34a" />

      {/* Green Eco Leaf branching on the right */}
      <path 
        d="M68 44 C68 28, 86 28, 88 30 C88 46, 74 54, 68 44 Z" 
        fill="#16a34a" 
      />
      <path 
        d="M72 42 C78 37, 83 33, 85 31" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      {/* Secondary smaller leaf bud */}
      <path 
        d="M62 50 C61 44, 70 41, 72 43 C72 48, 66 52, 62 50 Z" 
        fill="#22c55e" 
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {LogoIcon}
        <div className="mt-2 space-y-0.5">
          <span className={`${titleSizeClasses[size]} font-black tracking-tight text-slate-900 block font-sans`}>
            ENERO
          </span>
          <span className={`${subtitleSizeClasses[size]} font-bold tracking-widest uppercase text-slate-600 block`}>
            SMART ENERGY MONITORING
          </span>
          {showTagline && (
            <p className="text-xs text-slate-500 font-medium italic pt-1 text-balance">
              Smarter Monitoring | Lower Bills | A Greener Tomorrow
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default for Navbar / Headers)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {LogoIcon}
      <div className="flex flex-col leading-none">
        <span className={`${titleSizeClasses[size]} font-black tracking-tight text-slate-900 font-sans`}>
          ENERO
        </span>
        <span className={`${subtitleSizeClasses[size]} font-bold tracking-wider uppercase text-slate-500 mt-1`}>
          SMART ENERGY MONITORING
        </span>
        {showTagline && (
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 hidden sm:inline-block">
            Smarter Monitoring · Lower Bills · A Greener Tomorrow
          </span>
        )}
      </div>
    </div>
  );
};
