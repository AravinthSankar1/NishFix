import React from 'react';
import { Wrench, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-100">FixTech Hub Software Library</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Private, high-performance software and firmware repository for mobile phone technicians. Organize, manage, and download Samsung, Xiaomi, Apple, Oppo, Vivo, and MediaTek repair packages via direct download links.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" /> System Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Direct mirror download hyperlinks</li>
              <li>JWT authenticated admin portal</li>
              <li>Lightweight server deployment</li>
              <li>PostgreSQL metadata indexing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> Supported Chipsets
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Qualcomm Snapdragon (QFIL / EDL 9008)</li>
              <li>MediaTek (SP Flash Tool / BROM)</li>
              <li>Exynos (Samsung Odin 4-File Firmware)</li>
              <li>Apple A-Series / M-Series (DFU Mode)</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mobile Repair Software Library. Built for Phone Technicians.</p>
        </div>
      </div>
    </footer>
  );
};
