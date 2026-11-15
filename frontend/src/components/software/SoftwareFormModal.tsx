import React, { useState, useEffect } from 'react';
import type { Software } from '../../types';
import { adminSoftwareApi, publicSoftwareApi, storageApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Globe,
  Link2,
  Upload,
  FileCheck,
  HardDrive,
  User,
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
  const { user, isAdmin } = useAuth();

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [softwareName, setSoftwareName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [category, setCategory] = useState('DUMP UFS');
  const [subCategory, setSubCategory] = useState('UFS FILE');
  const [tags, setTags] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileSizeMB, setFileSizeMB] = useState<string>('0');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');

  // Real File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedServerFileUrl, setUploadedServerFileUrl] = useState<string>('');

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
      setCategory(initialData.category || 'DUMP UFS');
      setSubCategory(initialData.subCategory || 'UFS FILE');
      setTags(initialData.tags || '');
      setCompatibility(initialData.compatibility || '');
      setUploaderName(initialData.uploaderName || '');
      setDownloadUrl(initialData.externalUrl || '');
      setImageUrl(initialData.imageUrl || '');
      setFileSizeMB(initialData.fileSize ? (initialData.fileSize / (1024 * 1024)).toFixed(0) : '0');
      setStatus(initialData.status);
      setUploadedServerFileUrl(initialData.fileObjectKey && initialData.fileObjectKey.startsWith('/uploads') ? initialData.fileObjectKey : '');
    } else {
      setBrand('');
      setModel('');
      setSoftwareName('');
      setVersion('');
      setDescription('');
      setAdditionalInfo('');
      setCategory('DUMP UFS');
      setSubCategory('UFS FILE');
      setTags('');
      setCompatibility('');
      setUploaderName(user?.name || 'HYD ANAS');
      setDownloadUrl('');
      setImageUrl('');
      setFileSizeMB('0');
      setStatus('PUBLISHED');
      setSelectedFile(null);
      setUploadedServerFileUrl('');
      setUploadProgress(0);
    }
    setFormError(null);
  }, [initialData, isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeMB(sizeInMB);

    // Auto-fill software name if empty
    if (!softwareName) {
      setSoftwareName(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Automatically perform local upload
    setIsUploadingFile(true);
    setUploadProgress(10);
    try {
      const uploadRes = await storageApi.uploadRealFile(file, (percent) => {
        setUploadProgress(percent);
      });
      setUploadedServerFileUrl(uploadRes.fileUrl);
      if (!downloadUrl) {
        setDownloadUrl(window.location.origin + uploadRes.fileUrl);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setFormError('Direct file upload error: ' + (err.message || 'File upload failed.'));
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!brand.trim()) return setFormError('Brand is required (e.g. NOTHING PHONE, SAMSUNG, ASUS)');
    if (!model.trim()) return setFormError('Model is required (e.g. Nothing Phone 1, Galaxy S23)');
    if (!softwareName.trim()) return setFormError('Title / Software name is required');
    if (!version.trim()) return setFormError('Software / Dump version is required');
    if (!downloadUrl.trim() && !uploadedServerFileUrl) {
      return setFormError('Please either select a file to upload or provide a Download URL (Google Drive / Mega link).');
    }

    setIsSubmitting(true);

    try {
      const parsedSizeMB = parseFloat(fileSizeMB) || 0;
      const calculatedBytes = Math.round(parsedSizeMB * 1024 * 1024);

      const targetUrl = downloadUrl.trim() || (uploadedServerFileUrl ? window.location.origin + uploadedServerFileUrl : '');

      const payload: Partial<Software> = {
        brand: brand.trim(),
        model: model.trim(),
        softwareName: softwareName.trim(),
        version: version.trim(),
        description: description.trim() || undefined,
        additionalInfo: additionalInfo.trim() || undefined,
        category,
        subCategory,
        tags: tags.trim() || undefined,
        compatibility: compatibility.trim() || undefined,
        uploaderName: uploaderName.trim() || user?.name || 'HYD ANAS',
        externalUrl: targetUrl,
        fileObjectKey: uploadedServerFileUrl || 'url-mirror',
        originalFileName: selectedFile?.name || `${softwareName.replace(/\s+/g, '-')}.zip`,
        imageUrl: imageUrl.trim() || undefined,
        fileSize: calculatedBytes,
        status,
      };

      if (isEditing && initialData) {
        await adminSoftwareApi.updateSoftware(initialData.id, payload);
      } else if (isAdmin) {
        await adminSoftwareApi.createSoftware(payload);
      } else {
        await publicSoftwareApi.userUploadSoftware(payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl my-8 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {isEditing ? 'Edit Software / Dump Package' : 'Upload Software / Firmware / Dump File'}
              </h3>
              <p className="text-xs text-slate-400">
                Borneo DataWorks tested file publishing form
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

          {/* ═══ REAL FILE UPLOAD DROPZONE ═══ */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 border-dashed hover:border-emerald-500/50 transition-colors">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Real File Attachment (ZIP, DUMP, BIN, PDF, IMG)
            </label>

            <div className="flex flex-col items-center justify-center py-4 text-center">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-5 rounded-xl border border-slate-700 hover:border-emerald-500 flex items-center gap-2 transition-all shadow-sm"
              >
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Choose Local File to Upload</span>
              </label>

              {selectedFile && (
                <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              )}

              {isUploadingFile && (
                <div className="w-full mt-3 space-y-1 max-w-xs">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Uploading to server storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUB CATEGORY & CATEGORY (Borneo DataWorks) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sub Category (Borneo Navigation) <span className="text-rose-400">*</span>
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Mobile Phone">Mobile Phone</option>
                <option value="Laptop">Laptop</option>
                <option value="EMMC FILE">EMMC FILE</option>
                <option value="UFS FILE">UFS FILE</option>
                <option value="SPECIAL FILE">SPECIAL FILE</option>
                <option value="PC">PC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category Type / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. DUMP UFS, File Dump, Firmware Asus"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* DEVICE INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand / Manufacturer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NOTHING PHONE, SAMSUNG, ASUS, XIAOMI"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Model Name / Board Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nothing Phone 1 / NM-C881"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Title / Software Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DUMP - Nothing Phone 1 Android 14 Flash64 Dump File"
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Version / OS Build <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Android 14 Flash64 / Rev 2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* UPLOADER & EXTERNAL URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Uploader / Technician Name
              </label>
              <input
                type="text"
                placeholder="e.g. HYD ANAS / Pro Technician"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                File Size in Megabytes (MB)
              </label>
              <input
                type="number"
                placeholder="e.g. 64000 for 64 GB"
                value={fileSizeMB}
                onChange={(e) => setFileSizeMB(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* DOWNLOAD URL (GOOGLE DRIVE / MEGA / SERVER) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-400" />
              Download Mirror URL (Google Drive / Mega / Server Link)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/1CNewNenowwu1xPzEZQw2xFLr48eCwtViE/view"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 text-slate-100 text-xs font-mono rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Provide a Google Drive preview/download link, Mega mirror, or use the file uploaded above.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description &amp; Repair Info
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Complete UFS userarea dump for Nothing Phone 1. Tested 100% on Android 14."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
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
              disabled={isSubmitting || isUploadingFile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Publish File to DataWorks'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
