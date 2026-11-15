import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TestedFileLogo } from '../components/common/SkillByPmLogo';
import { siteConfig } from '../config/site';
import { UserPlus, ShieldCheck, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please re-enter.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        name,
        email,
        phone: phone || undefined,
        password,
      });
      navigate('/dataworks');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <TestedFileLogo size="lg" showText={false} />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Create Technician Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Join to download tested firmware, UFS dumps, schematics &amp; post files
            </p>
          </div>

          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl mb-5 flex items-center gap-2 text-xs text-sky-300">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Includes <strong>100 Free Credits</strong> + <strong>2 Device Quota</strong> on registration!</span>
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
                Full Name / Technician Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe / Mobile Fix Lab"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="technician@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-slate-700 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full skillby-gradient-btn py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Free Account
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">
              Log In here
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-bit encryption · {siteConfig.brandName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
