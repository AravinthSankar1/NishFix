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
  CircuitBoard,
} from 'lucide-react';
import technicianHero from '../assets/technician-hero.jpg';

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
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Tested <span className="text-red-500">File</span> Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage mobile repair software, update direct download mirrors, and publish firmware &amp; schematics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFormModalOpen(true)}
            className="skillby-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Software Package</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading dashboard statistics...</p>
        </div>
      )}

      {isError && (
        <div className="p-6 glass-card rounded-2xl border border-rose-500/30 text-center">
          <p className="text-sm text-rose-300">Could not connect to backend server or database.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 skillby-gradient-btn px-4 py-2 text-white text-xs font-bold rounded-xl"
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
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{stats.totalSoftware}</div>
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

            <div className="glass-card p-5 rounded-2xl border border-sky-500/20 bg-sky-500/5">
              <div className="flex items-center justify-between text-sky-400 mb-2">
                <span className="text-xs font-semibold">Downloads</span>
                <Download className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-extrabold text-sky-300">
                {stats.totalDownloads.toLocaleString()}
              </div>
              <p className="text-[11px] text-sky-400/80 mt-1">Total ZIP downloads</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-center justify-between text-red-400 mb-2">
                <span className="text-xs font-semibold">Brands</span>
                <Smartphone className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-extrabold text-red-300">{stats.totalBrands}</div>
              <p className="text-[11px] text-red-400/80 mt-1">Device manufacturers</p>
            </div>
          </div>

          {/* QUICK LINKS & RECENT SOFTWARE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CircuitBoard className="w-4 h-4 text-sky-400" /> Recent Software Packages
                </h3>
                <Link
                  to="/admin/software"
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  Manage All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentSoftware.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No software packages created yet. Click "Add Software Package" to get started.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {recentSoftware.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-200 truncate">
                            {item.softwareName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.version}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className="font-medium text-sky-400">{item.brand}</span>
                          <span>•</span>
                          <span>{item.model}</span>
                          <span>•</span>
                          <span>{item.downloadCount} downloads</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTION CARDS */}
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Quick Actions</h3>
                <p className="text-xs text-slate-400">
                  Upload firmware files, manage categories, and customize mirror links.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setIsFormModalOpen(true)}
                    className="w-full skillby-gradient-btn py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Add New Firmware / Tool
                  </button>

                  <Link
                    to="/admin/software"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-sky-400" /> View Software Catalog
                  </Link>

                  <Link
                    to="/"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    View Public Portal
                  </Link>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
                <div className="relative h-52 overflow-hidden bg-slate-950">
                  <img
                    src={technicianHero}
                    alt="Tested File Lab Technician"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-[11px] font-bold text-white flex items-center justify-between">
                    <span>Hardware Diagnostics Lab</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-600/90 text-white font-mono">Live</span>
                  </div>
                </div>
                <div className="p-4 space-y-1 text-xs text-slate-400">
                  <p className="font-semibold text-slate-200">Tested File Storage Engine</p>
                  <p className="text-[11px] leading-relaxed">
                    All uploaded ROMs, schematics, and dump files are lab-tested on real handsets.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/20 to-sky-950/20 border border-red-500/20 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-red-400" /> Tested File Lab Server
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fast presigned uploads directly route to Cloudflare R2 object storage to ensure zero server memory usage for large firmware ZIPs.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      {isFormModalOpen && (
        <SoftwareFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={() => {
            setIsFormModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};
