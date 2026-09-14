import React, { useState } from 'react';
import {
  Layout,
  Type,
  Sparkles,
  Palette,
  Sliders,
  Layers,
  Flame,
  Check,
  Smartphone,
  Eye,
  Globe2,
} from 'lucide-react';
import { FramingMode, FramingState, OverlayConfig, ShortsRegion } from '../types';

interface ShortsStyleEditorProps {
  framing: FramingState;
  overlay: OverlayConfig;
  onUpdateFraming: (updates: Partial<FramingState>) => void;
  onUpdateOverlay: (updates: Partial<OverlayConfig>) => void;
  targetRegion?: ShortsRegion;
  onChangeTargetRegion?: (region: ShortsRegion) => void;
}

const HOOKS_INDONESIA = [
  'JANGAN SKIP! 😱',
  'RAHASIA VIRAL ⚡',
  'TONTON SAMPAI HABIS 🔥',
  'GAK NYANGKA BANGET 🤯',
  'FAKTA MENGEJUTKAN 🚨',
  'TIPS GILA 💡',
  'JANGAN LAKUKAN INI ❌',
  'PART 1 👉',
];

const HOOKS_GLOBAL = [
  'WAIT TILL THE END 😱',
  'STOP SCROLLING! 🛑',
  'NOBODY TALKS ABOUT THIS 🤫',
  '99% OF PEOPLE DON\'T KNOW ⚡',
  'WATCH WHAT HAPPENS 🔥',
  'THIS IS INSANE 🤯',
  'DO NOT MAKE THIS MISTAKE ❌',
  'PART 1 👉',
];

const CAPTIONS_INDONESIA = [
  'INILAH RAHASIA BESARNYA!',
  'TONTON SAMPAI SELESAI!',
  'KAMU GAK AKAN PERCAYA!',
  'INI DIA BUKTINYA!',
];

const CAPTIONS_GLOBAL = [
  'THE BIGGEST SECRET REVEALED!',
  'WAIT TILL THE END!',
  'YOU WON\'T BELIEVE THIS!',
  'HERE IS THE TRUTH!',
];

