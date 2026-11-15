import React from 'react';
import type { BrandFilter } from '../../types';

interface BrandFiltersProps {
  brands: BrandFilter[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const BrandFilters: React.FC<BrandFiltersProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
}) => {
  const defaultBrands = ['Samsung', 'Xiaomi', 'Apple', 'Oppo', 'Vivo', 'OnePlus', 'Realme', 'MediaTek', 'Qualcomm'];

  const allBrandsMap = new Map<string, number>();
  brands.forEach((b) => allBrandsMap.set(b.brand, b.count));
  defaultBrands.forEach((db) => {
    if (!allBrandsMap.has(db)) allBrandsMap.set(db, 0);
  });

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectBrand('')}
        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
          selectedBrand === ''
            ? 'skillby-gradient-btn border border-sky-400 font-bold'
            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
        }`}
      >
        All Brands &amp; Chipsets
      </button>

      {Array.from(allBrandsMap.entries()).map(([brandName, count]) => {
        const isSelected = selectedBrand === brandName;
        return (
          <button
            key={brandName}
            onClick={() => onSelectBrand(brandName)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
              isSelected
                ? 'skillby-gradient-btn border border-sky-400 font-bold'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>{brandName}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
