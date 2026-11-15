import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAuthApi } from '../services/api';
import { TestedFileLogo } from '../components/common/SkillByPmLogo';
import { siteConfig } from '../config/site';
import { KeyRound, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetData, setResetData] = useState<{ message: string; resetToken?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await userAuthApi.forgotPassword(email);
      setResetData(res.data);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (resetData?.resetToken) {
      navigator.clipboard.writeText(resetData.resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <TestedFileLogo size="lg" showText={false} />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter the email address registered with your {siteConfig.brandName} account
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!resetData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="technician@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full skillby-gradient-btn py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Email...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Request Password Reset Token
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Reset Token Generated
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your password reset token has been verified and generated. You can now set your new password.
                </p>
              </div>

              {resetData.resetToken && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1 font-mono uppercase">
                    <span>Security Reset Token</span>
                    <button
                      onClick={handleCopy}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-sky-300 font-bold break-all select-all">
                    {resetData.resetToken}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/reset-password?token=${resetData.resetToken || ''}`)}
                className="w-full skillby-gradient-btn py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Set New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
