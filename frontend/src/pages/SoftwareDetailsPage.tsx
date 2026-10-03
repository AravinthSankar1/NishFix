import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicSoftwareApi } from '../services/api';
import {
  Download,
  HardDrive,
  Cpu,
  Smartphone,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  FileArchive,
  Layers,
  Wrench,
} from 'lucide-react';

export const SoftwareDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const {
    data: software,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['software-detail', id],
    queryFn: () => publicSoftwareApi.getSoftwareById(id || ''),
    enabled: Boolean(id),
  });

  const handleDownload = async () => {
    if (!id) return;
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      const result = await publicSoftwareApi.requestDownloadUrl(id);

      if (result.downloadUrl && result.downloadUrl.startsWith('http')) {
        window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.setAttribute('download', result.fileName || 'software.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(true);
      refetch();
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'Failed to open download link.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading software details...</p>
      </div>
    );
  }

  if (isError || !software) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center glass-card rounded-2xl border border-rose-500/20 my-12">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-100">Software Package Not Available</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          The requested software entry could not be found or is currently not published.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Software Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-indigo-400" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {software.brand}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Version {software.version}
              </span>
              {software.category && (
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300">
                  {software.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {software.softwareName}
            </h1>

            <div className="flex items-center gap-2 text-sm text-indigo-300 font-semibold mt-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Mobile Model: {software.model}</span>
            </div>
          </div>

          {software.imageUrl && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 h-72 sm:h-96 relative bg-slate-950">
              <img
                src={software.imageUrl}
                alt={software.softwareName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
              <FileArchive className="w-4 h-4" /> Description & Repair Function
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {software.description || 'Official repair software and firmware archive for phone repair technicians.'}
            </p>

            {software.additionalInfo && (
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" /> Repair & Flashing Instructions
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {software.additionalInfo}
                </p>
              </div>
            )}

            {software.compatibility && (
              <div className="mt-4 flex items-center gap-2 text-xs text-cyan-300 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Compatibility:</strong> {software.compatibility}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Download Actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 glow-blue sticky top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <FileArchive className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-mono">Original Archive File</span>
                <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{software.originalFileName}</h4>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 border-y border-slate-800/80 py-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> File Size:
                </span>
                <span className="font-bold text-slate-100">{formatFileSize(software.fileSize)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Total Downloads:
                </span>
                <span className="font-bold text-emerald-400">{software.downloadCount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Uploaded Date:
                </span>
                <span className="font-medium text-slate-300">{formatDate(software.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Host Access:
                </span>
                <span className="font-medium text-cyan-300">Direct Download Mirror URL</span>
              </div>
            </div>

            {/* PRIMARY DOWNLOAD BUTTON */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-4 px-6 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:opacity-95 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Opening Download Link...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>DOWNLOAD SOFTWARE PACKAGE</span>
                </>
              )}
            </button>

            {downloadError && (
              <p className="mt-3 text-xs text-rose-400 text-center font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {downloadError}
              </p>
            )}

            {downloadSuccess && (
              <div className="mt-3 text-xs text-emerald-400 text-center font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Redirecting to download mirror link...</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 text-center mt-4 leading-normal">
              Direct external mirror hyperlink. Download link count logged securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
