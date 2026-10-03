import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicSoftwareApi } from '../services/api';
import { SoftwareCard } from '../components/software/SoftwareCard';
import { SearchBar } from '../components/software/SearchBar';
import { BrandFilters } from '../components/software/BrandFilters';
import { Wrench, Sparkles, TrendingUp, Layers, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import technicianHero from '../assets/technician-hero.jpg';

export const HomePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);

  // Fetch Brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: publicSoftwareApi.getBrands,
  });

  // Fetch Public Software List
  const {
    data: softwareResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-software', search, selectedBrand, page],
    queryFn: () =>
      publicSoftwareApi.listSoftware({
        search: search || undefined,
        brand: selectedBrand || undefined,
        page,
        limit: 9,
      }),
  });

  const softwareItems = softwareResponse?.items || [];
  const pagination = softwareResponse?.pagination;

  return (
    <div className="min-h-screen pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Official Mobile Phone Repair Software & Firmware Library</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
                Find & Download Tested <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400">
                  Mobile Repair Software Packages
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Search official ROM flashing tools, unbrick utilities, firmware, and repair packages for Samsung, Xiaomi, Apple, Oppo, Vivo, and MediaTek devices.
              </p>

              {/* SEARCH BAR CONTAINER */}
              <div className="mt-6 sm:mt-8 max-w-2xl mx-auto lg:mx-0">
                <SearchBar
                  value={search}
                  onChange={(val) => {
                    setSearch(val);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Right: Technician Image */}
            <div className="relative hidden md:block">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-indigo-900/20 group">
                <img
                  src={technicianHero}
                  alt="Professional mobile phone repair technician at work"
                  className="w-full h-[320px] lg:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                {/* Bottom glassmorphism caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                      <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">Precision Board-Level Repairs</p>
                      <p className="text-[11px] text-slate-400">Trusted by professional mobile technicians worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>

          {/* BRAND FILTER PILLS - Full width below */}
          <div className="mt-6 sm:mt-8">
            <BrandFilters
              brands={brands}
              selectedBrand={selectedBrand}
              onSelectBrand={(brand) => {
                setSelectedBrand(brand);
                setPage(1);
              }}
            />
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              {selectedBrand ? `${selectedBrand} Software Catalog` : 'Available Repair Software'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Showing tested software ZIP archives ready for direct secure download
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-2xl h-80 animate-pulse p-6 flex flex-col justify-between">
                <div className="h-32 bg-slate-800/60 rounded-xl" />
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/50 rounded w-1/2" />
                </div>
                <div className="h-10 bg-slate-800/80 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="text-center py-16 glass-card rounded-2xl border border-rose-500/20 max-w-lg mx-auto">
            <Wrench className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-100">Unable to load software library</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Please check your database server connection.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !isError && softwareItems.length === 0 && (
          <div className="text-center py-20 glass-card rounded-2xl border border-slate-800 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">No Software Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No published repair software matches your search criteria "{search || selectedBrand}".
            </p>
            {(search || selectedBrand) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedBrand('');
                  setPage(1);
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* SOFTWARE GRID */}
        {!isLoading && !isError && softwareItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareItems.map((software) => (
              <SoftwareCard key={software.id} software={software} />
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs font-semibold text-slate-400 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800/80">
              Page <span className="text-indigo-400">{pagination.currentPage}</span> of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
