import React from 'react';
import type { SoftwareStatus } from '../../types';
import { CheckCircle2, Clock, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: SoftwareStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Published
        </span>
      );
    case 'DRAFT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Draft
        </span>
      );
    case 'ARCHIVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 ${className}`}
        >
          <Archive className="w-3.5 h-3.5 text-zinc-400" />
          Archived
        </span>
      );
    default:
      return null;
  }
};
