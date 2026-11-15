import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { userAuthApi } from '../services/api';
import { TestedFileLogo } from '../components/common/SkillByPmLogo';
import { siteConfig } from '../config/site';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const qToken = searchParams.get('token');
    if (qToken) {
      setToken(qToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      return setError('Please provide the reset token.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setIsSubmitting(true);
    try {
      const res = await userAuthApi.resetPassword(token.trim(), newPassword);
      setSuccess(res.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. The token may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" /> Back to Login
        </Link>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <TestedFileLogo size="lg" showText={false} />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Create New Password
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Set a strong replacement password for your {siteConfig.brandName} account
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reset Token <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Paste your reset token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full skillby-gradient-btn py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Save New Password
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Remember your credentials?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
