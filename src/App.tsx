import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Link2,
  Sparkles,
  Layers,
  Scissors,
  Download,
  Flame,
  Film,
  Play,
  RotateCcw,
  CheckCircle2,
  Youtube,
  Tv,
  Eye,
  UploadCloud,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { VideoSourceModal } from './components/VideoSourceModal';
import { ShortsCanvasPreview } from './components/ShortsCanvasPreview';
import { ShortsTimelineTrimmer } from './components/ShortsTimelineTrimmer';
import { ShortsStyleEditor } from './components/ShortsStyleEditor';
import { AiAssistantPanel } from './components/AiAssistantPanel';
import { ExportModal } from './components/ExportModal';
import { AutoUploadModal } from './components/AutoUploadModal';
import { ShortsGuideModal } from './components/ShortsGuideModal';
import { LoginPage } from './components/LoginPage';
import { ProfileModal } from './components/ProfileModal';
import { SAMPLE_VIDEOS } from './data/sampleVideos';
import { FramingState, OverlayConfig, TrimState, VideoSourceState, UserProfile, ShortsRegion } from './types';
import { getStoredUser, saveUserSession } from './utils/auth';

const INITIAL_FRAMING: FramingState = {
  mode: 'blur_fill', // Default to mirror blur: best for YouTube Shorts from 16:9 videos
  zoom: 1,
  panX: 0,
  panY: 0,
  bgColor: '#000000',
};

const INITIAL_OVERLAY: OverlayConfig = {
  showHook: true,
  hookText: 'JANGAN SKIP! 😱',
  hookBgColor: '#dc2626',
  hookTextColor: '#ffffff',
  hookFontSize: 34,

  showCaption: true,
  captionText: 'RAHASIA BESARNYA...',
  captionColor: '#ffe600',
  captionFontSize: 44,
  captionPosition: 'bottom',
  captionStyle: 'hormozi_yellow',

  showWatermark: true,
  watermarkText: '@shorts',

  showProgressBar: true,
  progressBarColor: '#ff0000',

  filter: 'none',
};

