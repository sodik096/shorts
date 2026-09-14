import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Film,
  Camera,
  Play,
  RotateCw,
  Share2,
  UploadCloud,
} from 'lucide-react';
import { TrimState, VideoSourceState } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  trim: TrimState;
  videoSource: VideoSourceState | null;
  videoTitle: string;
  onOpenAutoUpload?: (blobUrl: string | null, thumbUrl: string | null) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  videoRef,
  trim,
  videoSource,
  videoTitle,
  onOpenAutoUpload,
}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderedBlobUrl, setRenderedBlobUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clipDuration = Math.max(0.5, trim.endTime - trim.startTime);

  // Generate Thumbnail from current Canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setThumbnailUrl(dataUrl);
      } catch (e) {
        console.warn('Canvas snapshot tainted or unavailable:', e);
      }
    }
  }, [isOpen, canvasRef]);

  if (!isOpen) return null;

  const startRender = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      setError('Elemen canvas atau video belum siap.');
      return;
    }

    setIsRendering(true);
    setProgress(0);
    setError(null);
    setRenderedBlobUrl(null);

    try {
      // 1. Setup Canvas Stream
      const canvasStream = canvas.captureStream(30);

      // 2. Setup Audio Track if available
      try {
        let audioStream: MediaStream | null = null;
        if ((video as any).captureStream) {
          audioStream = (video as any).captureStream();
        } else if ((video as any).mozCaptureStream) {
          audioStream = (video as any).mozCaptureStream();
        }

        if (audioStream) {
          const audioTracks = audioStream.getAudioTracks();
          if (audioTracks.length > 0) {
            canvasStream.addTrack(audioTracks[0]);
          }
        }
      } catch (audioErr) {
        console.warn('Could not capture audio stream, exporting visual stream:', audioErr);
      }

      // Check supported MIME types
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps high quality for YouTube Shorts
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: mimeType });
        const finalUrl = URL.createObjectURL(finalBlob);
        setRenderedBlobUrl(finalUrl);
        setIsRendering(false);
        setProgress(100);
      };

      // Seek video to startTime and begin recording
      video.currentTime = trim.startTime;
      await new Promise((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve(true);
        };
        video.addEventListener('seeked', onSeeked);
      });

      recorder.start(100); // collect in 100ms slices
      video.play();

      const startTimeMs = Date.now();
      const totalDurationMs = clipDuration * 1000;

      const progressInterval = setInterval(() => {
        const currentClipTime = video.currentTime - trim.startTime;
        const pct = Math.min(99, Math.round((currentClipTime / clipDuration) * 100));
        setProgress(pct);

        if (video.currentTime >= trim.endTime || video.ended) {
          clearInterval(progressInterval);
          video.pause();
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 100);

      // Safety timeout in case video stalls
      setTimeout(() => {
        clearInterval(progressInterval);
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, totalDurationMs + 3000);
    } catch (err: any) {
      console.error('Render error:', err);
      setError(err.message || 'Gagal merekam video. Browser Anda mungkin membatasi codec MediaRecorder.');
      setIsRendering(false);
    }
  };

  const downloadVideo = () => {
    if (!renderedBlobUrl) return;
    const a = document.createElement('a');
    a.href = renderedBlobUrl;
    const safeName = (videoTitle || 'youtube-shorts').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeName}_9x16_shorts.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadThumbnail = () => {
    if (!thumbnailUrl) return;
    const a = document.createElement('a');
    a.href = thumbnailUrl;
    const safeName = (videoTitle || 'youtube-shorts').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeName}_thumbnail_9x16.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Video YouTube Shorts</h2>
              <p className="text-xs text-slate-400">Rasio 9:16 Vertikal • Durasi {clipDuration.toFixed(1)} Detik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview & Status Card */}
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            {thumbnailUrl && (
              <div className="w-20 aspect-[9/16] rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-white line-clamp-1">{videoTitle || 'YouTube Shorts Clip'}</h4>
              <p className="text-slate-400">
                Format: <span className="text-white font-mono">9:16 (720x1280 HD)</span>
              </p>
              <p className="text-slate-400">
                Durasi: <span className="text-white font-mono">{clipDuration.toFixed(1)}s</span> (YouTube Shorts &le; 60s)
              </p>
              <p className="text-slate-400">
                Frame Rate: <span className="text-white font-mono">30 FPS</span>
              </p>
            </div>
          </div>

          {/* Render Action Area */}
          {!renderedBlobUrl ? (
            <div className="space-y-3">
              {isRendering ? (
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Sedang merender frame video...</span>
                    <span className="font-mono text-red-400">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Video sedang diputar dan direkam secara real-time pada rasio vertikal 9:16.
                  </p>
                </div>
              ) : (
                <button
                  id="btn-start-rendering"
                  onClick={startRender}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Render Video Shorts 9:16</span>
                </button>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400">Video Shorts Siap Di-Download!</h4>
                  <p className="text-[11px] text-slate-300">
                    File video 9:16 telah selesai di-render dengan semua overlay, hook, dan subtitle.
                  </p>
                </div>
              </div>

              {/* Video Player Preview of Rendered File */}
              <div className="aspect-[9/16] max-h-60 mx-auto rounded-xl overflow-hidden border border-slate-800 bg-black">
                <video src={renderedBlobUrl} controls className="w-full h-full object-contain" />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="btn-download-video-file"
                  onClick={downloadVideo}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Video (.webm)</span>
                </button>

                <button
                  id="btn-download-thumbnail"
                  onClick={downloadThumbnail}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Download Thumbnail (PNG)</span>
                </button>
              </div>

              {onOpenAutoUpload && (
                <button
                  id="btn-trigger-auto-upload-api"
                  onClick={() => {
                    onClose();
                    onOpenAutoUpload(renderedBlobUrl, thumbnailUrl);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:via-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>⚡ Auto Upload ke YouTube & TikTok via API</span>
                </button>
              )}

              <button
                id="btn-re-render"
                onClick={startRender}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Render Ulang</span>
              </button>
            </div>
          )}

          {/* YouTube Shorts Publishing Checklist */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Panduan Upload ke YouTube:</span>
              <a
                href="https://studio.youtube.com/channel/UC/videos/upload"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
              >
                <span>Buka YouTube Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Format video vertikal 9:16 sudah terpasang otomatis</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Durasi klip &le; 60 detik memenuhi syarat YouTube Shorts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tambahkan tag <span className="font-mono text-red-400 font-bold">#Shorts</span> pada judul atau deskripsi Anda</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
