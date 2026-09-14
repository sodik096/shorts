import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Flame,
  Hash,
  FileText,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Clock,
  Globe2,
  TrendingUp,
  DollarSign,
  Scissors,
} from 'lucide-react';
import { AiShortsData, ShortsRegion } from '../types';

interface AiAssistantPanelProps {
  currentTitle: string;
  clipDuration: number;
  onApplyHookBanner: (text: string) => void;
  onApplyCaption: (text: string) => void;
  onSelectTitle: (title: string) => void;
  targetRegion: ShortsRegion;
  onChangeTargetRegion: (region: ShortsRegion) => void;
  onOpenAiSmartCut?: () => void;
}

const TOPIC_SUGGESTIONS_INDONESIA = [
  'Kuliner Pinggir Jalan Viral 🍜',
  'Trik Hemat & Finansial 💰',
  'Misteri Horor & Kisah Nyata 👻',
  'Fakta Unik Bikin Melongo 😲',
  'Tutorial Kilat 30 Detik ⚡',
];

const TOPIC_SUGGESTIONS_GLOBAL = [
  'Mind-Blowing Science Facts 🧠',
  'Secret Life Hacks Nobody Knows 🤫',
  'High-Tech Future Inventions 🚀',
  'Extreme Satisfying Kinetic Loop ✨',
  'Dark Psychology Triggers ⚡',
];

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  currentTitle,
  clipDuration,
  onApplyHookBanner,
  onApplyCaption,
  onSelectTitle,
  targetRegion,
  onChangeTargetRegion,
  onOpenAiSmartCut,
}) => {
  const [topic, setTopic] = useState(currentTitle || '');
  const [language, setLanguage] = useState<'id' | 'en'>(
    targetRegion === 'global' ? 'en' : 'id'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [aiData, setAiData] = useState<AiShortsData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync language with targetRegion when user switches
  useEffect(() => {
    setLanguage(targetRegion === 'global' ? 'en' : 'id');
  }, [targetRegion]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateAiContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/shorts-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || currentTitle || (targetRegion === 'indonesia' ? 'Video viral Indonesia' : 'Trending viral Shorts clip'),
          currentTitle,
          clipDuration: Math.round(clipDuration || 30),
          language,
          targetRegion,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Gagal menghubungi AI (${res.status})`);
      }

      const data: AiShortsData = await res.json();
      setAiData(data);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeSuggestions = targetRegion === 'indonesia'
    ? TOPIC_SUGGESTIONS_INDONESIA
    : TOPIC_SUGGESTIONS_GLOBAL;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI YouTube Shorts Generator
            </h3>
            <p className="text-[11px] text-slate-400">
              Optimalisasi algoritma khusus pasar Indonesia atau Luar Negeri
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
          Gemini 3.8 Flash
        </span>
      </div>

      {/* Target Market Selector Segmented Control */}
      {onOpenAiSmartCut && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-red-950/40 border border-violet-700/40 flex items-center justify-between gap-3 shadow-lg shadow-violet-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-violet-600/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">AI Smart Cut & Highlight Finder</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-600 text-white uppercase">
                  Viral
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Temukan momen paling viral otomatis dengan hook 3 detik awal & retensi tertinggi (≤59s).
              </p>
            </div>
          </div>

          <button
            id="btn-trigger-ai-cut-from-panel"
            type="button"
            onClick={onOpenAiSmartCut}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-red-600 hover:from-violet-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Potong via AI</span>
          </button>
        </div>
      )}

      {/* Target Market Selector Segmented Control */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Pilih Target Pasar Shorts:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {targetRegion === 'indonesia' ? 'Pasar Lokal ID' : 'Pasar Global High CPM'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onChangeTargetRegion('indonesia');
              setLanguage('id');
            }}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
              targetRegion === 'indonesia'
                ? 'bg-red-500/15 border-red-500 text-white shadow-md shadow-red-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-lg leading-none mt-0.5">🇮🇩</span>
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Shorts Indonesia</span>
                {targetRegion === 'indonesia' && <Check className="w-3 h-3 text-red-400" />}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Bahasa Indonesia, tren lokal viral, prime-time WIB
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeTargetRegion('global');
              setLanguage('en');
            }}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
              targetRegion === 'global'
                ? 'bg-blue-500/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-lg leading-none mt-0.5">🌍</span>
            <div>
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Shorts Luar Negeri</span>
                {targetRegion === 'global' && <Check className="w-3 h-3 text-blue-400" />}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                English, CPM AdSense 5x-10x, US & Global Feed
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Input context */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Topik / Tema Video Shorts:
          </label>
          <div className="flex gap-2">
            <input
              id="input-ai-topic"
              type="text"
              placeholder={
                targetRegion === 'indonesia'
                  ? 'Contoh: Resep jajanan viral, trik coding cepat, momen kocak, cerita misteri...'
                  : 'Example: Mind blowing life hacks, crazy tech reveal, satisfying physics loop...'
              }
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <select
              id="select-ai-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="id">🇮🇩 Bahasa ID</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] text-slate-500 self-center">Inspirasi:</span>
            {activeSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(item.replace(/[🍜💰👻😲⚡🧠🤫🚀✨]/g, '').trim())}
                className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-generate-ai-shorts"
          onClick={generateAiContent}
          disabled={isLoading}
          className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
            targetRegion === 'indonesia'
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:via-rose-500 hover:to-amber-500 shadow-red-600/20'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:via-indigo-500 hover:to-emerald-500 shadow-blue-600/20'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                Menganalisis Algoritma {targetRegion === 'indonesia' ? 'Shorts Indonesia' : 'Global / Luar Negeri'}...
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                Generate Paket Konten {targetRegion === 'indonesia' ? '🇮🇩 Shorts Indonesia' : '🌍 Shorts Luar Negeri'}
              </span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* AI Results */}
      {aiData && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-in fade-in duration-300">
          {/* Target Region Strategy & Best Posting Time Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {aiData.recommendedPostTime && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-xs">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Jam Upload Terbaik:</span>
                  <span className="text-[11px] text-amber-400 font-medium">{aiData.recommendedPostTime}</span>
                </div>
              </div>
            )}

            {aiData.targetAudienceNote && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-xs">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Karakter Audiens & Monetisasi:</span>
                  <span className="text-[11px] text-slate-300 leading-tight block">{aiData.targetAudienceNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* 1. Viral Titles */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>
                Pilihan Judul High-CTR ({targetRegion === 'indonesia' ? 'Indonesia' : 'Global / Luar Negeri'}):
              </span>
            </label>
            <div className="space-y-1.5">
              {aiData.titles.map((title, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-2 transition-colors group"
                >
                  <button
                    onClick={() => onSelectTitle(title)}
                    className="text-left text-xs font-semibold text-slate-200 hover:text-white flex-1 line-clamp-2"
                  >
                    {title}
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectTitle(title)}
                      className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-[10px] font-bold transition-colors"
                      title="Gunakan Judul Ini"
                    >
                      Pilih
                    </button>
                    <button
                      onClick={() => handleCopy(title, `title-${i}`)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Salin Judul"
                    >
                      {copiedKey === `title-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Hooks for First 3 Seconds */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Hook 3 Detik Pertama (Paling Menentukan Retensi):</span>
            </label>
            <div className="space-y-1.5">
              {aiData.hooks.map((hook, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-slate-300 font-medium italic">"{hook}"</span>
                  <button
                    onClick={() => onApplyHookBanner(hook)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1"
                  >
                    <span>Pasang ke Banner</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Suggested Timed Captions */}
          {aiData.suggestedSubtitles && aiData.suggestedSubtitles.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rekomendasi Teks Subtitle Layar:</span>
              </label>
              <div className="space-y-1.5">
                {aiData.suggestedSubtitles.map((sub, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                        {sub.timeRange}
                      </span>
                      <span className="font-bold text-yellow-400">{sub.text}</span>
                    </div>
                    <button
                      onClick={() => onApplyCaption(sub.text)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-yellow-500 hover:text-black text-slate-300 text-[10px] font-semibold transition-colors"
                    >
                      Tampilkan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Hashtags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span>Hashtag YouTube Shorts ({targetRegion === 'indonesia' ? 'ID' : 'Global'}):</span>
              </label>
              <button
                onClick={() => handleCopy(aiData.hashtags.join(' '), 'all-tags')}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedKey === 'all-tags' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Salin Semua</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aiData.hashtags.map((tag, i) => (
                <span
                  key={i}
                  onClick={() => handleCopy(tag, `tag-${i}`)}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium cursor-pointer hover:bg-blue-500/20 transition-colors"
                  title="Klik untuk salin"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 5. Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Deskripsi SEO YouTube:</label>
              <button
                onClick={() => handleCopy(aiData.description, 'desc')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 'desc' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Salin Deskripsi</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {aiData.description}
            </div>
          </div>

          {/* 6. Retention Secret Tips */}
          {aiData.retentionTips && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Lightbulb className="w-4 h-4" />
                <span>Tips Algoritma Shorts ({targetRegion === 'indonesia' ? 'Khusus Indonesia' : 'Khusus Luar Negeri'}):</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                {aiData.retentionTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
