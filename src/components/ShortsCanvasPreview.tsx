import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Maximize2, Move, ZoomIn, Eye, Sparkles } from 'lucide-react';
import { FramingState, OverlayConfig, TrimState, VideoSourceState } from '../types';

interface ShortsCanvasPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoSource: VideoSourceState | null;
  trim: TrimState;
  framing: FramingState;
  overlay: OverlayConfig;
  activeSubtitleText: string;
  onTogglePlay: () => void;
  onUpdateFraming: (updates: Partial<FramingState>) => void;
}

export const ShortsCanvasPreview: React.FC<ShortsCanvasPreviewProps> = ({
  videoRef,
  canvasRef,
  videoSource,
  trim,
  framing,
  overlay,
  activeSubtitleText,
  onTogglePlay,
  onUpdateFraming,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Render loop onto 9:16 Canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Shorts canvas resolution: 720 x 1280 (True 9:16 aspect ratio)
    const cw = 720;
    const ch = 1280;
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    // Clear background
    ctx.fillStyle = framing.bgColor || '#000000';
    ctx.fillRect(0, 0, cw, ch);

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const videoRatio = vw / vh;
      const canvasRatio = cw / ch; // 9:16 = 0.5625

      // Apply CSS Filters if selected
      ctx.save();
      if (overlay.filter === 'vibrant') {
        ctx.filter = 'saturate(135%) contrast(110%)';
      } else if (overlay.filter === 'high_contrast') {
        ctx.filter = 'contrast(125%) brightness(105%)';
      } else if (overlay.filter === 'warm') {
        ctx.filter = 'sepia(20%) saturate(115%) hue-rotate(-5deg)';
      } else if (overlay.filter === 'cool') {
        ctx.filter = 'hue-rotate(15deg) saturate(110%)';
      } else if (overlay.filter === 'grayscale') {
        ctx.filter = 'grayscale(100%) contrast(115%)';
      }

      if (framing.mode === 'blur_fill') {
        // Mode 1: Mirror Blurred Background + Center Fit (Standard for 16:9 into Shorts)
        ctx.save();
        ctx.filter = 'blur(28px) brightness(0.6)';
        // Draw background to cover full 9:16 canvas
        const bgScale = Math.max(cw / vw, ch / vh) * 1.15;
        const bgW = vw * bgScale;
        const bgH = vh * bgScale;
        const bgX = (cw - bgW) / 2;
        const bgY = (ch - bgH) / 2;
        ctx.drawImage(video, bgX, bgY, bgW, bgH);
        ctx.restore();

        // Draw crisp foreground video
        const fgScale = Math.min(cw / vw, ch / vh) * framing.zoom;
        const fgW = vw * fgScale;
        const fgH = vh * fgScale;
        const fgX = (cw - fgW) / 2 + (framing.panX * cw) / 100;
        const fgY = (ch - fgH) / 2 + (framing.panY * ch) / 100;
        ctx.drawImage(video, fgX, fgY, fgW, fgH);
      } else if (framing.mode === 'crop_fill') {
        // Mode 2: Zoom & Crop to Fill 9:16 completely with Pan X/Y
        const coverScale = Math.max(cw / vw, ch / vh) * framing.zoom;
        const drawW = vw * coverScale;
        const drawH = vh * coverScale;
        const drawX = (cw - drawW) / 2 + (framing.panX * cw) / 100;
        const drawY = (ch - drawH) / 2 + (framing.panY * ch) / 100;
        ctx.drawImage(video, drawX, drawY, drawW, drawH);
      } else {
        // Mode 3: Fit with Letterbox
        const fitScale = Math.min(cw / vw, ch / vh) * framing.zoom;
        const drawW = vw * fitScale;
        const drawH = vh * fitScale;
        const drawX = (cw - drawW) / 2 + (framing.panX * cw) / 100;
        const drawY = (ch - drawH) / 2 + (framing.panY * ch) / 100;
        ctx.drawImage(video, drawX, drawY, drawW, drawH);
      }

      ctx.restore(); // restore filter
    } else {
      // Placeholder while loading
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Memuat Frame Video...', cw / 2, ch / 2);
    }

    // DRAW OVERLAYS

    // 1. Top Hook Banner
    if (overlay.showHook && overlay.hookText.trim()) {
      ctx.save();
      const fontSize = overlay.hookFontSize || 34;
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const bannerText = overlay.hookText.toUpperCase();
      const textMetrics = ctx.measureText(bannerText);
      const textWidth = textMetrics.width;
      const paddingX = 32;
      const paddingY = 16;
      const bannerWidth = Math.min(textWidth + paddingX * 2, cw - 40);
      const bannerHeight = fontSize + paddingY * 2;
      const bannerX = (cw - bannerWidth) / 2;
      const bannerY = 80;

      // Banner background with rounded corners
      ctx.fillStyle = overlay.hookBgColor || '#ff0000';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 4;

      const radius = 16;
      ctx.beginPath();
      ctx.moveTo(bannerX + radius, bannerY);
      ctx.lineTo(bannerX + bannerWidth - radius, bannerY);
      ctx.quadraticCurveTo(bannerX + bannerWidth, bannerY, bannerX + bannerWidth, bannerY + radius);
      ctx.lineTo(bannerX + bannerWidth, bannerY + bannerHeight - radius);
      ctx.quadraticCurveTo(
        bannerX + bannerWidth,
        bannerY + bannerHeight,
        bannerX + bannerWidth - radius,
        bannerY + bannerHeight
      );
      ctx.lineTo(bannerX + radius, bannerY + bannerHeight);
      ctx.quadraticCurveTo(bannerX, bannerY + bannerHeight, bannerX, bannerY + bannerHeight - radius);
      ctx.lineTo(bannerX, bannerY + radius);
      ctx.quadraticCurveTo(bannerX, bannerY, bannerX + radius, bannerY);
      ctx.closePath();
      ctx.fill();

      // Banner Text
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = overlay.hookTextColor || '#ffffff';
      ctx.fillText(bannerText, cw / 2, bannerY + bannerHeight / 2 + 2, bannerWidth - 20);
      ctx.restore();
    }

    // 2. Dynamic Subtitles / Captions (Alex Hormozi / MrBeast Viral Style)
    const captionToDisplay = activeSubtitleText || (overlay.showCaption ? overlay.captionText : '');
    if (captionToDisplay && captionToDisplay.trim()) {
      ctx.save();
      const capFontSize = overlay.captionFontSize || 44;
      ctx.font = `900 ${capFontSize}px Impact, system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let posY = ch * 0.78; // default lower third
      if (overlay.captionPosition === 'center') posY = ch * 0.5;
      if (overlay.captionPosition === 'top') posY = ch * 0.28;

      let fillCol = '#ffe600'; // Hormozi Yellow
      if (overlay.captionStyle === 'tiktok_white') fillCol = '#ffffff';
      if (overlay.captionStyle === 'neon_green') fillCol = '#00ff66';
      if (overlay.captionStyle === 'fire_red') fillCol = '#ff2b2b';
      if (overlay.captionColor) fillCol = overlay.captionColor;

      const capText = captionToDisplay.toUpperCase();

      // Thick black stroke for high readability on any background
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.strokeText(capText, cw / 2, posY, cw - 60);

      // Main Text Fill
      ctx.fillStyle = fillCol;
      ctx.fillText(capText, cw / 2, posY, cw - 60);
      ctx.restore();
    }

    // 3. Watermark / Branding
    if (overlay.showWatermark && overlay.watermarkText.trim()) {
      ctx.save();
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(overlay.watermarkText, cw - 30, ch - 45);
      ctx.restore();
    }

    // 4. Bottom Retention Progress Bar (Viral YouTube Shorts feature)
    if (overlay.showProgressBar && trim.endTime > trim.startTime) {
      ctx.save();
      const currentProgress = Math.max(
        0,
        Math.min(1, (trim.currentTime - trim.startTime) / (trim.endTime - trim.startTime))
      );
      const barHeight = 8;
      const barY = ch - barHeight;

      // Track background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, barY, cw, barHeight);

      // Active progress
      ctx.fillStyle = overlay.progressBarColor || '#ff0000';
      ctx.fillRect(0, barY, cw * currentProgress, barHeight);
      ctx.restore();
    }
  }, [canvasRef, videoRef, framing, overlay, activeSubtitleText, trim]);

  // Continuous animation frame loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      drawFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [drawFrame]);

  // Drag to pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPan({ x: framing.panX, y: framing.panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    // Map pixels to pan percentage
    const newPanX = Math.max(-100, Math.min(100, startPan.x + dx * 0.4));
    const newPanY = Math.max(-100, Math.min(100, startPan.y + dy * 0.4));
    onUpdateFraming({ panX: Math.round(newPanX), panY: Math.round(newPanY) });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* 9:16 Shorts Canvas Container */}
      <div
        ref={containerRef}
        id="shorts-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative aspect-[9/16] w-full max-w-[340px] sm:max-w-[380px] rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-slate-800 transition-all select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* The 9:16 Render Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block pointer-events-none"
        />

        {/* YouTube Shorts UI Simulation overlay (watermark & side buttons indicator) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
          {/* Top Header Badge */}
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-bold text-red-400 border border-white/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              9:16 Shorts Preview
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-mono text-slate-300 border border-white/10">
              {framing.mode === 'blur_fill' ? 'Mirror Blur' : framing.mode === 'crop_fill' ? 'Fill & Crop' : 'Letterbox'}
            </span>
          </div>

          {/* Right Simulated Shorts Action Buttons */}
          <div className="self-end flex flex-col items-center gap-3 text-white/70 text-[9px] font-medium pb-8 pr-1">
            <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
              👍
            </div>
            <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
              💬
            </div>
            <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/10">
              ↗️
            </div>
          </div>
        </div>

        {/* Play / Pause Click Overlay */}
        <button
          id="btn-canvas-toggle-play"
          onClick={onTogglePlay}
          className="absolute inset-0 flex items-center justify-center group bg-black/10 hover:bg-black/25 transition-colors cursor-pointer"
        >
          {!trim.isPlaying && (
            <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/40 backdrop-blur transform group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 ml-1" />
            </div>
          )}
        </button>

        {/* Pan Drag Indicator */}
        <div className="absolute bottom-2 left-2 pointer-events-none px-2 py-1 rounded bg-black/60 backdrop-blur text-[9px] text-slate-400 flex items-center gap-1">
          <Move className="w-2.5 h-2.5" />
          <span>Geser mouse untuk atur posisi (Pan)</span>
        </div>
      </div>

      {/* Quick Framing Bar underneath preview */}
      <div className="w-full max-w-[340px] sm:max-w-[380px] mt-3 flex items-center justify-between gap-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px]">Zoom:</span>
          <input
            id="slider-zoom-framing"
            type="range"
            min="0.8"
            max="2.5"
            step="0.05"
            value={framing.zoom}
            onChange={(e) => onUpdateFraming({ zoom: parseFloat(e.target.value) })}
            className="w-20 sm:w-24 accent-red-500 cursor-pointer"
          />
          <span className="font-mono text-[11px] text-slate-300">{framing.zoom.toFixed(1)}x</span>
        </div>

        <button
          id="btn-reset-pan-position"
          onClick={() => onUpdateFraming({ panX: 0, panY: 0, zoom: 1 })}
          className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Reset Posisi
        </button>
      </div>
    </div>
  );
};