export const ShortsStyleEditor: React.FC<ShortsStyleEditorProps> = ({
  framing,
  overlay,
  onUpdateFraming,
  onUpdateOverlay,
  targetRegion = 'indonesia',
  onChangeTargetRegion,
}) => {
  const [activeHookLang, setActiveHookLang] = useState<'id' | 'en'>(
    targetRegion === 'global' ? 'en' : 'id'
  );

  const activeHooks = activeHookLang === 'id' ? HOOKS_INDONESIA : HOOKS_GLOBAL;
  const activeCaptions = activeHookLang === 'id' ? CAPTIONS_INDONESIA : CAPTIONS_GLOBAL;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Format & Visual Shorts</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
          Aspek 9:16 Vertikal
        </span>
      </div>

      {/* 1. Framing Mode Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Metode Konversi ke 9:16 YouTube Shorts:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            id="btn-framing-blur-fill"
            onClick={() => onUpdateFraming({ mode: 'blur_fill' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              framing.mode === 'blur_fill'
                ? 'bg-red-500/15 border-red-500 text-white shadow-md shadow-red-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Mirror Blur</span>
              {framing.mode === 'blur_fill' && <Check className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Latar belakang blur cermin. Format paling populer untuk video 16:9 ke Shorts!
            </p>
          </button>

          <button
            id="btn-framing-crop-fill"
            onClick={() => onUpdateFraming({ mode: 'crop_fill' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              framing.mode === 'crop_fill'
                ? 'bg-red-500/15 border-red-500 text-white shadow-md shadow-red-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Fill & Crop</span>
              {framing.mode === 'crop_fill' && <Check className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Zoom penuh mengisi 9:16. Geser posisi horizontal untuk fokus ke subjek utama.
            </p>
          </button>

          <button
            id="btn-framing-fit-letterbox"
            onClick={() => onUpdateFraming({ mode: 'fit_letterbox' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              framing.mode === 'fit_letterbox'
                ? 'bg-red-500/15 border-red-500 text-white shadow-md shadow-red-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Letterbox</span>
              {framing.mode === 'fit_letterbox' && <Check className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Pertahankan rasio asli dengan bingkai warna di atas dan bawah.
            </p>
          </button>
        </div>

        {/* Pan X / Pan Y Sliders */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Posisi Fokus Horizontal (Pan X):</span>
            <span className="font-mono text-slate-300">{framing.panX}%</span>
          </div>
          <input
            id="slider-pan-x"
            type="range"
            min="-50"
            max="50"
            value={framing.panX}
            onChange={(e) => onUpdateFraming({ panX: parseInt(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* 2. Top Hook Banner */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Banner Hook Atas (Penangkap Perhatian)</span>
          </label>
          <button
            id="toggle-hook-banner"
            onClick={() => onUpdateOverlay({ showHook: !overlay.showHook })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              overlay.showHook ? 'bg-red-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                overlay.showHook ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {overlay.showHook && (
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">Teks Banner Hook:</span>
                {/* Switcher for Hook preset language */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveHookLang('id')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      activeHookLang === 'id'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🇮🇩 ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHookLang('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      activeHookLang === 'en'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🌍 Global
                  </button>
                </div>
              </div>
              <input
                id="input-hook-text"
                type="text"
                placeholder={activeHookLang === 'id' ? 'Contoh: JANGAN SKIP! 😱' : 'Example: WAIT TILL THE END 😱'}
                value={overlay.hookText}
                onChange={(e) => onUpdateOverlay({ hookText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            {/* Hook Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400">
                  Preset Hook {activeHookLang === 'id' ? 'Shorts Indonesia' : 'Shorts Luar Negeri / Global'}:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeHooks.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => onUpdateOverlay({ hookText: preset })}
                    className="px-2 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Hook Colors & Size */}
            <div className="flex items-center justify-between gap-4 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Warna Banner:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Merah', color: '#dc2626' },
                    { label: 'Kuning', color: '#eab308' },
                    { label: 'Hitam', color: '#000000' },
                    { label: 'Biru', color: '#2563eb' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => onUpdateOverlay({ hookBgColor: c.color })}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        overlay.hookBgColor === c.color ? 'scale-125 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Ukuran:</span>
                <input
                  id="slider-hook-font-size"
                  type="range"
                  min="24"
                  max="48"
                  value={overlay.hookFontSize}
                  onChange={(e) => onUpdateOverlay({ hookFontSize: parseInt(e.target.value) })}
                  className="w-20 accent-red-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Subtitles / Captions (Alex Hormozi Viral Style) */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white flex items-center gap-2">
            <Type className="w-4 h-4 text-yellow-400" />
            <span>Subtitle & Teks Viral (Alex Hormozi Style)</span>
          </label>
          <button
            id="toggle-captions"
            onClick={() => onUpdateOverlay({ showCaption: !overlay.showCaption })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              overlay.showCaption ? 'bg-red-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                overlay.showCaption ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {overlay.showCaption && (
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Teks Subtitle / Kata Kunci Layar:
              </label>
              <input
                id="input-caption-text"
                type="text"
                placeholder={activeHookLang === 'id' ? 'Contoh: INILAH RAHASIA BESARNYA!' : 'Example: WAIT TILL THE END!'}
                value={overlay.captionText}
                onChange={(e) => onUpdateOverlay({ captionText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-extrabold uppercase"
              />
              {/* Preset caption chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeCaptions.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => onUpdateOverlay({ captionText: cap })}
                    className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors uppercase font-bold"
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Color Themes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'hormozi_yellow', name: 'Kuning Hormozi', color: '#ffe600' },
                { id: 'tiktok_white', name: 'Putih TikTok', color: '#ffffff' },
                { id: 'neon_green', name: 'Hijau Neon', color: '#00ff66' },
                { id: 'fire_red', name: 'Merah Api', color: '#ff2b2b' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    onUpdateOverlay({
                      captionStyle: style.id as any,
                      captionColor: style.color,
                    })
                  }
                  className={`p-2 rounded-lg border text-center text-xs font-bold transition-all ${
                    overlay.captionStyle === style.id
                      ? 'border-white bg-slate-800 text-white'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <span style={{ color: style.color }}>{style.name}</span>
                </button>
              ))}
            </div>

            {/* Position & Size */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Posisi Layar:</span>
                <select
                  id="select-caption-position"
                  value={overlay.captionPosition}
                  onChange={(e) => onUpdateOverlay({ captionPosition: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="bottom">Bawah (Lower Third)</option>
                  <option value="center">Tengah (High Impact)</option>
                  <option value="top">Atas</option>
                </select>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Ukuran Font:</span>
                <input
                  id="slider-caption-font-size"
                  type="range"
                  min="28"
                  max="64"
                  value={overlay.captionFontSize}
                  onChange={(e) => onUpdateOverlay({ captionFontSize: parseInt(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Filter & Retention Boosters */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <label className="block text-xs font-semibold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Filter Warna & Penguat Retensi Penonton</span>
        </label>

        {/* Color Filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'none', label: 'Asli' },
            { id: 'vibrant', label: 'Vibrant (+Warna)' },
            { id: 'high_contrast', label: 'Kontras Tajam' },
            { id: 'warm', label: 'Hangat (Warm)' },
            { id: 'cool', label: 'Dingin (Cool)' },
            { id: 'grayscale', label: 'Hitam Putih' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => onUpdateOverlay({ filter: f.id as any })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                overlay.filter === f.id
                  ? 'bg-red-600/20 border-red-500 text-red-400 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bottom Progress Bar & Watermark toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Progress Bar Bawah</span>
              <span className="text-[10px] text-slate-400">Garis merah durasi berjalan</span>
            </div>
            <button
              id="toggle-progress-bar"
              onClick={() => onUpdateOverlay({ showProgressBar: !overlay.showProgressBar })}
              className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                overlay.showProgressBar ? 'bg-red-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                  overlay.showProgressBar ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Watermark / Akun</span>
              <button
                id="toggle-watermark"
                onClick={() => onUpdateOverlay({ showWatermark: !overlay.showWatermark })}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                  overlay.showWatermark ? 'bg-red-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                    overlay.showWatermark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {overlay.showWatermark && (
              <input
                id="input-watermark-text"
                type="text"
                placeholder="@nama_channel"
                value={overlay.watermarkText}
                onChange={(e) => onUpdateOverlay({ watermarkText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 px-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
