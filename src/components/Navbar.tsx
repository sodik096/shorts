import React from 'react';
import {
  Video,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Youtube,
  Upload,
  Link2,
  LogIn,
  UserCheck,
  Globe2,
  UploadCloud,
} from 'lucide-react';
import { UserProfile, ShortsRegion } from '../types';

interface NavbarProps {
  hasVideo: boolean;
  onOpenSourceModal: () => void;
  onReset: () => void;
  onOpenGuide: () => void;
  onOpenAutoUpload?: () => void;
  videoTitle?: string;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  targetRegion: ShortsRegion;
  onChangeTargetRegion: (region: ShortsRegion) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasVideo,
  onOpenSourceModal,
  onReset,
  onOpenGuide,
  onOpenAutoUpload,
  videoTitle,
  currentUser,
  onOpenLogin,
  onOpenProfile,
  targetRegion,
  onChangeTargetRegion,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20 text-white font-bold shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">ShortsForge</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                YouTube Shorts Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Ubah video apa saja menjadi konten 9:16 Shorts viral (Indonesia & Luar Negeri)
            </p>
          </div>
        </div>

        {/* Target Region Switcher (Indonesia vs Luar Negeri) */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            id="btn-nav-region-id"
            onClick={() => onChangeTargetRegion('indonesia')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              targetRegion === 'indonesia'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Target Penonton Indonesia (WIB, Bahasa Indonesia, Tren Lokal)"
          >
            <span className="text-sm">🇮🇩</span>
            <span className="hidden sm:inline">Shorts</span>
            <span>Indonesia</span>
          </button>

          <button
            id="btn-nav-region-global"
            onClick={() => onChangeTargetRegion('global')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              targetRegion === 'global'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Target Penonton Luar Negeri / Global (High CPM, English, US EST Peak)"
          >
            <span className="text-sm">🌍</span>
            <span className="hidden sm:inline">Shorts</span>
            <span>Luar Negeri</span>
          </button>
        </div>

        {/* Current Video Info or Action & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasVideo ? (
            <>
              {videoTitle && (
                <div className="hidden xl:flex items-center gap-2 max-w-[180px] px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                  <Video className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">{videoTitle}</span>
                </div>
              )}

              <button
                id="btn-change-video-source"
                onClick={onOpenSourceModal}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Ganti</span> Video
              </button>

              <button
                id="btn-reset-project"
                onClick={onReset}
                title="Mulai Ulang Proyek"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              id="btn-import-video-primary"
              onClick={onOpenSourceModal}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih / Upload Video</span>
            </button>
          )}

          {onOpenAutoUpload && (
            <button
              id="btn-open-auto-upload-api"
              onClick={onOpenAutoUpload}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-red-600/90 to-pink-600/90 hover:from-red-500 hover:to-pink-500 border border-red-500/40 shadow-sm transition-all flex items-center gap-1.5"
              title="Auto Upload ke YouTube & TikTok via API"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Auto Upload</span>
              <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-black/40 text-[9px] font-mono uppercase tracking-wider text-red-200 border border-white/10">
                API
              </span>
            </button>
          )}

          <button
            id="btn-shorts-guidelines"
            onClick={onOpenGuide}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Panduan YouTube Shorts & Strategi Algoritma"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Tips Shorts</span>
          </button>

          {/* User Auth Profile or Login Button */}
          {currentUser ? (
            <button
              id="btn-user-profile-menu"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 transition-all hover:border-red-500/50"
              title="Profil Creator"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-red-500 bg-slate-700 shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-bold text-white leading-tight truncate max-w-[90px]">
                  {currentUser.name}
                </span>
                <span className="block text-[9px] text-red-400 font-mono leading-none">
                  {currentUser.channelHandle || '@creator'}
                </span>
              </div>
            </button>
          ) : (
            <button
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-red-400" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

