import React from 'react';
import { Link } from 'react-router-dom';
import type { Software } from '../../types';
import { Download, HardDrive, Smartphone, Cpu, ArrowRight } from 'lucide-react';

interface SoftwareCardProps {
  software: Software;
}

export const SoftwareCard: React.FC<SoftwareCardProps> = ({ software }) => {
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBrandColor = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('samsung')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (b.includes('xiaomi') || b.includes('mi')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (b.includes('apple') || b.includes('iphone')) return 'bg-zinc-300/10 text-zinc-200 border-zinc-400/30';
    if (b.includes('oppo') || b.includes('realme')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (b.includes('vivo')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group">
      <div className="relative h-44 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden border-b border-slate-800/80 flex items-center justify-center">
        {software.imageUrl ? (
          <img
            src={software.imageUrl}
            alt={software.softwareName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Smartphone className="w-7 h-7 text-indigo-400" />
            </div>
            <span className="text-xs font-mono text-slate-400">{software.brand}</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getBrandColor(software.brand)}`}>
            {software.brand}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
            {software.version}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>{software.model}</span>
          </div>

          <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {software.softwareName}
          </h3>

          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {software.description || 'Official phone repair firmware & service tool archive.'}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatFileSize(software.fileSize)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{software.downloadCount.toLocaleString()} downloads</span>
            </div>
          </div>

          <Link
            to={`/software/${software.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500 transition-all duration-200 shadow-sm"
          >
            <span>View Details & Download</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
