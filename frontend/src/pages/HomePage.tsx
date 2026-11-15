import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicSoftwareApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SoftwareCard } from '../components/software/SoftwareCard';
import { SearchBar } from '../components/software/SearchBar';
import { BrandFilters } from '../components/software/BrandFilters';
import { SoftwareFormModal } from '../components/software/SoftwareFormModal';
import { siteConfig } from '../config/site';
import type { BrandFilter } from '../types';
import {
  CircuitBoard,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  FileCode,
  HardDrive,
  Key,
  Wrench,
  Zap,
  Plus,
  ShieldCheck,
  Download,
  Filter,
  Database,
} from 'lucide-react';
import technicianHero from '../assets/technician-hero.jpg';

const CATEGORIES = [
  {
    id: 'Flash File',
    name: 'Flash File',
    badge: 'ROMs & Firmware',
    icon: FileCode,
    color: 'from-sky-500/20 to-blue-600/10 text-sky-400 border-sky-500/30',
    hoverBorder: 'hover:border-sky-500',
    description: 'Official Stock ROMs, fastboot firmware, scatter files & 4-file repair packages.',
  },
  {
    id: 'Schematic',
    name: 'Schematic',
    badge: 'Circuit Diagrams',
    icon: CircuitBoard,
    color: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500',
    description: 'Circuit schematics, high-res PCB layout bitmaps, diode values & component lines.',
  },
  {
    id: 'Dump File',
    name: 'Dump File',
    badge: 'eMMC & UFS',
    icon: HardDrive,
    color: 'from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30',
    hoverBorder: 'hover:border-amber-500',
    description: 'eMMC and UFS boot partitions, userarea dumps, and raw dead-boot binaries.',
  },
  {
    id: 'FRP File',
    name: 'FRP File',
    badge: 'Account Bypass',
    icon: Key,
    color: 'from-purple-500/20 to-violet-600/10 text-purple-400 border-purple-500/30',
    hoverBorder: 'hover:border-purple-500',
    description: 'Google account bypass packages, combination ROMs, and Knox/MDM fixes.',
  },
  {
    id: 'Tools',
    name: 'Tools',
    badge: 'Software Utilities',
    icon: Wrench,
    color: 'from-blue-500/20 to-indigo-600/10 text-blue-400 border-blue-500/30',
    hoverBorder: 'hover:border-blue-500',
    description: 'UnlockTool, UMT, SP Flash Tool, QFIL, Odin, 3uTools, and USB drivers suite.',
  },
  {
    id: 'EDL & ISP',
    name: 'EDL & ISP',
    badge: 'Pinouts & Points',
    icon: Zap,
    color: 'from-red-500/20 to-rose-600/10 text-red-400 border-red-500/30',
    hoverBorder: 'hover:border-red-500',
    description: 'Qualcomm 9008 EDL test point photos, eMMC direct ISP pinouts & jumper diagrams.',
  },
];

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  const handleSelectCategory = (catId: string) => {
    if (activeCategory === catId) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
    setPage(1);
    const elem = document.getElementById('software-library');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const { data: brands = [] } = useQuery<BrandFilter[]>({
    queryKey: ['brands'],
    queryFn: () => publicSoftwareApi.getBrands(),
  });

  const {
    data: softwareResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-software', search, selectedBrand, activeCategory, page],
    queryFn: () =>
      publicSoftwareApi.listSoftware({
        search: search || undefined,
        brand: selectedBrand || undefined,
        category: activeCategory || undefined,
        page,
        limit: 12,
      }),
  });

  const softwareItems = softwareResponse?.items || [];
  const pagination = softwareResponse?.pagination;

  return (
    <div className="min-h-screen">
      {/* ═══ HERO BANNER (SkillByPM Layout) ═══ */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#080d19] to-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-red-500/30 text-slate-200 text-xs font-semibold mb-5 shadow-lg shadow-red-500/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-bold">{siteConfig.brandName}</span>
                <span className="text-slate-500">|</span>
                <span className="text-sky-300">Official Mobile Repair Software &amp; Schematic Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                <span className="text-white">Tested</span> <span className="text-red-500">File</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
                  Software, Firmware &amp; Schematics
                </span>
              </h1>

              <p className="mt-4 text-sm text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Save, organize, and download tested ROM flashing packages, schematic diagrams, dump files, FRP bypass solutions, and service tools.
              </p>

              {/* Quick Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/dataworks"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-600/30 inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-200" />
                  <span>Borneo DataWorks Explorer</span>
                </Link>

                {isAuthenticated ? (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="skillby-gradient-btn px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Repair Package</span>
                  </button>
                ) : (
                  <a
                    href="#software-library"
                    className="skillby-gradient-btn px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg inline-flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Browse Software Library</span>
                  </a>
                )}

                <a
                  href="#category-cards"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-sky-500 transition-all inline-flex items-center gap-2"
                >
                  <CircuitBoard className="w-4 h-4 text-emerald-400" />
                  <span>Explore 6 Categories</span>
                </a>

                {isAuthenticated && (
                  <Link
                    to="/admin"
                    className="px-5 py-3.5 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Manage Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-sky-950/40 p-3.5 sm:p-4 group">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-h-[480px] w-full border border-slate-800 bg-slate-950 flex items-center justify-center">
                  <img
                    src={technicianHero}
                    alt={`${siteConfig.brandName} – Mobile repair firmware`}
                    className="w-full h-full object-contain sm:object-cover sm:object-top group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Board-Level Repair Library</p>
                      <p className="text-[10px] text-slate-400">Tested Flash ROMs, Schematics &amp; Pinouts</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6 CATEGORY TILES (Matching SkillByPM) ═══ */}
      <section id="category-cards" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> File Categories
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Select a category to view tested files
              </h2>
            </div>
            {activeCategory && (
              <button
                onClick={() => {
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                Clear category filter ({activeCategory})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-sky-500 bg-sky-950/30 shadow-lg shadow-sky-500/20 ring-1 ring-sky-500'
                      : `border-slate-800 ${cat.hoverBorder}`
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} border group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-sky-400' : 'text-slate-400 group-hover:text-white'}>
                      {isSelected ? '✓ Filter Active' : 'Browse files →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SOFTWARE LIBRARY CATALOG ═══ */}
      <section id="software-library" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          {/* Header & Search */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeCategory ? `${activeCategory} Downloads` : 'All Mobile Repair Files & Schematics'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              High-speed direct download links for tested flash files, schematics, and phone repair packages.
            </p>

            <div className="mt-6 max-w-2xl mx-auto">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none justify-start sm:justify-center">
            <button
              onClick={() => handleSelectCategory('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !activeCategory
                  ? 'skillby-gradient-btn border border-sky-400 font-bold'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory.toLowerCase() === c.id.toLowerCase()
                    ? 'skillby-gradient-btn border border-sky-400 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Brand Filter Pills */}
          <div className="mb-8">
            <BrandFilters
              brands={brands}
              selectedBrand={selectedBrand}
              onSelectBrand={(brand) => {
                setSelectedBrand(brand);
                setPage(1);
              }}
            />
          </div>

          {/* Section Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-bold text-white">
                {selectedBrand ? `${selectedBrand} Files` : 'Published Files'}
              </span>
              {activeCategory && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {activeCategory}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="skillby-gradient-btn px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              )}

              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card rounded-2xl h-80 animate-pulse p-6 flex flex-col justify-between">
                  <div className="h-36 bg-slate-800/60 rounded-xl" />
                  <div className="space-y-3 mt-4">
                    <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/50 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-slate-800/80 rounded-xl mt-6" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-16 glass-card rounded-2xl border border-rose-500/20 max-w-lg mx-auto">
              <CircuitBoard className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-100">Unable to load software library</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Please verify database server connectivity.</p>
              <button onClick={() => refetch()} className="skillby-gradient-btn px-4 py-2 rounded-xl text-xs font-bold">
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && softwareItems.length === 0 && (
            <div className="text-center py-16 glass-card rounded-2xl border border-slate-800 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-3 text-sky-400">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Matching Files Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No files match "{search || selectedBrand || activeCategory}".
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                {(search || selectedBrand || activeCategory) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedBrand('');
                      searchParams.delete('category');
                      setSearchParams(searchParams);
                      setPage(1);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="skillby-gradient-btn px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload This File</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Software Grid */}
          {!isLoading && !isError && softwareItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {softwareItems.map((software) => (
                <SoftwareCard key={software.id} software={software} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-semibold text-slate-400 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800/80">
                Page <span className="text-sky-400">{pagination.currentPage}</span> of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ STANDARDS & HARDWARE SUPPORT ═══ */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Direct Cloud Downloads</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast presigned mirrors hosted on high-performance Cloudflare R2 storage without wait times.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">100% Tested Packages</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every flash ROM, schematic diagram, and dump file is verified on real handsets by technicians.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">All Major Chipsets</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full coverage for Qualcomm Snapdragon, MediaTek Dimensity/Helio, Exynos, and Apple Bionic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <SoftwareFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};
