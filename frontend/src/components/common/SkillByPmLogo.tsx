import React from 'react';
import { siteConfig } from '../../config/site';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
}

export const TestedFileLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = '',
  subtitle,
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10', text: 'text-lg', sub: 'text-[11px]' },
    lg: { img: 'w-12 h-12', text: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${currentSize.img} shrink-0 rounded-xl bg-slate-900/90 border border-red-500/30 p-1 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:border-red-500/50 transition-all`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-sky-500/10 rounded-xl blur-xs pointer-events-none" />
        <img
          src="/logo.png"
          alt={`${siteConfig.brandName} Logo`}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)] transform group-hover:scale-105 transition-transform"
        />
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-white ${currentSize.text} ${textClassName}`}>
              <span className="text-white">Tested</span>
              <span className="text-red-500 font-black ml-1.5">File</span>
            </span>
          </div>
          <p className={`text-slate-400 font-medium ${currentSize.sub}`}>
            {subtitle ?? siteConfig.brandSubtitle}
          </p>
        </div>
      )}
    </div>
  );
};
