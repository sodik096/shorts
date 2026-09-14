import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  Play,
  Pause,
  Check,
  Clock,
  Flame,
  Zap,
  RotateCcw,
  X,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  BookmarkCheck,
  RefreshCw,
  Video,
} from 'lucide-react';
import { AiSmartSegment, AiSmartTrimResponse, ShortsRegion } from '../types';

interface AiSmartCutModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  totalDuration: number;
  currentStartTime: number;
  currentEndTime: number;
  targetRegion: ShortsRegion;
  onApplyTrim: (segment: AiSmartSegment, applyHookText: boolean, applyTitle: boolean) => void;
  onPreviewTimeRange: (startTime: number, endTime: number) => void;
}

export const AiSmartCutModal: React.FC<AiSmartCutModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  totalDuration,
  currentStartTime,
  currentEndTime,
  targetRegion,
  onApplyTrim,
  onPreviewTimeRange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AiSmartTrimResponse | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [filterGoal, setFilterGoal] = useState<'all' | 'hook' | 'climactic' | 'story' | 'fast'>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [applyHookBanner, setApplyHookBanner] = useState(true);
  const [applyShortsTitle, setApplyShortsTitle] = useState(true);
  const [previewingSegmentId, setPreviewingSegmentId] = useState<string | null>(null);

  // Fetch AI Smart Trim from server
  const fetchSmartTrim = async (promptOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/smart-trim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: videoTitle || 'Video YouTube Shorts',
          totalDuration: Math.max(15, totalDuration || 60),
          focusGoal: filterGoal,
          targetRegion,
          customPrompt: promptOverride !== undefined ? promptOverride : customPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result: AiSmartTrimResponse = await response.json();
      setData(result);
      if (result.segments && result.segments.length > 0) {
        setSelectedSegmentId(result.bestSegmentId || result.segments[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch smart trim:', err);
      setError(err.message || 'Gagal menganalisis pemotongan AI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data && !loading) {
      fetchSmartTrim();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatSec = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  const filteredSegments = (data?.segments || []).filter((seg) => {
    if (filterGoal === 'all') return true;
    return seg.pacing === filterGoal;
  });

  const selectedSegment = (data?.segments || []).find((s) => s.id === selectedSegmentId) || filteredSegments[0];

  const handleApply = () => {
    if (selectedSegment) {
      onApplyTrim(selectedSegment, applyHookBanner, applyShortsTitle);
      onClose();
    }
  };

  const handleTogglePreview = (seg: AiSmartSegment) => {
    if (previewingSegmentId === seg.id) {
      setPreviewingSegmentId(null);
    } else {
      setPreviewingSegmentId(seg.id);
      onPreviewTimeRange(seg.startTime, seg.endTime);
    }
  };

  return (
    <div
      id="modal-ai-smart-cut-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="modal-ai-smart-cut-container"
        className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-red-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>AI Smart Cut & Highlight Finder</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-red-600 to-pink-600 text-white tracking-wider uppercase">
                    Gemini AI
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deteksi otomatis momen paling viral & potong video dengan retensi algoritma YouTube Shorts tertinggi (≤59s).
              </p>
            </div>
          </div>

          <button
            id="btn-close-smart-cut-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Quick AI Filter & Prompt Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
                <span>Pilih Gaya Potongan Algoritma:</span>
              </div>

              {/* Regenerate Button */}
              <button
                id="btn-regenerate-ai-cuts"
                onClick={() => fetchSmartTrim()}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Menganalisis...' : 'Analisis Ulang'}</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Semua Rekomendasi AI', icon: Sparkles },
                { id: 'hook', label: '⚡ Hook Kilat (15-25s)', icon: Zap },
                { id: 'climactic', label: '🔥 Puncak Aksi / Emas (30-45s)', icon: Flame },
                { id: 'story', label: '🎬 Alur Cerita Utuh (45-59s)', icon: Video },
                { id: 'fast', label: '🚀 Fast-Paced Loop (15-20s)', icon: TrendingUp },
              ].map((f) => {
                const Icon = f.icon;
                const active = filterGoal === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterGoal(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      active
                        ? 'bg-gradient-to-r from-violet-600/30 to-red-600/30 text-white border-violet-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-violet-400" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom AI Instruction Bar */}
            <div className="flex gap-2 pt-1">
              <input
                id="input-custom-ai-cut-prompt"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchSmartTrim();
                }}
                placeholder="Instruksi khusus AI: contoh: 'Cari bagian saat menjelaskan trik rahasia' atau 'Cari momen reaksi lucu'..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                id="btn-apply-custom-ai-prompt"
                onClick={() => fetchSmartTrim()}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cari Momen</span>
              </button>
            </div>
          </div>

          {/* Timeline Overview with highlighted cut segments */}
          {totalDuration > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Peta Garis Waktu Video Asli ({formatSec(totalDuration)})</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Potongan saat ini: {formatSec(currentStartTime)} - {formatSec(currentEndTime)} ({(currentEndTime - currentStartTime).toFixed(1)}s)
                </span>
              </div>

              {/* Macro Timeline Visualizer */}
              <div className="relative h-9 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none">
                {/* Current manual trim region */}
                <div
                  className="absolute top-0 bottom-0 bg-slate-700/40 border-x border-slate-500 pointer-events-none"
                  style={{
                    left: `${(currentStartTime / totalDuration) * 100}%`,
                    width: `${Math.max(2, ((currentEndTime - currentStartTime) / totalDuration) * 100)}%`,
                  }}
                  title="Rentang potong saat ini"
                />

                {/* AI Segment Markers */}
                {(data?.segments || []).map((seg, idx) => {
                  const isSelected = selectedSegmentId === seg.id;
                  const startPct = (seg.startTime / totalDuration) * 100;
                  const widthPct = Math.max(3, (seg.duration / totalDuration) * 100);

                  return (
                    <div
                      key={seg.id}
                      onClick={() => setSelectedSegmentId(seg.id)}
                      className={`absolute top-0.5 bottom-0.5 rounded-lg cursor-pointer transition-all border flex items-center justify-center ${
                        isSelected
                          ? 'bg-red-500/80 border-white text-white z-20 shadow-lg shadow-red-500/50 ring-2 ring-red-400/50'
                          : 'bg-violet-600/40 hover:bg-violet-500/60 border-violet-400/40 text-violet-200 z-10'
                      }`}
                      style={{
                        left: `${startPct}%`,
                        width: `${widthPct}%`,
                      }}
                      title={`${seg.title} (${formatSec(seg.startTime)} - ${formatSec(seg.endTime)})`}
                    >
                      <span className="text-[10px] font-extrabold truncate px-1">
                        #{idx + 1} {seg.duration.toFixed(0)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Pacing & Overall Insights Banner */}
          {data?.suggestedPacingTip && (
            <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-violet-200 block">Analisis AI Retensi Algoritma:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {data.overallAnalysis || data.suggestedPacingTip}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-3 py-6 text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-800/80 animate-pulse text-violet-400">
                <Scissors className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Gemini AI sedang menganalisis alur cerita video...</p>
                <p className="text-xs text-slate-400">
                  Mendeteksi titik hook 3 detik awal, puncak klimaks, dan durasi optimal YouTube Shorts (≤59s).
                </p>
              </div>
            </div>
          )}

          {/* Segments Grid */}
          {!loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-bold text-white">Daftar Segmen Potongan Terpilih:</span>
                <span>{filteredSegments.length} klip siap pakai</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSegments.map((seg, idx) => {
                  const isSelected = selectedSegmentId === seg.id;
                  const isPreviewing = previewingSegmentId === seg.id;

                  return (
                    <div
                      key={seg.id}
                      onClick={() => setSelectedSegmentId(seg.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-900 border-red-500 shadow-lg shadow-red-600/10 ring-1 ring-red-500/50'
                          : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-700">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-white line-clamp-1">
                              {seg.title}
                            </span>
                          </div>

                          {/* Viral Score Badge */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold shrink-0">
                            <Flame className="w-3 h-3 text-red-400" />
                            <span>{seg.viralScore}% Viral Score</span>
                          </div>
                        </div>

                        {/* Timestamp & Duration */}
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="px-2 py-1 rounded bg-black/50 text-emerald-400 font-bold border border-slate-800">
                            {formatSec(seg.startTime)} → {formatSec(seg.endTime)}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({seg.duration.toFixed(1)}s)
                          </span>
                          {seg.duration <= 60 && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-sans">
                              ✓ Syarat Shorts
                            </span>
                          )}
                        </div>

                        {/* Hook Reason */}
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                          <span className="font-bold text-violet-300">Mengapa Viral: </span>
                          {seg.hookReason}
                        </p>

                        {/* Suggested Hook Text Banner */}
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                            Rekomendasi Teks Hook Banner:
                          </span>
                          <div className="font-bold text-amber-300 bg-black/40 px-2 py-1 rounded border border-amber-500/20 flex items-center justify-between">
                            <span>"{seg.suggestedHookText}"</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreview(seg);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                        >
                          {isPreviewing ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-400" />
                              <span>Jeda Klip</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                              <span>Dengarkan Klip</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSegmentId(seg.id);
                            onApplyTrim(seg, applyHookBanner, applyShortsTitle);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition-all shadow-md shadow-red-600/20 flex items-center gap-1"
                        >
                          <span>Pilih Segmen Ini</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 w-full sm:w-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-apply-hook-banner"
                type="checkbox"
                checked={applyHookBanner}
                onChange={(e) => setApplyHookBanner(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500 cursor-pointer"
              />
              <span>Terapkan Teks Hook AI ke Banner Atas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-apply-shorts-title"
                type="checkbox"
                checked={applyShortsTitle}
                onChange={(e) => setApplyShortsTitle(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500 cursor-pointer"
              />
              <span>Perbarui Judul Video dengan Judul Viral AI</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="btn-cancel-smart-cut"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              id="btn-apply-selected-smart-cut"
              onClick={handleApply}
              disabled={!selectedSegment}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:via-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                Terapkan Potongan Ini (
                {selectedSegment ? `${formatSec(selectedSegment.startTime)} - ${formatSec(selectedSegment.endTime)}` : ''}
                )
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
