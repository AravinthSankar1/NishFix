import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicSoftwareApi, adminSoftwareApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SoftwareFormModal } from '../components/software/SoftwareFormModal';
import { siteConfig } from '../config/site';
import {
  Folder,
  FileText,
  Search,
  RefreshCw,
  Plus,
  Home,
  ChevronRight,
  ExternalLink,
  Download,
  Smartphone,
  Laptop,
  HardDrive,
  Database,
  Cpu,
  Monitor,
  Calendar,
  User,
  Layers,
  ArrowLeft,
  X,
  FolderPlus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { Software } from '../types';

const SUB_CATEGORIES = [
  { id: 'Mobile Phone', label: 'Mobile Phone', icon: Smartphone },
  { id: 'Laptop', label: 'Laptop', icon: Laptop },
  { id: 'EMMC FILE', label: 'EMMC FILE', icon: HardDrive },
  { id: 'UFS FILE', label: 'UFS FILE', icon: Database },
  { id: 'SPECIAL FILE', label: 'SPECIAL FILE', icon: Cpu },
  { id: 'PC', label: 'PC', icon: Monitor },
];

export const DataWorksPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [activeSubCategory, setActiveSubCategory] = useState<string>('UFS FILE');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedDetailFile, setSelectedDetailFile] = useState<Software | null>(null);

  // New Brand Folder Creation Modal
  const [isAddBrandOpen, setIsAddBrandOpen] = useState<boolean>(false);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newBrandCategory, setNewBrandCategory] = useState<string>('DUMP UFS');
  const [newBrandModel, setNewBrandModel] = useState<string>('');
  const [isCreatingBrand, setIsCreatingBrand] = useState<boolean>(false);
  const [brandCreateError, setBrandCreateError] = useState<string | null>(null);

  // Fetch structure data (SubCategories -> Brands -> counts)
  const { data: structure, refetch: refetchStructure } = useQuery({
    queryKey: ['dataworks-structure'],
    queryFn: publicSoftwareApi.getDataWorksStructure,
  });

  // Fetch files based on current selection
  const {
    data: softwareResponse,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ['dataworks-files', activeSubCategory, selectedBrand, appliedSearch],
    queryFn: () =>
      publicSoftwareApi.listSoftware({
        subCategory: activeSubCategory || undefined,
        brand: selectedBrand || undefined,
        search: appliedSearch || undefined,
        limit: 100,
      }),
  });

  const files = softwareResponse?.items || [];
  const currentBrands = structure?.[activeSubCategory] || [];

  const handleSelectSubCategory = (subCatId: string) => {
    setActiveSubCategory(subCatId);
    setSelectedBrand(null);
    setSearchKeyword('');
    setAppliedSearch('');
  };

  const handleSelectBrand = (brandName: string) => {
    setSelectedBrand(brandName);
    setSearchKeyword('');
    setAppliedSearch('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchKeyword.trim());
    if (searchKeyword.trim()) {
      setSelectedBrand(null);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandCreateError(null);
    if (!newBrandName.trim()) {
      return setBrandCreateError('Brand name is required (e.g. MEIZU, TECNO, POCO)');
    }

    setIsCreatingBrand(true);
    try {
      const payload: Partial<Software> = {
        brand: newBrandName.trim().toUpperCase(),
        model: newBrandModel.trim() || 'All Models',
        softwareName: `${newBrandName.trim().toUpperCase()} Official Firmware & Dump Archive`,
        version: 'v1.0 Initial',
        category: newBrandCategory.trim() || 'Firmware',
        subCategory: activeSubCategory,
        uploaderName: user?.name || 'Pro Technician',
        description: `Official firmware, schematics, and service files for ${newBrandName.trim().toUpperCase()}.`,
        externalUrl: 'https://drive.google.com/',
        fileSize: 1000000000,
        status: 'PUBLISHED',
      };

      if (isAdmin) {
        await adminSoftwareApi.createSoftware(payload);
      } else {
        await publicSoftwareApi.userUploadSoftware(payload);
      }

      await refetchStructure();
      await refetchFiles();
      setIsAddBrandOpen(false);
      setNewBrandName('');
      setNewBrandModel('');
    } catch (err: any) {
      console.error('Failed to create brand:', err);
      setBrandCreateError(err.message || 'Failed to create new brand folder.');
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const handleDownload = async (file: Software) => {
    try {
      const res = await publicSoftwareApi.requestDownloadUrl(file.id);
      if (res.downloadUrl && res.downloadUrl.startsWith('http')) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = res.downloadUrl;
        link.setAttribute('download', res.fileName || `${file.softwareName}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      refetchFiles();
    } catch (err) {
      console.error('Download error:', err);
      if (file.externalUrl) {
        window.open(file.externalUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
      {/* ═══ 1. DATAWORKS GREEN HEADER (Branded to Tested File) ═══ */}
      <div className="bg-[#1f563d] border-b border-[#184531] text-white px-4 sm:px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-2 text-white shadow-inner">
              <Database className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-white">{siteConfig.brandName}</span>
                  <span className="text-emerald-300 font-extrabold">DataWorks</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-200 border border-emerald-400/30 font-mono">
                  Multi-Brand Explorer
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 font-medium">
                Complete directory of tested mobile &amp; laptop firmware, UFS/eMMC dumps &amp; schematic bitmaps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchStructure();
                refetchFiles();
              }}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-600/50 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Library</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Upload File
            </button>
          </div>
        </div>

        {/* RECENT UPDATE TICKER BAR */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-emerald-600/40 text-[11px] text-emerald-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="font-bold text-amber-300 shrink-0 uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" /> Live Updates:
          </span>
          <span className="text-emerald-200/90 truncate">
            Nothing Phone 1 Android 14 Flash64 Dump File • Samsung S23 Ultra UFS 4.0 • Xiaomi 13 HyperOS • ASUS ROG 7 • HP 15-BW LA-E841P • Lenovo ThinkPad NM-C881
          </span>
        </div>
      </div>

      {/* ═══ 2. SEARCH BAR ═══ */}
      <div className="bg-[#10192e] border-b border-slate-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="text"
                placeholder="Search Brand, Chipset, Model (e.g. Nothing Phone, Galaxy, LA-E841P, UFS Dump)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-slate-100 text-xs sm:text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setAppliedSearch('');
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ═══ 3. MAIN EXPLORER: SUB-CATEGORY SIDEBAR + BRAND FOLDER GRID ═══ */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* LEFT SUB-CATEGORY SIDEBAR */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-3 shadow-lg">
              <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-800 mb-2">
                <Layers className="w-4 h-4" />
                <span>Sub Category</span>
              </div>

              <div className="space-y-1">
                {SUB_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeSubCategory === cat.id;
                  const catCount = (structure?.[cat.id] || []).reduce((acc, curr) => acc + curr.count, 0);

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectSubCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/10 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{cat.label}</span>
                      </div>
                      {catCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold">
                          {catCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action: Add Brand or Upload File */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <FolderPlus className="w-4 h-4" /> Custom Brand &amp; File
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Add any brand folder (e.g. MEIZU, TECNO, POCO) or upload files directly.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setIsAddBrandOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> + Brand
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> + Upload
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT EXPLORER: BRAND FOLDERS OR FILES */}
          <div className="lg:col-span-9 bg-[#0b1222] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
            <div>
              {/* BREADCRUMB BAR */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      setAppliedSearch('');
                    }}
                    className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors text-slate-400 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Home</span>
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-emerald-300">{activeSubCategory}</span>

                  {selectedBrand && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-white font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {selectedBrand}
                      </span>
                    </>
                  )}

                  {appliedSearch && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-amber-400">Search: "{appliedSearch}"</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!selectedBrand && (
                    <button
                      onClick={() => setIsAddBrandOpen(true)}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Brand Folder</span>
                    </button>
                  )}

                  {selectedBrand && (
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to Brands
                    </button>
                  )}
                </div>
              </div>

              {/* ═══ VIEW A: BRAND FOLDER GRID (ALL 17+ / 42+ BRANDS SHOWN) ═══ */}
              {!selectedBrand && !appliedSearch && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-200">
                      Select Device Brand in <span className="text-emerald-400">{activeSubCategory}</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {currentBrands.length} Brands Available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {currentBrands.map((item) => (
                      <div
                        key={item.brand}
                        onClick={() => handleSelectBrand(item.brand)}
                        className="bg-slate-900/90 hover:bg-slate-800/90 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm flex items-start gap-3"
                      >
                        <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
                          <Folder className="w-6 h-6 fill-teal-400/20 text-teal-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors uppercase truncate">
                            {item.brand}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {item.categoryType || activeSubCategory}
                          </p>
                          <span className="inline-block text-[9px] font-mono text-emerald-400 font-semibold mt-1">
                            {item.count} {item.count === 1 ? 'file' : 'files'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ VIEW B: FILES UNDER SELECTED BRAND ═══ */}
              {(selectedBrand || appliedSearch) && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-200">
                      {selectedBrand ? (
                        <>Files in <span className="text-emerald-400">{selectedBrand}</span> ({activeSubCategory})</>
                      ) : (
                        <>Search Results for "{appliedSearch}"</>
                      )}
                    </h3>
                    <span className="text-xs text-slate-500">{files.length} records found</span>
                  </div>

                  {isLoadingFiles && (
                    <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
                      Loading firmware and dump file records...
                    </div>
                  )}

                  {!isLoadingFiles && files.length === 0 && (
                    <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
                      <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-200">No Files in This Folder Yet</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Be the first to upload a tested dump or firmware file for {selectedBrand}.
                      </p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Upload Software / Dump File
                      </button>
                    </div>
                  )}

                  {!isLoadingFiles && files.length > 0 && (
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="bg-slate-900/80 hover:bg-slate-800/80 rounded-xl p-4 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                                {file.softwareName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                                <span className="font-semibold text-sky-400 flex items-center gap-1">
                                  <User className="w-3 h-3" /> {file.uploaderName || 'Official Lab'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  Date : {new Date(file.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-emerald-400 font-semibold">
                                  {formatFileSize(file.fileSize)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => setSelectedDetailFile(file)}
                              className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleDownload(file)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold p-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                              title="Download File directly"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6">
              <span>{siteConfig.brandName} DataWorks Explorer • Verified Dumps &amp; Schematics</span>
              <span className="font-mono text-emerald-400">Server Status: Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CREATE BRAND FOLDER MODAL ═══ */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FolderPlus className="w-5 h-5" />
                <span>Create New Brand Folder</span>
              </div>
              <button onClick={() => setIsAddBrandOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {brandCreateError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {brandCreateError}
              </div>
            )}

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sub Category</label>
                <input
                  type="text"
                  disabled
                  value={activeSubCategory}
                  className="w-full px-3.5 py-2 bg-slate-900/60 text-emerald-400 text-xs rounded-xl border border-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Name (e.g. MEIZU, TECNO, POCO, BLACK SHARK) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TECNO"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Folder Category Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. DUMP UFS / File Dump / Firmware"
                  value={newBrandCategory}
                  onChange={(e) => setNewBrandCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Model (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Camon 20 Pro 5G"
                  value={newBrandModel}
                  onChange={(e) => setNewBrandModel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBrand}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isCreatingBrand ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Create Brand Folder</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ DETAIL POPUP MODAL ═══ */}
      {selectedDetailFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl rounded-3xl border border-slate-700 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {selectedDetailFile.softwareName}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {selectedDetailFile.brand} • {selectedDetailFile.model} ({selectedDetailFile.version})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailFile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sub Category:</span>
                  <span className="font-bold text-emerald-400">{selectedDetailFile.subCategory || 'Mobile Phone'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category Tag:</span>
                  <span className="text-slate-200">{selectedDetailFile.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-mono text-white font-bold">{formatFileSize(selectedDetailFile.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uploader:</span>
                  <span className="text-sky-300 font-semibold">{selectedDetailFile.uploaderName || 'Official Lab'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Downloads:</span>
                  <span className="font-bold text-emerald-400">{selectedDetailFile.downloadCount}</span>
                </div>
              </div>

              {selectedDetailFile.description && (
                <div>
                  <h5 className="font-bold text-slate-300 mb-1">Description:</h5>
                  <p className="text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
                    {selectedDetailFile.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  handleDownload(selectedDetailFile);
                  setSelectedDetailFile(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download / Open File Mirror</span>
              </button>

              {selectedDetailFile.externalUrl && (
                <a
                  href={selectedDetailFile.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 hover:border-emerald-500/50"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>
                    {selectedDetailFile.externalUrl.includes('drive.google.com')
                      ? 'Open in Google Drive'
                      : 'Direct File Link'}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ UPLOAD SOFTWARE MODAL ═══ */}
      {isUploadModalOpen && (
        <SoftwareFormModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            refetchStructure();
            refetchFiles();
          }}
        />
      )}
    </div>
  );
};
