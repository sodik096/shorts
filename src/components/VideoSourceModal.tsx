import React, { useState, useRef } from 'react';
import { Upload, Link2, Play, Sparkles, X, FileVideo, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { SAMPLE_VIDEOS, SampleVideoItem } from '../data/sampleVideos';

interface VideoSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: File) => void;
  onSelectUrl: (url: string, name: string) => void;
}

export const VideoSourceModal: React.FC<VideoSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  onSelectUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [inputUrl, setInputUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sampleFilter, setSampleFilter] = useState<'all' | 'indonesia' | 'global'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSamples = SAMPLE_VIDEOS.filter((sample) => {
    if (sampleFilter === 'all') return true;
    return sample.region === sampleFilter || sample.region === 'both';
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('video/')) {
        alert('Mohon pilih file video yang valid (.mp4, .webm, .mov, .mkv)');
        return;
      }
      onSelectFile(file);
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('video/')) {
        alert('Mohon pilih file video yang valid (.mp4, .webm, .mov, .mkv)');
        return;
      }
      onSelectFile(file);
      onClose();
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setUrlError('Harap masukkan URL video');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setUrlError('Format URL tidak valid. Pastikan diawali https:// atau http://');
      return;
    }

    setIsLoadingUrl(true);
    // Use server proxy for foreign video URLs to guarantee CORS compatibility with Canvas
    const proxiedUrl = `/api/proxy-video?url=${encodeURIComponent(trimmed)}`;
    const inferredName = urlTitle.trim() || trimmed.split('/').pop()?.split('?')[0] || 'Video dari URL';

    try {
      // Test if proxy can reach it or direct link
      const testReq = await fetch(proxiedUrl, { method: 'GET', headers: { Range: 'bytes=0-1000' } });
      if (!testReq.ok) {
        // If proxy failed, still provide the direct URL as fallback
        console.warn('Proxy test had non-200/206 status, falling back to direct URL');
        onSelectUrl(trimmed, inferredName);
      } else {
        onSelectUrl(proxiedUrl, inferredName);
      }
      setIsLoadingUrl(false);
      onClose();
    } catch (err: any) {
      console.warn('Proxy probe error, trying direct link:', err);
      // Still allow trying direct url
      onSelectUrl(trimmed, inferredName);
      setIsLoadingUrl(false);
      onClose();
    }
  };

  const handleSelectSample = (sample: SampleVideoItem) => {
    // Curated samples can be loaded via proxy or direct
    const proxied = `/api/proxy-video?url=${encodeURIComponent(sample.url)}`;
    onSelectUrl(proxied, sample.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pilih Sumber Video</h2>
              <p className="text-xs text-slate-400">Pilih dari komputer (PC) Anda atau masukkan URL video apa saja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-800/80">
          <button
            id="tab-upload-pc"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 text-red-400" />
            <span>Upload dari PC</span>
          </button>

          <button
            id="tab-video-url"
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'url'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4 text-blue-400" />
            <span>Dari URL Video Mana Saja</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div
                id="dropzone-upload-pc"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <Upload className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Drag & Drop file video dari PC Anda di sini
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  Mendukung format MP4, WebM, MOV, atau MKV dengan resolusi apa saja (1080p, 4K, 720p).
                </p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
                >
                  Jelajahi File Komputer
                </button>
              </div>

              <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Video diproses langsung secara lokal di browser Anda dengan kecepatan maksimal, tanpa batasan ukuran file yang kaku!
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Form Input URL */}
              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Masukkan URL Video Langsung (.mp4 / .webm / URL video publik):
                  </label>
                  <div className="relative">
                    <input
                      id="input-video-url-field"
                      type="url"
                      placeholder="https://contoh.com/video.mp4 atau link video publik lainnya..."
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-3.5 pr-24 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                      disabled={isLoadingUrl}
                    />
                    <button
                      type="submit"
                      disabled={isLoadingUrl || !inputUrl.trim()}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      {isLoadingUrl ? 'Memuat...' : 'Gunakan'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Judul / Catatan Video (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Podcast Highlight / Clip Gaming / Tips Masak"
                    value={urlTitle}
                    onChange={(e) => setUrlTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {urlError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{urlError}</span>
                  </div>
                )}
              </form>

              {/* Sample Videos to Quick Test with Region Filter */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Contoh Video Siap Pakai (1-Klik):
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSampleFilter('all')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        sampleFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSampleFilter('indonesia')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        sampleFilter === 'indonesia' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🇮🇩 Indonesia
                    </button>
                    <button
                      type="button"
                      onClick={() => setSampleFilter('global')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        sampleFilter === 'global' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🌍 Luar Negeri
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredSamples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-600/10 border border-red-500/20 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-red-400 transition-colors shrink-0">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                            {sample.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">{sample.durationLabel}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{sample.description}</p>
                        {sample.badgeLabel && (
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                            {sample.badgeLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Proxy note */}
              <div className="text-[11px] text-slate-400 bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
                💡 <span className="font-semibold text-slate-300">Tips:</span> URL video eksternal secara otomatis diproses melalui proxy aman sehingga frame video dapat di-render ke format 9:16 Shorts dan di-download tanpa kendala batasan CORS.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
