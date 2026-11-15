// Site-wide configuration loaded from Vite environment variables.
// In development, set these in frontend/.env (prefixed with VITE_).
// In production, set them at build time.
// All values have sensible defaults so the app works out of the box.

export const siteConfig = {
  // ── Brand ──
  brandName: import.meta.env.VITE_BRAND_NAME || 'Tested File',
  brandTagline: import.meta.env.VITE_BRAND_TAGLINE || 'Mobile Repair Software & Firmware Library',
  brandSubtitle: import.meta.env.VITE_BRAND_SUBTITLE || 'Tested ROMs, Schematics & Tools',

  // ── Contact ──
  phone1: import.meta.env.VITE_PHONE_1 || '',
  phone2: import.meta.env.VITE_PHONE_2 || '',
  whatsapp: import.meta.env.VITE_WHATSAPP || '',
  email: import.meta.env.VITE_EMAIL || '',

  // ── Location ──
  addressShort: import.meta.env.VITE_ADDRESS_SHORT || '',
  addressFull: import.meta.env.VITE_ADDRESS_FULL || '',
  city: import.meta.env.VITE_CITY || '',

  // ── Hero ──
  heroHeadline: import.meta.env.VITE_HERO_HEADLINE || 'Find & Download Tested Mobile Repair Software Packages',
  heroDescription: import.meta.env.VITE_HERO_DESCRIPTION || 'Search official ROM flashing tools, unbrick utilities, firmware, and repair packages for Samsung, Xiaomi, Apple, Oppo, Vivo, and MediaTek devices.',

  // ── Statistics (leave empty to hide) ──
  statTechnicians: import.meta.env.VITE_STAT_TECHNICIANS || '',
  statSchematics: import.meta.env.VITE_STAT_SCHEMATICS || '',
  statSuccessRate: import.meta.env.VITE_STAT_SUCCESS_RATE || '',

  // ── Team (leave empty to hide section) ──
  founderName: import.meta.env.VITE_FOUNDER_NAME || '',
  founderRole: import.meta.env.VITE_FOUNDER_ROLE || '',
  founderDescription: import.meta.env.VITE_FOUNDER_DESCRIPTION || '',

  // ── Social ──
  youtubeUrl: import.meta.env.VITE_YOUTUBE_URL || '',
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL || '',
  telegramUrl: import.meta.env.VITE_TELEGRAM_URL || '',

  // ── Flags ──
  showCourses: import.meta.env.VITE_SHOW_COURSES === 'true',
  showTeam: import.meta.env.VITE_SHOW_TEAM === 'true',
  showStats: import.meta.env.VITE_STAT_TECHNICIANS ? true : false,
  showDistributers: import.meta.env.VITE_SHOW_DISTRIBUTERS === 'true',
  showWhySection: import.meta.env.VITE_SHOW_WHY_SECTION !== 'false', // shown by default
} as const;
