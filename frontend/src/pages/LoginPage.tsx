import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, KeyRound, ShieldCheck, AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid admin email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@repair.local');
    setPassword('AdminPass123!');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" /> Back to Public Library
        </Link>

        {/* Login Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-xl shadow-indigo-500/30 mx-auto mb-4">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wrench className="w-7 h-7 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Shop Owner Admin Login
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authenticate to manage software files, upload ZIPs, and publish updates
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@repair.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>LOGIN TO ADMIN DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          {/* DEMO HELPER BOX */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fill Default Shop Admin Credentials</span>
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              Default Admin: <span className="font-mono text-slate-400">admin@repair.local</span> | <span className="font-mono text-slate-400">AdminPass123!</span>
            </p>
          </div>
        </div>

        <div className="text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Server-verified JWT authentication with HttpOnly cookies</span>
        </div>
      </div>
    </div>
  );
};
