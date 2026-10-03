import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminSoftwareApi } from '../services/api';
import { SoftwareFormModal } from '../components/software/SoftwareFormModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  Download,
  Smartphone,
  Plus,
  ArrowRight,
  RefreshCw,
  Loader2,
  Wrench,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminSoftwareApi.getDashboardStats,
  });

  const { data: recentSoftwareResponse } = useQuery({
    queryKey: ['admin-recent-software'],
    queryFn: () => adminSoftwareApi.listSoftware({ limit: 5 }),
  });

  const recentSoftware = recentSoftwareResponse?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Shop Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage phone repair software, update download URLs, and publish firmware updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Software Package</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading dashboard statistics...</p>
        </div>
      )}

      {isError && (
        <div className="p-6 glass-card rounded-2xl border border-rose-500/30 text-center">
          <p className="text-sm text-rose-300">Could not connect to backend server or database.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      )}

      {!isLoading && !isError && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Items</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-100">{stats.totalSoftware}</div>
              <p className="text-[11px] text-slate-400 mt-1">In software library</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-semibold">Published</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-300">{stats.publishedCount}</div>
              <p className="text-[11px] text-emerald-400/80 mt-1">Publicly downloadable</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-semibold">Drafts</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-300">{stats.draftCount}</div>
              <p className="text-[11px] text-amber-400/80 mt-1">Hidden work-in-progress</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Archived</span>
                <Archive className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-300">{stats.archivedCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Legacy versions</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <span className="text-xs font-semibold">Downloads</span>
                <Download className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-300">
                {stats.totalDownloads.toLocaleString()}
              </div>
              <p className="text-[11px] text-indigo-400/80 mt-1">Total ZIP downloads</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
              <div className="flex items-center justify-between text-cyan-400 mb-2">
                <span className="text-xs font-semibold">Brands</span>
                <Smartphone className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-cyan-300">{stats.totalBrands}</div>
              <p className="text-[11px] text-cyan-400/80 mt-1">Mobile brands</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-400" />
                  Recently Updated Software Packages
                </h3>
                <p className="text-xs text-slate-400">Latest firmware & repair tool packages</p>
              </div>

              <Link
                to="/admin/software"
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Manage All Software</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Software Name</th>
                    <th className="py-3 px-4">Brand / Model</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentSoftware.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {item.softwareName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.brand} • <span className="text-slate-400">{item.model}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300">{item.version}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {(item.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {item.downloadCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <SoftwareFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
