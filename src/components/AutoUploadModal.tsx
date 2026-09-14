import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Share2,
  AlertCircle,
  Key,
  ShieldCheck,
  Film,
  Sparkles,
  ArrowRight,
  Settings,
  History,
  Radio,
  Lock,
  Globe,
  Users,
  MessageSquare,
  Repeat2,
  Scissors,
  BookOpen,
  Terminal,
} from 'lucide-react';
import {
  AutoUploadPayload,
  PlatformUploadResult,
  SocialAccountsState,
  UploadHistoryItem,
  UploadPlatform
} from '../types';
import {
  fetchPlatformStatus,
  connectPlatformDirect,
  disconnectPlatformApi,
  openOAuthPopup,
  uploadUnifiedShorts,
  getUploadHistory
} from '../utils/apiUpload';

interface AutoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderedBlobUrl: string | null;
  thumbnailUrl: string | null;
  videoTitle: string;
  videoDescription?: string;
  hashtags?: string[];
  clipDuration: number;
}

export const AutoUploadModal: React.FC<AutoUploadModalProps> = ({
  isOpen,
  onClose,
  renderedBlobUrl,
  thumbnailUrl,
  videoTitle,
  videoDescription = '',
  hashtags = [],
  clipDuration,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'accounts' | 'history' | 'guide'>('upload');
  const [accounts, setAccounts] = useState<SocialAccountsState>({
    youtube: {
      connected: true,
      channelName: 'Official Shorts Studio ID',
      subscriberCount: '14.8K',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    },
    tiktok: {
      connected: true,
      username: '@creator_shorts_pro',
      subscriberCount: '28.5K',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    },
  });

  // Selected platforms to publish to
  const [selectedPlatforms, setSelectedPlatforms] = useState<UploadPlatform[]>(['youtube', 'tiktok']);

  // Post configuration
  const [title, setTitle] = useState(videoTitle || 'Koleksi YouTube Shorts Viral');
  const [description, setDescription] = useState(videoDescription || 'Video pendek dibuat otomatis dengan editor vertikal 9:16.');
  const [tagsInput, setTagsInput] = useState(
    hashtags.length > 0 ? hashtags.join(' ') : '#Shorts #viral #trending #fyp #foryou'
  );

  // Platform specific options
  const [ytPrivacy, setYtPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [ttPrivacy, setTtPrivacy] = useState<'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'>('PUBLIC_TO_EVERYONE');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);

  // Upload progress & states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<PlatformUploadResult[] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);

  // Custom token inputs for Accounts tab
  const [customYtToken, setCustomYtToken] = useState('');
  const [customYtChannel, setCustomYtChannel] = useState('');
  const [customTtToken, setCustomTtToken] = useState('');
  const [customTtUsername, setCustomTtUsername] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatusAndHistory();
      if (videoTitle) {
        const cleanTitle = videoTitle.trim();
        setTitle(cleanTitle.includes('#Shorts') ? cleanTitle : `${cleanTitle} #Shorts`);
      }
      if (videoDescription) {
        setDescription(videoDescription);
      }
      if (hashtags && hashtags.length > 0) {
        setTagsInput(hashtags.join(' '));
      }
    }
  }, [isOpen, videoTitle, videoDescription, hashtags]);

  const loadStatusAndHistory = async () => {
    const status = await fetchPlatformStatus();
    setAccounts(status);
    const hist = await getUploadHistory();
    setHistory(hist);
  };

  if (!isOpen) return null;

  const togglePlatform = (p: UploadPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleStartUpload = async () => {
    if (selectedPlatforms.length === 0) {
      setUploadError('Pilih setidaknya satu platform (YouTube Shorts atau TikTok)');
      return;
    }

    if (!title.trim()) {
      setUploadError('Judul / Caption video tidak boleh kosong');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadResults(null);
    setUploadProgress(10);
    setUploadStep('Memvalidasi format 9:16 & mempersiapkan payload API...');

    try {
      // Step 2: Preparing stream / base64
      await new Promise((r) => setTimeout(r, 600));
      setUploadProgress(35);
      setUploadStep('Menginisiasi koneksi ke YouTube Data API v3 & TikTok Content Posting API...');

      // Step 3: Call Server Unified Endpoint
      await new Promise((r) => setTimeout(r, 800));
      setUploadProgress(70);
      setUploadStep('Mengunggah potongan video dan sinkronisasi hashtag...');

      const tagsArray = tagsInput
        .split(/[\s,]+/)
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const payload: AutoUploadPayload = {
        platforms: selectedPlatforms,
        title: title.trim(),
        description: `${description}\n\n${tagsInput}`.trim(),
        tags: tagsArray,
        privacyStatus: ytPrivacy,
        tiktokPrivacy: ttPrivacy,
        allowComments,
        allowDuet,
        allowStitch,
        videoDurationSec: Math.round(clipDuration),
      };

      const response = await uploadUnifiedShorts(payload);

      setUploadProgress(100);
      setUploadStep('Publikasi Berhasil!');
      setUploadResults(response.results);
      loadStatusAndHistory();
    } catch (err: any) {
      console.error('Upload execution error:', err);
      setUploadError(err.message || 'Gagal melakukan upload otomatis ke API');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkKey(key);
    setTimeout(() => setCopiedLinkKey(null), 2000);
  };

  const handleOAuthConnect = async (p: UploadPlatform) => {
    const success = await openOAuthPopup(p);
    if (success) {
      await loadStatusAndHistory();
    }
  };

  const handleDisconnect = async (p: UploadPlatform) => {
    await disconnectPlatformApi(p);
    await loadStatusAndHistory();
  };

  const handleSaveCustomToken = async (p: UploadPlatform) => {
    setIsSavingToken(true);
    try {
      if (p === 'youtube') {
        await connectPlatformDirect('youtube', {
          token: customYtToken,
          channelName: customYtChannel || 'Channel Pribadi API',
        });
        setCustomYtToken('');
        setCustomYtChannel('');
      } else {
        await connectPlatformDirect('tiktok', {
          token: customTtToken,
          username: customTtUsername || '@creator_custom',
        });
        setCustomTtToken('');
        setCustomTtUsername('');
      }
      await loadStatusAndHistory();
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan credential');
    } finally {
      setIsSavingToken(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Auto Upload API</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                  YouTube & TikTok
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Publikasikan Shorts 9:16 Anda otomatis via YouTube Data API v3 & TikTok Posting API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Publish Sekarang</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'accounts'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Akun & Kunci API</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Upload</span>
            {history.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {history.length}
              </span>
            )}
          </button>
          <button
            id="btn-tab-server-guide"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan Server (.env)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          {/* TAB 1: PUBLISH SEKARANG */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Success Screen after upload */}
              {uploadResults ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">Auto Upload Sukses!</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Video Anda berhasil dipublikasikan ke platform yang dipilih melalui API resmi.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {uploadResults.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              res.platform === 'youtube'
                                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}
                          >
                            {res.platform === 'youtube' ? 'YT' : 'TT'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white capitalize">
                                {res.platform === 'youtube' ? 'YouTube Shorts' : 'TikTok'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                Terpublikasi
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{res.message}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {res.videoUrl && (
                            <a
                              href={res.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>Lihat Video</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {res.studioUrl && (
                            <a
                              href={res.studioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>Studio</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {res.videoUrl && (
                            <button
                              onClick={() => handleCopy(res.videoUrl!, `res-${idx}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Salin Link"
                            >
                              {copiedLinkKey === `res-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setUploadResults(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      Upload Video Lain
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                    >
                      Selesai & Tutup
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Target Platform Selector Cards */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      1. Pilih Platform Tujuan Upload:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* YouTube Card */}
                      <div
                        onClick={() => togglePlatform('youtube')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedPlatforms.includes('youtube')
                            ? 'bg-red-950/30 border-red-500/50 ring-1 ring-red-500/30'
                            : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                            <Film className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">YouTube Shorts</span>
                              {accounts.youtube.connected ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                  Aktif
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                                  Demo Mode
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {accounts.youtube.channelName || 'YouTube Shorts Channel'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes('youtube')}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700"
                        />
                      </div>

                      {/* TikTok Card */}
                      <div
                        onClick={() => togglePlatform('tiktok')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedPlatforms.includes('tiktok')
                            ? 'bg-cyan-950/30 border-cyan-500/50 ring-1 ring-cyan-500/30'
                            : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">TikTok Video</span>
                              {accounts.tiktok.connected ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                  Aktif
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                                  Demo Mode
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {accounts.tiktok.username || '@creator_shorts_pro'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes('tiktok')}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metadata Input Fields */}
                  <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">
                          Judul / Caption Video (YouTube & TikTok):
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">{title.length}/100</span>
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: RAHASIA VIRAL 2025 #Shorts #fyp"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">
                          Deskripsi Lengkap & SEO YouTube:
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">{description.length}/5000</span>
                      </div>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tulis ringkasan isi video untuk meningkatkan pencarian SEO..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500 resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200">
                        Hashtag Trending (Algoritma Shorts & TikTok):
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="#Shorts #viral #foryou #fyp #trending"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-red-400 font-mono text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Platform Specific Settings */}
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* YouTube Settings */}
                      {selectedPlatforms.includes('youtube') && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>Privasi YouTube Shorts:</span>
                          </label>
                          <select
                            value={ytPrivacy}
                            onChange={(e: any) => setYtPrivacy(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="public">Publik (Langsung Tayang)</option>
                            <option value="unlisted">Tidak Publik (Unlisted)</option>
                            <option value="private">Pribadi (Draft)</option>
                          </select>
                        </div>
                      )}

                      {/* TikTok Settings */}
                      {selectedPlatforms.includes('tiktok') && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Privasi TikTok:</span>
                          </label>
                          <select
                            value={ttPrivacy}
                            onChange={(e: any) => setTtPrivacy(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="PUBLIC_TO_EVERYONE">Publik untuk Semua</option>
                            <option value="MUTUAL_FOLLOW_FRIENDS">Teman Saja</option>
                            <option value="SELF_ONLY">Hanya Saya</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* TikTok Interaction Permissions */}
                    {selectedPlatforms.includes('tiktok') && (
                      <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowComments}
                            onChange={(e) => setAllowComments(e.target.checked)}
                            className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                          />
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            Komentar
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowDuet}
                            onChange={(e) => setAllowDuet(e.target.checked)}
                            className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                          />
                          <span className="flex items-center gap-1">
                            <Repeat2 className="w-3 h-3 text-slate-400" />
                            Duet
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowStitch}
                            onChange={(e) => setAllowStitch(e.target.checked)}
                            className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                          />
                          <span className="flex items-center gap-1">
                            <Scissors className="w-3 h-3 text-slate-400" />
                            Stitch
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>{uploadStep}</span>
                        <span className="font-mono text-red-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-cyan-400 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Sedang mentransmisikan data video 9:16 vertikal ke endpoint API...
                      </p>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Main Action Button */}
                  <button
                    disabled={isUploading}
                    onClick={handleStartUpload}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:via-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengupload ke API...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>
                          Publish Sekarang ke {selectedPlatforms.length > 1 ? 'YouTube & TikTok' : selectedPlatforms[0] === 'youtube' ? 'YouTube Shorts' : 'TikTok'}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 2: AKUN & KUNCI API */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {/* YouTube Data API Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
                      YT
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Google YouTube Data API v3</h4>
                      <p className="text-[11px] text-slate-400">
                        {accounts.youtube.channelName || 'YouTube Shorts Channel'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {accounts.youtube.connected ? (
                      <button
                        onClick={() => handleDisconnect('youtube')}
                        className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                      >
                        Putuskan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOAuthConnect('youtube')}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                      >
                        Hubungkan Google
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Token Accordion */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Gunakan OAuth atau Masukkan Token / Kunci API Sendiri:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Channel (misal: Shorts Indonesia)"
                      value={customYtChannel}
                      onChange={(e) => setCustomYtChannel(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="password"
                      placeholder="OAuth Access Token / API Key"
                      value={customYtToken}
                      onChange={(e) => setCustomYtToken(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={isSavingToken}
                      onClick={() => handleSaveCustomToken('youtube')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                    >
                      Simpan Kredensial YouTube
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">💡 Cara Menyiapkan YouTube Data API v3:</p>
                  <p>1. Buka Google Cloud Console & buat OAuth Client ID (Web Application).</p>
                  <p>2. Tambahkan Authorized Redirect URI:</p>
                  <p className="font-mono text-[10px] text-red-400 break-all select-all bg-slate-950 p-1 rounded border border-slate-800">
                    {window.location.origin}/auth/callback/youtube
                  </p>
                </div>
              </div>

              {/* TikTok Content Posting API Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                      TT
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">TikTok Content Posting API v2</h4>
                      <p className="text-[11px] text-slate-400">
                        {accounts.tiktok.username || '@creator_shorts_pro'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {accounts.tiktok.connected ? (
                      <button
                        onClick={() => handleDisconnect('tiktok')}
                        className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                      >
                        Putuskan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOAuthConnect('tiktok')}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
                      >
                        Hubungkan TikTok
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Token Accordion */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Gunakan OAuth atau Masukkan Token TikTok Sendiri:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Username TikTok (misal: @videoshorts)"
                      value={customTtUsername}
                      onChange={(e) => setCustomTtUsername(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="password"
                      placeholder="TikTok Creator Access Token"
                      value={customTtToken}
                      onChange={(e) => setCustomTtToken(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      disabled={isSavingToken}
                      onClick={() => handleSaveCustomToken('tiktok')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                    >
                      Simpan Kredensial TikTok
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">💡 Cara Menyiapkan TikTok Developer API:</p>
                  <p>1. Buka TikTok for Developers & ajukan izin <span className="text-cyan-400 font-mono">video.publish</span>.</p>
                  <p>2. Tambahkan Redirect URI:</p>
                  <p className="font-mono text-[10px] text-cyan-400 break-all select-all bg-slate-950 p-1 rounded border border-slate-800">
                    {window.location.origin}/auth/callback/tiktok
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RIWAYAT UPLOAD */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Belum ada riwayat upload.</p>
                  <p className="text-[11px] text-slate-500">
                    Video yang diupload otomatis melalui API akan tercatat di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.results.map((res, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                res.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'
                              }`}
                            />
                            <span className="font-bold text-slate-200 capitalize">
                              {res.platform}
                            </span>
                            {res.videoUrl && (
                              <a
                                href={res.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 hover:underline flex items-center gap-0.5 ml-1"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PANDUAN SERVER & ENVIRONMENT */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Konfigurasi Environment Server (.env / .env.local)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Untuk mengaktifkan pengunggahan otomatis langsung ke YouTube Data API dan TikTok Open API tanpa batas kuota lokal, simpan kredensial ini pada file <code className="text-red-400 font-mono">.env</code> di root proyek:
                </p>

                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed select-all">
{`# 1. Google & YouTube Data API v3
YOUTUBE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
YOUTUBE_REDIRECT_URI="${window.location.origin}/auth/callback/youtube"

# 2. TikTok Content Posting API v2
TIKTOK_CLIENT_KEY="aw123456789"
TIKTOK_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
TIKTOK_REDIRECT_URI="${window.location.origin}/auth/callback/tiktok"

# 3. Gemini AI Assistant (Viral Hooks & SEO Metadata)
GEMINI_API_KEY="AIzaSy..."`}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        `# Google YouTube API\nYOUTUBE_CLIENT_ID=""\nYOUTUBE_CLIENT_SECRET=""\nYOUTUBE_REDIRECT_URI="${window.location.origin}/auth/callback/youtube"\n\n# TikTok API\nTIKTOK_CLIENT_KEY=""\nTIKTOK_CLIENT_SECRET=""\nTIKTOK_REDIRECT_URI="${window.location.origin}/auth/callback/tiktok"`,
                        'env-snippet'
                      )
                    }
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700"
                  >
                    {copiedLinkKey === 'env-snippet' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Salin .env</span>
                  </button>
                </div>
              </div>

              {/* Step by step checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <span className="w-5 h-5 rounded-full bg-red-600/20 flex items-center justify-center text-[10px]">1</span>
                    <span>Langkah YouTube Data API v3</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1.5 leading-normal">
                    <li>Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">Google Cloud Console</a>.</li>
                    <li>Aktifkan library <strong>YouTube Data API v3</strong>.</li>
                    <li>Buat OAuth Client ID (pilih jenis <em>Web Application</em>).</li>
                    <li>Tambahkan Authorized Redirect URI: <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono">{window.location.origin}/auth/callback/youtube</code></li>
                    <li>Salin Client ID & Client Secret ke <code className="text-red-400">.env</code>.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">2</span>
                    <span>Langkah TikTok Posting API</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1.5 leading-normal">
                    <li>Buka <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">TikTok Developers</a>.</li>
                    <li>Buat aplikasi dan aktifkan izin <strong>video.publish</strong> dan <strong>user.info.basic</strong>.</li>
                    <li>Daftarkan Redirect URL: <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono">{window.location.origin}/auth/callback/tiktok</code></li>
                    <li>Salin Client Key dan Client Secret ke <code className="text-cyan-400">.env</code>.</li>
                  </ul>
                </div>
              </div>

              {/* Local Dev Run info */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Jalankan di Server Lokal:</span>
                  <span className="text-[11px] text-slate-400">Jalankan perintah berikut di terminal komputer:</span>
                </div>
                <code className="bg-black px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400 font-mono text-xs select-all">
                  npm run dev
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
