import React, { useState, useEffect } from 'react';
import type { Software, GoogleDriveStatus } from '../../types';
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
  ExternalLink,
  Cloud,
  Check,
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

  // Mode: 'direct_upload' | 'paste_url'
  const [uploadMode, setUploadMode] = useState<'direct_upload' | 'paste_url'>('direct_upload');

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
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'gdrive_processing' | 'done'>('idle');
  const [uploadedFileKey, setUploadedFileKey] = useState<string>('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Google Drive Status
  const [gdriveStatus, setGdriveStatus] = useState<GoogleDriveStatus | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Google Drive link detection & helpers
  const isGoogleDriveLink = downloadUrl.includes('drive.google.com');
  const gdriveIdMatch = downloadUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || downloadUrl.match(/id=([a-zA-Z0-9_-]+)/);
  const gdriveFileId = gdriveIdMatch ? gdriveIdMatch[1] : null;

  const handleConvertToDirectGdrive = () => {
    if (gdriveFileId) {
      setDownloadUrl(`https://drive.google.com/uc?export=download&id=${gdriveFileId}`);
    }
  };

  const handleConvertToPreviewGdrive = () => {
    if (gdriveFileId) {
      setDownloadUrl(`https://drive.google.com/file/d/${gdriveFileId}/view?usp=sharing`);
    }
  };

  // Fetch Google Drive Integration Status
  useEffect(() => {
    if (isOpen) {
      storageApi
        .getGoogleDriveStatus()
        .then((res) => setGdriveStatus(res))
        .catch(() => {
          setGdriveStatus({
            isConfigured: false,
            authType: 'none',
            folderId: null,
            serviceAccountEmail: null,
            freeTierLimitGB: '15 GB',
          });
        });
    }
  }, [isOpen]);

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
      setUploadedFileKey(initialData.fileObjectKey || '');
      if (initialData.externalUrl) {
        setUploadMode('paste_url');
      }
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
      setUploadedFileKey('');
      setUploadProgress(0);
      setUploadStage('idle');
      setUploadSuccessMessage(null);
      setUploadMode('direct_upload');
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

    // Direct Upload to Google Drive via backend
    setIsUploadingFile(true);
    setUploadStage('uploading');
    setUploadProgress(10);
    setFormError(null);
    setUploadSuccessMessage(null);

    try {
      const uploadRes = await storageApi.uploadToGoogleDrive(file, undefined, (percent) => {
        setUploadProgress(percent);
        if (percent >= 95) {
          setUploadStage('gdrive_processing');
        }
      });

      setUploadStage('done');
      setUploadedFileKey(uploadRes.fileId);
      setDownloadUrl(uploadRes.webViewLink);

      if (uploadRes.isGoogleDrive) {
        setUploadSuccessMessage(
          `Uploaded directly to Google Drive! Public link generated (File ID: ${uploadRes.fileId.substring(0, 12)}...)`
        );
      } else {
        setUploadSuccessMessage(
          `File saved to server storage. Google Drive simulation link generated.`
        );
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setFormError('Upload failed: ' + (err.message || 'Error communicating with Google Drive.'));
      setUploadStage('idle');
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
    if (!downloadUrl.trim() && !uploadedFileKey) {
      return setFormError('Please select a file to upload or enter a download URL.');
    }

    setIsSubmitting(true);

    try {
      const parsedSizeMB = parseFloat(fileSizeMB) || 0;
      const calculatedBytes = Math.round(parsedSizeMB * 1024 * 1024);

      const targetUrl = downloadUrl.trim();

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
        fileObjectKey: uploadedFileKey || 'gdrive-file',
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{isEditing ? 'Edit Software / Dump Package' : 'Upload File & Store in Google Drive'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Borneo DataWorks full-stack cloud firmware publishing form
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* ═══ GOOGLE DRIVE STATUS BADGE ═══ */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs gap-2">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Google Drive Cloud Storage:</span>
              {gdriveStatus?.isConfigured ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Active (15 GB Free Quota)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                  Ready (Direct Upload Enabled)
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              100% Free • Auto Public Sharing
            </span>
          </div>

          {/* ═══ UPLOAD MODE TABS ═══ */}
          <div className="flex border border-slate-800 rounded-xl p-1 bg-slate-900/60">
            <button
              type="button"
              onClick={() => setUploadMode('direct_upload')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                uploadMode === 'direct_upload'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Direct File Upload to Google Drive</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('paste_url')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                uploadMode === 'paste_url'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Paste Google Drive / Cloud Link</span>
            </button>
          </div>

          {/* ═══ TAB 1: DIRECT FILE UPLOAD ═══ */}
          {uploadMode === 'direct_upload' && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 border-dashed hover:border-emerald-500/50 transition-colors">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Firmware / Dump Package Directly
              </label>

              <div className="flex flex-col items-center justify-center py-4 text-center">
                <input
                  type="file"
                  id="gdrive-file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="gdrive-file-upload"
                  className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 px-6 rounded-xl border border-slate-700 hover:border-emerald-500 flex items-center gap-2 transition-all shadow-md group"
                >
                  <HardDrive className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Select File to Upload to Google Drive</span>
                </label>

                <p className="mt-2 text-[11px] text-slate-400">
                  Select ZIP, BIN, DUMP, IMG, ROM, or TAR. File is uploaded to Google Drive &amp; stored in DB.
                </p>

                {selectedFile && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 flex flex-col gap-1 w-full max-w-md text-left">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <FileCheck className="w-4 h-4" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>File Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>Target: Google Drive Cloud</span>
                    </div>
                  </div>
                )}

                {isUploadingFile && (
                  <div className="w-full mt-4 space-y-2 max-w-md">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>
                        {uploadStage === 'uploading' && `Uploading to Google Drive (${uploadProgress}%)...`}
                        {uploadStage === 'gdrive_processing' && 'Finishing Google Drive upload & permissions...'}
                      </span>
                      <span className="font-mono text-emerald-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadSuccessMessage && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 w-full max-w-md text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">{uploadSuccessMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB 2 OR RESULTING GOOGLE DRIVE URL ═══ */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                Google Drive URL / Mirror Link <span className="text-emerald-400 font-normal">(Auto-generated or Pasted)</span>
              </label>
              {isGoogleDriveLink && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Google Drive Link Active
                </span>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/1CNlenonuwu1xPzlZQw2xFLn48eCwtvlE/view"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 text-slate-100 text-xs font-mono rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {isGoogleDriveLink && gdriveFileId && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Drive Mode:</span>
                  <button
                    type="button"
                    onClick={handleConvertToPreviewGdrive}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      downloadUrl.includes('/view')
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    Preview Page (Borneo Style)
                  </button>
                  <button
                    type="button"
                    onClick={handleConvertToDirectGdrive}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      downloadUrl.includes('export=download')
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    Direct Download
                  </button>
                </div>

                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Google Drive Link</span>
                </a>
              </div>
            )}
          </div>

          {/* ═══ SUB CATEGORY & CATEGORY (Borneo DataWorks) ═══ */}
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

          {/* ═══ BRAND & MODEL ═══ */}
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

          {/* ═══ UPLOADER & FILE SIZE ═══ */}
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

          {/* ═══ DESCRIPTION ═══ */}
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

          {/* ═══ ACTIONS ═══ */}
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
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Save & Publish to DataWorks'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
