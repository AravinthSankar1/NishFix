import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TestedFileLogo } from '../components/common/SkillByPmLogo';
import { siteConfig } from '../config/site';
import { KeyRound, ShieldCheck, AlertCircle, ArrowLeft, Loader2, User, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUser, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (loginMode === 'admin') {
        await loginAdmin(email, password);
        navigate('/admin');
      } else {
        await loginUser(email, password);
        navigate('/dataworks');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" /> Back to Home
        </Link>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <TestedFileLogo size="lg" showText={false} />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to {siteConfig.brandName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Access Borneo DataWorks firmware archives, schematics &amp; dump files
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('user');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'user'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Technician Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'admin'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Admin Portal
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {loginMode === 'admin' ? 'Admin Email' : 'Technician Email'}
              </label>
              <input
                type="email"
                required
                placeholder={loginMode === 'admin' ? 'admin@repair.local' : 'technician@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2 ${
                loginMode === 'admin' ? 'skillby-red-btn' : 'skillby-gradient-btn'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Sign In as {loginMode === 'admin' ? 'Administrator' : 'Technician'}
                </>
              )}
            </button>
          </form>

          {loginMode === 'user' && (
            <div className="mt-5 text-center text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">
                Create Free Account
              </Link>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>2-Device Secure Access</span>
            </span>
            <span className="font-mono text-slate-500">{siteConfig.brandName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
