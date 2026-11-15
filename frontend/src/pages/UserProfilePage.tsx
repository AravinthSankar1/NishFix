import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAuthApi, publicSoftwareApi } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  ShieldCheck,
  Smartphone,
  Coins,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // User uploaded files
  const { data: userFilesResponse } = useQuery({
    queryKey: ['my-uploaded-files', user?.id],
    queryFn: () =>
      publicSoftwareApi.listSoftware({
        search: user?.name,
        limit: 10,
      }),
    enabled: Boolean(user?.name),
  });

  const userFiles = userFilesResponse?.items || [];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsUpdating(true);

    try {
      await userAuthApi.updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      await refetchUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      console.error('Update error:', err);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ═══ PROFILE HEADER & CARDS ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
              <User className="w-7 h-7 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{user?.name || 'Technician'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <Link
          to="/dataworks"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-colors self-start sm:self-auto"
        >
          Open Borneo DataWorks
        </Link>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-bold">Credit Balance</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">{user?.credits ?? 150}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">Available for file downloads</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-sky-500/20 bg-sky-500/5">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-xs font-bold">Device Limit</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-sky-300">2 Devices</div>
          <p className="text-[11px] text-sky-400/80 mt-1">Simultaneous login quota</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold">Account Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-300">Verified</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">Full library permissions</p>
        </div>
      </div>

      {/* ═══ EDIT PROFILE & PASSWORD FORM ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Update Profile Information</h3>
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Change Password (Optional)
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password to verify"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full skillby-gradient-btn py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* ═══ USER'S RECENT UPLOADS ═══ */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> My Uploaded Files
            </h3>
            <span className="text-xs text-slate-400">{userFiles.length} files</span>
          </div>

          {userFiles.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              You haven't uploaded any firmware or dump files yet.
              <div className="mt-3">
                <Link
                  to="/dataworks"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Upload in DataWorks →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userFiles.map((file) => (
                <div key={file.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                  <h4 className="font-bold text-slate-200 truncate">{file.softwareName}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-medium">{file.subCategory || 'Mobile'}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
