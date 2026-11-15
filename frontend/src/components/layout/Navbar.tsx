import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TestedFileLogo } from '../common/SkillByPmLogo';
import { siteConfig } from '../../config/site';
import {
  LogOut,
  LayoutDashboard,
  Home,
  KeyRound,
  Menu,
  X,
  FileCode,
  CircuitBoard,
  HardDrive,
  Key,
  Wrench,
  Zap,
  PhoneCall,
  ExternalLink,
  Database,
  User,
  Coins,
  UserPlus,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith('/admin');
  const isDataWorks = location.pathname === '/dataworks';
  const closeMobile = () => setMobileMenuOpen(false);

  // Active category from URL query
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || '';

  const navCategories = [
    { label: 'Flash File', icon: FileCode, color: 'text-sky-400' },
    { label: 'Schematic', icon: CircuitBoard, color: 'text-emerald-400' },
    { label: 'Dump File', icon: HardDrive, color: 'text-amber-400' },
    { label: 'FRP File', icon: Key, color: 'text-purple-400' },
    { label: 'Tools', icon: Wrench, color: 'text-blue-400' },
    { label: 'EDL & ISP', icon: Zap, color: 'text-red-400' },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* ═══ 1. NOTICE & ACCESS STATUS BAR ═══ */}
      <div className="bg-[#fff3cd] text-[#856404] border-b border-[#ffeeba] text-[11px] font-bold py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              MULTI-DEVICE ACCESS ENABLED ~ ~ ~ {siteConfig.brandName.toUpperCase()} OFFICIAL FIRMWARE &amp; DUMP REPOSITORY
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <span className="bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-extrabold flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-700" /> {user?.credits ?? 150} Credits
              </span>
            )}
            {siteConfig.phone1 && (
              <a
                href={`tel:${siteConfig.phone1}`}
                className="flex items-center gap-1 hover:text-black transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-emerald-700" /> {siteConfig.phone1}
              </a>
            )}
            {siteConfig.whatsapp && (
              <a
                href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                WhatsApp <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 2. MAIN NAVBAR ═══ */}
      <div className="glass-panel border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="group flex items-center" onClick={closeMobile}>
            <TestedFileLogo size="md" subtitle={siteConfig.brandTagline} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            <Link
              to="/"
              onClick={() => {
                closeMobile();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-[11px] xl:text-xs font-semibold tracking-wide transition-colors ${
                location.pathname === '/' && !currentCategory
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-sky-400" />
              <span>Home</span>
            </Link>

            {/* DATAWORKS SPECIAL TAB (Green Theme) */}
            <Link
              to="/dataworks"
              onClick={closeMobile}
              className={`flex items-center gap-1 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-lg text-[11px] xl:text-xs font-black tracking-wide transition-all ${
                isDataWorks
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-800/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>DataWorks Explorer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            </Link>

            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = location.pathname === '/' && currentCategory === cat.label;
              return (
                <Link
                  key={cat.label}
                  to={`/?category=${encodeURIComponent(cat.label)}`}
                  onClick={closeMobile}
                  className={`flex items-center gap-1 px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg text-[11px] xl:text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth & Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isAdminPage
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                      {user?.name?.split(' ')[0] || 'User'}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      {user?.credits ?? 150} cr
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="skillby-gradient-btn px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5 text-sky-400" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/98 backdrop-blur-2xl px-4 pb-5 pt-3 space-y-2">
            <Link
              to="/"
              onClick={closeMobile}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60"
            >
              <Home className="w-4 h-4 text-sky-400" /> Home
            </Link>

            <Link
              to="/dataworks"
              onClick={closeMobile}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40"
            >
              <Database className="w-4 h-4 text-emerald-400" /> Borneo DataWorks Explorer
            </Link>

            {navCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  to={`/?category=${encodeURIComponent(cat.label)}`}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60"
                >
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span>{cat.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-800 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-900"
                  >
                    <User className="w-4 h-4 text-sky-400" /> My Profile ({user?.credits ?? 150} Credits)
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobile}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-sky-300 bg-sky-500/10"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-400" /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      closeMobile();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-400"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-850 text-slate-200 border border-slate-700"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="skillby-gradient-btn flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
