import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, ShieldCheck, LogOut, LayoutDashboard, Home, KeyRound, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith('/admin');

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMobile}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 tracking-tight">
                NishTech Hub
              </span>
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Software Library
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Mobile Phone Repair & Firmware Portal</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <Home className="w-4 h-4" />
            <span>Library Catalog</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isAdminPage
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Admin Portal</span>
              </Link>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <div className="flex items-center gap-3 pl-1">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-200">{user?.name || 'Shop Admin'}</div>
                  <div className="text-[10px] text-indigo-400 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Authorized Admin
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:opacity-95 transition-opacity"
            >
              <KeyRound className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 pb-4 pt-3 space-y-2 animate-in slide-in-from-top">
          <Link
            to="/"
            onClick={closeMobile}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
          >
            <Home className="w-4 h-4" />
            <span>Library Catalog</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/admin"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isAdminPage
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Admin Portal</span>
              </Link>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{user?.name || 'Shop Admin'}</div>
                  <div className="text-[10px] text-indigo-400 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Authorized Admin
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    closeMobile();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMobile}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:opacity-95 transition-opacity"
            >
              <KeyRound className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
