import React from 'react';
import { HelpCircle, X, CheckCircle2, Youtube, Flame, Clock, Smartphone, Sparkles } from 'lucide-react';

interface ShortsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortsGuideModal: React.FC<ShortsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Panduan Algoritma YouTube Shorts</h2>
              <p className="text-xs text-slate-400">Tips dan trik agar video Anda direkomendasikan algoritma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
            <Smartphone className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">1. Rasio Vertikal 9:16 Wajib</h4>
              <p className="text-slate-400 leading-relaxed">
                YouTube Shorts khusus untuk tampilan layar penuh ponsel (vertikal 1080x1920). Gunakan fitur Mirror Blur atau Fill & Crop di aplikasi ini agar video horizontal pas di layar 9:16.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">2. Durasi Maksimal 60 Detik</h4>
              <p className="text-slate-400 leading-relaxed">
                Batas resmi YouTube Shorts adalah 60 detik. Durasi terbaik dengan retensi tertinggi umumnya berada di antara 20–45 detik. Gunakan timeline trimmer di bawah preview untuk memotong klip Anda.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
            <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">3. Hook 3 Detik Pertama (Stop The Scroll)</h4>
              <p className="text-slate-400 leading-relaxed">
                Penonton YouTube Shorts memutuskan untuk bertahan atau scroll dalam 2–3 detik pertama. Pasang Banner Hook di bagian atas layar dan gunakan AI Assistant untuk menemukan kalimat pembuka yang mengejutkan.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">4. Subtitle Bergaya Alex Hormozi</h4>
              <p className="text-slate-400 leading-relaxed">
                Lebih dari 65% penonton menonton video pendek tanpa suara (di tempat umum). Subtitle dengan huruf besar dan warna kontras kuning/putih menjaga penonton tetap fokus hingga akhir video.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-blue-950/40 border border-blue-500/30 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <span>🇮🇩 vs 🌍 Perbedaan Strategi Indonesia vs Luar Negeri:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-red-950/20 border border-red-500/20">
                <span className="font-bold text-red-400 block mb-0.5">🇮🇩 Shorts Indonesia:</span>
                <p className="text-slate-400 leading-tight">
                  Target jam tayang 12.00-13.00 & 19.00-21.00 WIB. Bahasa gaul, rasa penasaran tinggi, komentar interaktif, dan trending lokal.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-950/20 border border-blue-500/20">
                <span className="font-bold text-blue-400 block mb-0.5">🌍 Shorts Luar Negeri (US/Global):</span>
                <p className="text-slate-400 leading-tight">
                  Target jam tayang 23.00-02.00 WIB (Siang di US EST). Bahasa Inggris, visual dinamis, CPM AdSense 5x-10x lebih tinggi!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
          >
            Saya Mengerti, Mulai Buat Shorts!
          </button>
        </div>
      </div>
    </div>
  );
};
