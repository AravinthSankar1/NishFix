import React, { useState, useEffect } from 'react';
import type { Software } from '../../types';
import { adminSoftwareApi } from '../../services/api';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Globe,
  Link2,
} from 'lucide-react';

interface SoftwareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Software | null;
}

export const SoftwareFormModal: React.FC<SoftwareFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [softwareName, setSoftwareName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [category, setCategory] = useState('Firmware & Flashing');
  const [tags, setTags] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileSizeMB, setFileSizeMB] = useState<string>('0');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setBrand(initialData.brand);
      setModel(initialData.model);
      setSoftwareName(initialData.softwareName);
      setVersion(initialData.version);
      setDescription(initialData.description || '');
      setAdditionalInfo(initialData.additionalInfo || '');
      setCategory(initialData.category || 'Firmware & Flashing');
      setTags(initialData.tags || '');
      setCompatibility(initialData.compatibility || '');
      setDownloadUrl(initialData.externalUrl || '');
      setImageUrl(initialData.imageUrl || '');
      setFileSizeMB(initialData.fileSize ? (initialData.fileSize / (1024 * 1024)).toFixed(0) : '0');
      setStatus(initialData.status);
    } else {
      setBrand('');
      setModel('');
      setSoftwareName('');
      setVersion('');
      setDescription('');
      setAdditionalInfo('');
      setCategory('Firmware & Flashing');
      setTags('');
      setCompatibility('');
      setDownloadUrl('');
      setImageUrl('');
      setFileSizeMB('0');
      setStatus('PUBLISHED');
    }
    setFormError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!brand.trim()) return setFormError('Brand is required (e.g. Samsung, Xiaomi)');
    if (!model.trim()) return setFormError('Mobile model is required (e.g. Galaxy A15)');
    if (!softwareName.trim()) return setFormError('Software name is required');
    if (!version.trim()) return setFormError('Software version is required');
    if (!downloadUrl.trim()) {
      return setFormError('Please enter the Download URL (e.g., Google Drive, Mega, or direct link).');
    }

    setIsSubmitting(true);

    try {
      const parsedSizeMB = parseFloat(fileSizeMB) || 0;
      const calculatedBytes = Math.round(parsedSizeMB * 1024 * 1024);

      const payload: Partial<Software> = {
        brand: brand.trim(),
        model: model.trim(),
        softwareName: softwareName.trim(),
        version: version.trim(),
        description: description.trim() || undefined,
        additionalInfo: additionalInfo.trim() || undefined,
        category,
        tags: tags.trim() || undefined,
        compatibility: compatibility.trim() || undefined,
        externalUrl: downloadUrl.trim(),
        imageUrl: imageUrl.trim() || undefined,
        fileSize: calculatedBytes,
        status,
      };

      if (isEditing && initialData) {
        await adminSoftwareApi.updateSoftware(initialData.id, payload);
      } else {
        await adminSoftwareApi.createSoftware(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Software save error:', err);
      setFormError(err.message || 'Failed to save software entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl my-8 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {isEditing ? 'Edit Repair Software Package' : 'Add New Software Package'}
              </h3>
              <p className="text-xs text-slate-400">
                Provide repair software metadata and direct download URL link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Required Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Brand <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung, Xiaomi, Apple"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Model <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galaxy A15 / Redmi Note 13"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Software Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odin Flash Tool v3.14"
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Version <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3.14.4 or v13.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* DOWNLOAD URL & FILE SIZE SECTION */}
          <div className="pt-2 border-t border-slate-800 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30">
              <label className="block text-xs font-bold text-indigo-300 mb-1.5 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                Download Link URL <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..., mega.nz, or direct zip file link"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 text-slate-100 text-xs font-mono rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your file host URL (Google Drive, Mega, Mediafire, or direct HTTP download link).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Approximate File Size (MB)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1500 for 1.5 GB"
                  value={fileSizeMB}
                  onChange={(e) => setFileSizeMB(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or image link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Firmware & Flashing">Firmware & Flashing</option>
                  <option value="Unbrick Tools">Unbrick Tools</option>
                  <option value="iOS System Repair">iOS System Repair</option>
                  <option value="Chipset Repair Utility">Chipset Repair Utility</option>
                  <option value="Unlock & FRP Service">Unlock & FRP Service</option>
                  <option value="Drivers & Suite">Drivers & Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Publishing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="PUBLISHED">PUBLISHED (Visible in library)</option>
                  <option value="DRAFT">DRAFT (Hidden work-in-progress)</option>
                  <option value="ARCHIVED">ARCHIVED (Archived legacy)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description & Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Detailed explanation of what this software solves..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hardware & OS Compatibility
                </label>
                <input
                  type="text"
                  placeholder="e.g. Android 14, Snapdragon 8 Gen 2"
                  value={compatibility}
                  onChange={(e) => setCompatibility(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Odin, Samsung, Flash"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Software Package'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
