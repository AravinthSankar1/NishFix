import React from 'react';
import type { StorageStats } from '../../types';
import { HardDrive, AlertTriangle, CloudCheck } from 'lucide-react';

interface StorageGaugeProps {
  storage?: StorageStats;
  compact?: boolean;
}

export const StorageGauge: React.FC<StorageGaugeProps> = ({ storage, compact = false }) => {
  if (!storage) return null;

  const { totalUsedGB, limitGB, percentageUsed, isR2Configured, bucketName } = storage;
  const isHighUsage = percentageUsed >= 85;
  const isExceeded = percentageUsed >= 100;

  let progressColor = 'bg-indigo-500';
  if (isExceeded) progressColor = 'bg-rose-500';
  else if (isHighUsage) progressColor = 'bg-amber-500';

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
        <HardDrive className="w-4 h-4 text-indigo-400" />
        <div>
          <span className="text-slate-300 font-medium">
            Storage: {totalUsedGB} GB / {limitGB} GB
          </span>
          <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${progressColor}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800/80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Cloudflare R2 Object Storage</h4>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              Bucket: <span className="text-indigo-300 font-mono">{bucketName}</span>
              {isR2Configured ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CloudCheck className="w-3 h-3" /> Live R2
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Dev Local Storage
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-slate-100">{totalUsedGB} GB</span>
          <span className="text-xs text-slate-400"> / {limitGB} GB limit</span>
          <p className="text-xs font-semibold text-indigo-400">{percentageUsed}% Used</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        />
      </div>

      {/* Warning Banners */}
      {isExceeded && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            <strong>Storage Quota Exceeded!</strong> You cannot upload new files until older software ZIP files are deleted or limit is increased.
          </span>
        </div>
      )}

      {isHighUsage && !isExceeded && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Free Tier Warning:</strong> Storage is {percentageUsed}% full. Consider archiving unused software.
          </span>
        </div>
      )}
    </div>
  );
};