const INITIAL_TRIM: TrimState = {
  startTime: 0,
  endTime: 15,
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  volume: 1,
  isMuted: false,
  loop: true,
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [currentView, setCurrentView] = useState<'studio' | 'login'>('studio');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Region selection: 'indonesia' vs 'global'
  const [targetRegion, setTargetRegion] = useState<ShortsRegion>('indonesia');

  const [videoSource, setVideoSource] = useState<VideoSourceState | null>(null);
  const [framing, setFraming] = useState<FramingState>(INITIAL_FRAMING);
  const [overlay, setOverlay] = useState<OverlayConfig>(() => {
    const user = getStoredUser();
    if (user?.channelHandle) {
      return { ...INITIAL_OVERLAY, watermarkText: user.channelHandle };
    }
    return INITIAL_OVERLAY;
  });
  const [trim, setTrim] = useState<TrimState>(INITIAL_TRIM);
  const [activeTab, setActiveTab] = useState<'style' | 'ai'>('style');
  const [activeSubtitleText, setActiveSubtitleText] = useState('');

  // Handler for changing target market/region
  const handleRegionChange = (newRegion: ShortsRegion) => {
    setTargetRegion(newRegion);
    setOverlay((prev) => {
      const isDefaultHook = prev.hookText === 'JANGAN SKIP! 😱' || prev.hookText === 'WAIT TILL THE END 😱';
      const isDefaultCaption = prev.captionText === 'RAHASIA BESARNYA...' || prev.captionText === 'THE BIGGEST SECRET...';
      return {
        ...prev,
        hookText: isDefaultHook ? (newRegion === 'indonesia' ? 'JANGAN SKIP! 😱' : 'WAIT TILL THE END 😱') : prev.hookText,
        captionText: isDefaultCaption ? (newRegion === 'indonesia' ? 'RAHASIA BESARNYA...' : 'THE BIGGEST SECRET...') : prev.captionText,
      };
    });
  };

  // Modals
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAutoUploadModalOpen, setIsAutoUploadModalOpen] = useState(false);
  const [autoUploadBlobUrl, setAutoUploadBlobUrl] = useState<string | null>(null);
  const [autoUploadThumbUrl, setAutoUploadThumbUrl] = useState<string | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle successful login
  const handleSuccessLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('studio');
    // Auto-apply user's channel watermark if set
    if (user.channelHandle) {
      setOverlay((prev) => ({
        ...prev,
        watermarkText: user.channelHandle,
        showWatermark: true,
      }));
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setOverlay((prev) => ({
      ...prev,
      watermarkText: '@shorts',
    }));
  };

  // Handle user profile update
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    if (updated.channelHandle) {
      setOverlay((prev) => ({
        ...prev,
        watermarkText: updated.channelHandle,
      }));
    }
  };

  // Sync Master Video Element with Trim State
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = trim.playbackRate;
    video.volume = trim.volume;
    video.muted = trim.isMuted;
  }, [trim.playbackRate, trim.volume, trim.isMuted]);

  // Video Time Update Listener (loops or stops within trim bounds)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const cur = video.currentTime;
    setTrim((prev) => ({ ...prev, currentTime: cur }));

    // Boundary check for trimmed clip
    if (cur >= trim.endTime) {
      if (trim.loop) {
        video.currentTime = trim.startTime;
      } else {
        video.pause();
        setTrim((prev) => ({ ...prev, isPlaying: false, currentTime: trim.startTime }));
      }
    }
  }, [trim.endTime, trim.startTime, trim.loop]);

  // If currently in login view, show full LoginPage
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccessLogin={handleSuccessLogin}
        onBackToStudio={() => setCurrentView('studio')}
      />
    );
  }

  // Play / Pause Toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime >= trim.endTime || video.currentTime < trim.startTime) {
        video.currentTime = trim.startTime;
      }
      video.play();
      setTrim((prev) => ({ ...prev, isPlaying: true }));
    } else {
      video.pause();
      setTrim((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  // Seek video
  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setTrim((prev) => ({ ...prev, currentTime: time }));
  };

  // Update Trim State
  const updateTrim = (updates: Partial<TrimState>) => {
    setTrim((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
  };

  // Update Framing State
  const updateFraming = (updates: Partial<FramingState>) => {
    setFraming((prev) => ({ ...prev, ...updates }));
  };

  // Update Overlay State
  const updateOverlay = (updates: Partial<OverlayConfig>) => {
    setOverlay((prev) => ({ ...prev, ...updates }));
  };

  // Load File from PC
  const handleSelectFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setVideoSource({
      type: 'file',
      name: file.name.replace(/\.[^/.]+$/, ''),
      srcUrl: objectUrl,
      fileSize: file.size,
      duration: 0,
      videoWidth: 0,
      videoHeight: 0,
    });
    setTrim((prev) => ({ ...prev, startTime: 0, endTime: 15, currentTime: 0, isPlaying: false }));
  };

  // Load from Video URL
  const handleSelectUrl = (url: string, name: string) => {
    setVideoSource({
      type: 'url',
      name: name || 'Video URL Shorts',
      srcUrl: url,
      rawUrl: url,
      duration: 0,
      videoWidth: 0,
      videoHeight: 0,
    });
    setTrim((prev) => ({ ...prev, startTime: 0, endTime: 15, currentTime: 0, isPlaying: false }));
  };

  // Video Loaded Metadata Handler
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const dur = video.duration || 15;
    // Cap default YouTube Shorts clip length to maximum 59 seconds or source duration
    const initialClipEnd = Math.min(59, dur);

    setVideoSource((prev) =>
      prev
        ? {
            ...prev,
            duration: dur,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
          }
        : null
    );

    setTrim((prev) => ({
      ...prev,
      startTime: 0,
      endTime: initialClipEnd,
      currentTime: 0,
      isPlaying: false,
    }));
  };

  // Reset project
  const handleReset = () => {
    if (confirm('Mulai ulang proyek dan hapus video saat ini?')) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setVideoSource(null);
      setFraming(INITIAL_FRAMING);
      setOverlay(INITIAL_OVERLAY);
      setTrim(INITIAL_TRIM);
      setActiveSubtitleText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Hidden Master HTML5 Video Element with CORS support */}
      {videoSource && (
        <video
          ref={videoRef}
          src={videoSource.srcUrl}
          crossOrigin="anonymous"
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="hidden"
        />
      )}

      {/* Top Navbar */}
      <Navbar
        hasVideo={!!videoSource}
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
        onReset={handleReset}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenAutoUpload={() => setIsAutoUploadModalOpen(true)}
        videoTitle={videoSource?.name}
        currentUser={currentUser}
        onOpenLogin={() => setCurrentView('login')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        targetRegion={targetRegion}
        onChangeTargetRegion={handleRegionChange}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!videoSource ? (
          /* EMPTY STATE: Welcome & Video Selection */
          <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Youtube className="w-4 h-4" />
                <span>YouTube Shorts Studio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentUser ? (
                  <>
                    Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">{currentUser.name}</span>!
                  </>
                ) : (
                  'Buat Konten YouTube Shorts 9:16 Viral'
                )}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                {currentUser ? (
                  <>
                    Akun terhubung: <span className="text-white font-semibold font-mono">{currentUser.channelHandle}</span>.
                    Watermark otomatis aktif di setiap render. Pilih video untuk mulai membuat klip Shorts!
                  </>
                ) : (
                  'Ubah video dari URL mana saja atau upload dari PC Anda menjadi klip vertikal 9:16 dengan efek mirror blur, banner hook penangkap perhatian, subtitle dinamis, dan AI generator.'
                )}
              </p>

              {/* Target Market / Region Mode Selector */}
              <div className="pt-2 flex flex-col items-center justify-center gap-2">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleRegionChange('indonesia')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      targetRegion === 'indonesia'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🇮🇩</span>
                    <span>Shorts Indonesia</span>
                    <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-normal">
                      Tren Lokal & WIB
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegionChange('global')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      targetRegion === 'global'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🌍</span>
                    <span>Shorts Luar Negeri</span>
                    <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-normal">
                      Global & High CPM
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {targetRegion === 'indonesia'
                    ? '🎯 Dioptimalkan untuk audiens Indonesia: hook emosional & penasaran, jam tayang 12.00 & 19.00 WIB.'
                    : '🎯 Dioptimalkan untuk audiens Global/US: Bahasa Inggris, visual dinamis, jam tayang malam (siang EST).'}
                </p>
              </div>

              {!currentUser && (
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    id="btn-hero-login-prompt"
                    onClick={() => setCurrentView('login')}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Masuk ke Akun Creator untuk Simpan Watermark Channel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Two Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1: Upload dari PC */}
              <div
                id="card-upload-pc"
                onClick={() => setIsSourceModalOpen(true)}
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-red-500/80 rounded-2xl p-6 sm:p-8 cursor-pointer transition-all hover:shadow-2xl hover:shadow-red-500/10 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                      Upload File Video dari PC
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Pilih atau tarik file video dari komputer Anda (.MP4, .MOV, .WebM, .MKV). Diproses
                      langsung secara lokal tanpa batas ukuran!
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-red-600 group-hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih Video dari Komputer</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Dari URL Video Mana Saja */}
              <div
                id="card-import-url"
                onClick={() => setIsSourceModalOpen(true)}
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-blue-500/80 rounded-2xl p-6 sm:p-8 cursor-pointer transition-all hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Link2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      Impor dari URL Video Mana Saja
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Tempelkan URL video langsung (.mp4/.webm) dari website publik, CDN, atau coba contoh
                      video trending dengan 1 klik!
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-white font-bold text-xs border border-slate-700 group-hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Link2 className="w-4 h-4 text-blue-400 group-hover:text-white" />
                    <span>Masukkan URL Video</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Previews with Region Tagging */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sampel Video HD Siap Pakai ({targetRegion === 'indonesia' ? 'Kategori Indonesia' : 'Kategori Global / Luar Negeri'}):</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {targetRegion === 'indonesia' ? '🇮🇩 Menampilkan konten relevan audiens Indonesia' : '🌍 Menampilkan konten global & US format'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {SAMPLE_VIDEOS.filter((s) => s.region === targetRegion || s.region === 'both' || true).slice(0, 4).map((sample) => (
                  <button
                    key={sample.id}
                    id={`btn-sample-${sample.id}`}
                    onClick={() => {
                      const proxied = `/api/proxy-video?url=${encodeURIComponent(sample.url)}`;
                      handleSelectUrl(proxied, sample.title);
                    }}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">
                          {sample.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{sample.durationLabel}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {sample.title}
                      </h4>
                      {sample.badgeLabel && (
                        <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                          {sample.badgeLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 font-medium group-hover:text-white">
                      <Play className="w-3 h-3 fill-slate-400 group-hover:fill-white" />
                      <span>Pakai Video Ini</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE STUDIO WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
            {/* LEFT COLUMN: 9:16 Canvas Live Preview & Timeline Trimmer (7 cols on lg) */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center gap-5">
              {/* 9:16 Interactive Canvas Preview */}
              <ShortsCanvasPreview
                videoRef={videoRef}
                canvasRef={canvasRef}
                videoSource={videoSource}
                trim={trim}
                framing={framing}
                overlay={overlay}
                activeSubtitleText={activeSubtitleText}
                onTogglePlay={togglePlay}
                onUpdateFraming={updateFraming}
              />

              {/* Action Buttons underneath canvas: Auto Upload, Export & Quick Snapshot */}
              <div className="w-full max-w-[340px] sm:max-w-[380px] space-y-2.5">
                <button
                  id="btn-quick-auto-upload-api"
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      try {
                        const thumb = canvas.toDataURL('image/png');
                        setAutoUploadThumbUrl(thumb);
                      } catch (e) {
                        console.warn('Canvas snapshot tainted or unavailable:', e);
                      }
                    }
                    setIsAutoUploadModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:via-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>⚡ Auto Upload ke YouTube & TikTok (API)</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="btn-open-export-modal"
                    onClick={() => setIsExportModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export / Render</span>
                  </button>

                  <button
                    id="btn-capture-thumbnail-snapshot"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        try {
                          const link = document.createElement('a');
                          link.download = `${(videoSource.name || 'shorts').replace(/[^a-zA-Z0-9_-]/g, '_')}_thumbnail.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                        } catch (e) {
                          alert('Gagal mengambil screenshot: frame video mungkin sedang dimuat.');
                        }
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Thumbnail</span>
                  </button>
                </div>
              </div>

              {/* Timeline Trimmer (Always visible underneath preview for immediate scrubbing) */}
              <div className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-none">
                <ShortsTimelineTrimmer
                  totalDuration={videoSource.duration || 15}
                  trim={trim}
                  onUpdateTrim={updateTrim}
                  onSeek={handleSeek}
                  onTogglePlay={togglePlay}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Tabbed Editors (Visual & Hook, AI Content Generator) */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              {/* Tab Navigation */}
              <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex gap-1">
                <button
                  id="tab-btn-style-editor"
                  onClick={() => setActiveTab('style')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'style'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Visual, Hook & Subtitle</span>
                </button>

                <button
                  id="tab-btn-ai-assistant"
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'ai'
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Generator (Gemini)</span>
                </button>
              </div>

              {/* Active Tab Panel */}
              {activeTab === 'style' ? (
                <ShortsStyleEditor
                  framing={framing}
                  overlay={overlay}
                  onUpdateFraming={updateFraming}
                  onUpdateOverlay={updateOverlay}
                  targetRegion={targetRegion}
                  onChangeTargetRegion={handleRegionChange}
                />
              ) : (
                <AiAssistantPanel
                  currentTitle={videoSource.name}
                  clipDuration={trim.endTime - trim.startTime}
                  targetRegion={targetRegion}
                  onChangeTargetRegion={handleRegionChange}
                  onApplyHookBanner={(hookText) => {
                    updateOverlay({ hookText, showHook: true });
                    setActiveTab('style');
                  }}
                  onApplyCaption={(capText) => {
                    updateOverlay({ captionText: capText, showCaption: true });
                    setActiveSubtitleText(capText);
                  }}
                  onSelectTitle={(newTitle) => {
                    setVideoSource((prev) => (prev ? { ...prev, name: newTitle } : null));
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <VideoSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSelectFile={handleSelectFile}
        onSelectUrl={handleSelectUrl}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvasRef={canvasRef}
        videoRef={videoRef}
        trim={trim}
        videoSource={videoSource}
        videoTitle={videoSource?.name || 'YouTube Shorts'}
        onOpenAutoUpload={(blob, thumb) => {
          setAutoUploadBlobUrl(blob);
          if (thumb) setAutoUploadThumbUrl(thumb);
          setIsAutoUploadModalOpen(true);
        }}
      />

      <AutoUploadModal
        isOpen={isAutoUploadModalOpen}
        onClose={() => setIsAutoUploadModalOpen(false)}
        renderedBlobUrl={autoUploadBlobUrl}
        thumbnailUrl={autoUploadThumbUrl}
        videoTitle={videoSource?.name || 'YouTube Shorts Viral'}
        videoDescription={overlay.captionText ? `${overlay.captionText}\n\n#Shorts #viral` : ''}
        hashtags={['#Shorts', '#viral', '#trending', targetRegion === 'indonesia' ? '#shortsindonesia' : '#viralshorts', '#fyp']}
        clipDuration={trim.endTime - trim.startTime}
      />

      <ShortsGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
}
