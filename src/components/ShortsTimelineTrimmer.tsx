import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  FastForward,
  Rewind,
  Scissors,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { TrimState } from '../types';

interface ShortsTimelineTrimmerProps {
  totalDuration: number;
  trim: TrimState;
  onUpdateTrim: (updates: Partial<TrimState>) => void;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onOpenAiSmartCut?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
}

export const ShortsTimelineTrimmer: React.FC<ShortsTimelineTrimmerProps> = ({
  totalDuration,
  trim,
  onUpdateTrim,
  onSeek,
  onTogglePlay,
  onOpenAiSmartCut,
}) => {
  const clipDuration = Math.max(0, trim.endTime - trim.startTime);
  const isShortsCompliant = clipDuration > 0 && clipDuration <= 60.5;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val < trim.endTime) {
      onUpdateTrim({ startTime: val });
      if (trim.currentTime < val) {
        onSeek(val);
      }
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val > trim.startTime) {
      onUpdateTrim({ endTime: val });
      if (trim.currentTime > val) {
        onSeek(val);
      }
    }
  };

  const handleSeekScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  const applyDurationPreset = (seconds: number) => {
    const newEnd = Math.min(totalDuration, trim.startTime + seconds);
    onUpdateTrim({ endTime: newEnd });
  };

  const snapTo59Seconds = () => {
    const newEnd = Math.min(totalDuration, trim.startTime + 59);
    onUpdateTrim({ endTime: newEnd });
  };

  const startPercent = totalDuration > 0 ? (trim.startTime / totalDuration) * 100 : 0;
  const endPercent = totalDuration > 0 ? (trim.endTime / totalDuration) * 100 : 100;
  const currentPercent = totalDuration > 0 ? (trim.currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header Info: Clip Length & YouTube Shorts Rule */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Pemotong Klip Shorts</span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-mono font-semibold text-slate-300">
            {formatTime(clipDuration)}
          </span>
        </div>

        {/* Shorts Compliance Badge & AI Smart Cut Button */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiSmartCut && (
            <button
              id="btn-open-ai-smart-cut"
              type="button"
              onClick={onOpenAiSmartCut}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-red-600 hover:from-violet-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5 border border-violet-400/30"
              title="Gunakan AI untuk menemukan momen paling viral dan memotong video otomatis"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Smart Cut (Auto-Pangkas)</span>
            </button>
          )}

          {isShortsCompliant ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Memenuhi Syarat Shorts (≤60s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Melebihi 60 Detik ({clipDuration.toFixed(1)}s)</span>
              </div>
              <button
                id="btn-snap-59s"
                onClick={snapTo59Seconds}
                className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold transition-colors shadow-sm"
              >
                Pangkas ke 59 Detik
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Timeline Bar with Trim Handles & Current Playhead */}
      <div className="space-y-2">
        <div className="relative h-12 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none">
          {/* Timeline Tick markers */}
          <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-full w-[1px] bg-white flex flex-col justify-between py-1">
                <span className="w-full h-1 bg-white"></span>
                <span className="w-full h-1 bg-white"></span>
              </div>
            ))}
          </div>

          {/* Active Highlight Range (The Shorts Clip) */}
          <div
            className="absolute top-0 bottom-0 bg-red-500/25 border-y-2 border-red-500 pointer-events-none transition-all"
            style={{
              left: `${startPercent}%`,
              width: `${Math.max(0, endPercent - startPercent)}%`,
            }}
          />

          {/* Current Playhead Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-20 transition-transform"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="w-3 h-3 bg-white rounded-full -ml-[5px] -mt-1 shadow-md shadow-black" />
          </div>

          {/* Range Sliders for Trim */}
          {/* 1. Scrubber (invisible track, accessible thumb) */}
          <input
            id="scrubber-timeline"
            type="range"
            min={0}
            max={totalDuration || 100}
            step={0.1}
            value={trim.currentTime}
            onChange={handleSeekScrub}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            title="Scrub waktu video"
          />
        </div>

        {/* Trim In & Trim Out Manual Sliders */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Titik Awal (In):</span>
              <span className="font-mono text-red-400 font-bold">{formatTime(trim.startTime)}</span>
            </div>
            <input
              id="slider-trim-start"
              type="range"
              min={0}
              max={Math.max(0, totalDuration - 1)}
              step={0.1}
              value={trim.startTime}
              onChange={handleStartChange}
              className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Titik Akhir (Out):</span>
              <span className="font-mono text-red-400 font-bold">{formatTime(trim.endTime)}</span>
            </div>
            <input
              id="slider-trim-end"
              type="range"
              min={1}
              max={totalDuration || 100}
              step={0.1}
              value={trim.endTime}
              onChange={handleEndChange}
              className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Controls Bar: Playback, Speed, Preset, Volume */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-replay-from-start"
            onClick={() => onSeek(trim.startTime)}
            title="Ulang dari awal klip"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-seek-backward-3s"
            onClick={() => onSeek(Math.max(trim.startTime, trim.currentTime - 3))}
            title="Mundur 3 detik"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-play-timeline"
            onClick={onTogglePlay}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-2"
          >
            {trim.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            <span className="text-xs">{trim.isPlaying ? 'Jeda' : 'Putar'}</span>
          </button>

          <button
            id="btn-seek-forward-3s"
            onClick={() => onSeek(Math.min(trim.endTime, trim.currentTime + 3))}
            title="Maju 3 detik"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            id="btn-toggle-loop"
            onClick={() => onUpdateTrim({ loop: !trim.loop })}
            title={trim.loop ? 'Loop Aktif' : 'Loop Nonaktif'}
            className={`p-2 rounded-xl border transition-colors ${
              trim.loop
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-transparent'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Duration Presets for Shorts */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 px-1.5 font-medium">Preset:</span>
          {[15, 30, 59].map((sec) => (
            <button
              key={sec}
              onClick={() => applyDurationPreset(sec)}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {sec}s
            </button>
          ))}
          {onOpenAiSmartCut && (
            <button
              type="button"
              onClick={onOpenAiSmartCut}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-violet-300 hover:text-white hover:bg-violet-600/30 transition-colors flex items-center gap-1"
              title="Pangkas dengan AI"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>AI Cut</span>
            </button>
          )}
        </div>

        {/* Speed & Volume */}
        <div className="flex items-center gap-3">
          {/* Speed selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="text-[11px]">Kecepatan:</span>
            <select
              id="select-playback-rate"
              value={trim.playbackRate}
              onChange={(e) => onUpdateTrim({ playbackRate: parseFloat(e.target.value) })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x (Viral)</option>
              <option value="1.5">1.5x (Cepat)</option>
            </select>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-toggle-mute"
              onClick={() => onUpdateTrim({ isMuted: !trim.isMuted })}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              {trim.isMuted || trim.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              id="slider-volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={trim.isMuted ? 0 : trim.volume}
              onChange={(e) => onUpdateTrim({ volume: parseFloat(e.target.value), isMuted: false })}
              className="w-16 accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
