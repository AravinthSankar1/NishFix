import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminSoftwareApi } from '../services/api';
import type { Software } from '../types';
import { SearchBar } from '../components/software/SearchBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { SoftwareFormModal } from '../components/software/SoftwareFormModal';
import { DeleteConfirmModal } from '../components/software/DeleteConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSoftwarePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);

  const [deletingSoftware, setDeletingSoftware] = useState<Software | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-software-list', search, statusFilter, page],
    queryFn: () =>
      adminSoftwareApi.listSoftware({
        search: search || undefined,
        status: statusFilter,
        page,
        limit: 10,
      }),
  });

  const softwareList = response?.items || [];
  const pagination = response?.pagination;

  // Actions
  const handleOpenCreate = () => {
    setEditingSoftware(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Software) => {
    setEditingSoftware(item);
    setIsFormOpen(true);
  };

  const handlePublish = async (id: string) => {
    try {
      await adminSoftwareApi.publishSoftware(id);
      refetch();
    } catch (err) {
      console.error('Failed to publish software:', err);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await adminSoftwareApi.unpublishSoftware(id);
      refetch();
    } catch (err) {
      console.error('Failed to unpublish software:', err);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(true);
    try {
      await adminSoftwareApi.deleteSoftware(id);
      setDeletingSoftware(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete software:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return (mb / 1024).toFixed(2) + ' GB';
    return mb.toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Software Library Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload, publish, edit, or remove mobile phone repair packages
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Software Package</span>
        </button>
      </div>

      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Software' },
            { id: 'PUBLISHED', label: 'Published' },
            { id: 'DRAFT', label: 'Drafts' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search brand, model, software..."
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading && (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading software entries...</p>
          </div>
        )}

        {isError && (
          <div className="p-8 text-center text-rose-400 text-xs">
            Failed to load software database entries.
          </div>
        )}

        {!isLoading && !isError && softwareList.length === 0 && (
          <div className="p-16 text-center text-slate-400 text-xs">
            No software records found matching your filter criteria.
          </div>
        )}

        {!isLoading && !isError && softwareList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Thumb</th>
                  <th className="py-3.5 px-4">Software Name</th>
                  <th className="py-3.5 px-4">Brand / Model</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Downloads</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {softwareList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.softwareName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-900"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500">
                          <Smartphone className="w-5 h-5 text-indigo-400" />
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.softwareName}</div>
                      <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                        {item.originalFileName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-300">{item.brand}</span>
                      <div className="text-slate-400 text-[11px]">{item.model}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                      {item.version}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {formatFileSize(item.fileSize)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {item.downloadCount}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/software/${item.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="View Public Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {item.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Publish"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleUnpublish(item.id)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            title="Unpublish (Move to Draft)"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                          title="Edit Software"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingSoftware(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Software"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {softwareList.length} of {pagination.totalItems} entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-200">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <SoftwareFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => refetch()}
        initialData={editingSoftware}
      />

      <DeleteConfirmModal
        software={deletingSoftware}
        isOpen={Boolean(deletingSoftware)}
        onClose={() => setDeletingSoftware(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};
