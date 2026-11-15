import React from 'react';
import { TestedFileLogo } from '../common/SkillByPmLogo';
import { siteConfig } from '../../config/site';
import {
  MapPin,
  PhoneCall,
  Mail,
  CircuitBoard,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const hasContact = siteConfig.phone1 || siteConfig.whatsapp || siteConfig.email;

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 text-slate-400">
      {/* CTA Banner – only if contact info exists */}
      {hasContact && (
        <div className="border-b border-slate-800/80 py-8 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Join the {siteConfig.brandName} Community</h3>
                <p className="text-xs text-slate-400">
                  Connect with mobile repair technicians and access tested firmware and schematics.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {siteConfig.whatsapp && (
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="skillby-red-btn px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  WhatsApp <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {siteConfig.phone1 && (
                <a
                  href={`tel:${siteConfig.phone1}`}
                  className="skillby-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call: {siteConfig.phone1}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <TestedFileLogo size="md" subtitle={siteConfig.brandTagline} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional mobile phone repair software &amp; firmware library. Download tested ROM flashing tools, unbrick utilities, and repair packages via high-speed direct download links.
            </p>

            {(siteConfig.addressFull || siteConfig.phone1 || siteConfig.email) && (
              <div className="space-y-2 text-xs text-slate-300 pt-2">
                {siteConfig.addressFull && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{siteConfig.addressFull}</span>
                  </div>
                )}
                {siteConfig.phone1 && (
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{siteConfig.phone1}{siteConfig.phone2 ? ` / ${siteConfig.phone2}` : ''}</span>
                  </div>
                )}
                {siteConfig.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{siteConfig.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Software Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <CircuitBoard className="w-4 h-4 text-sky-400" /> Software Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">• Official Tested Flash ROMs</li>
              <li className="hover:text-white transition-colors cursor-pointer">• Schematic Diagrams &amp; Bitmaps</li>
              <li className="hover:text-white transition-colors cursor-pointer">• eMMC &amp; UFS Dump Files</li>
              <li className="hover:text-white transition-colors cursor-pointer">• FRP Bypass Utilities</li>
              <li className="hover:text-white transition-colors cursor-pointer">• EDL 9008 &amp; ISP Tools</li>
            </ul>
          </div>

          {/* Col 3: Platform Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" /> Quality Standards
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Virus &amp; Malware Scanned
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Lab-Tested on Real Handsets
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> High-Speed Cloud Mirrors
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Regular Database Updates
              </li>
            </ul>
          </div>

          {/* Col 4: Supported Chipsets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> Supported Chipsets
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>• Qualcomm Snapdragon (QFIL / EDL 9008)</li>
              <li>• MediaTek (SP Flash Tool / BROM)</li>
              <li>• Exynos (Samsung Odin 4-File)</li>
              <li>• Apple A-Series / M-Series (DFU)</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-slate-300 cursor-pointer">Terms &amp; Conditions</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
