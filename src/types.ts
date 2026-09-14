export type ShortsRegion = 'indonesia' | 'global';

export type FramingMode = 'blur_fill' | 'crop_fill' | 'fit_letterbox';

export interface OverlayConfig {
  hookText: string;
  hookBgColor: string;
  hookTextColor: string;
  hookFontSize: number;
  showHook: boolean;
  
  captionText: string;
  captionColor: string;
  captionFontSize: number;
  captionPosition: 'center' | 'bottom' | 'top';
  showCaption: boolean;
  captionStyle: 'hormozi_yellow' | 'tiktok_white' | 'neon_green' | 'fire_red';
  
  watermarkText: string;
  showWatermark: boolean;
  
  showProgressBar: boolean;
  progressBarColor: string;

  filter: 'none' | 'vibrant' | 'high_contrast' | 'warm' | 'cool' | 'grayscale';
}

export interface VideoSourceState {
  type: 'file' | 'url';
  name: string;
  srcUrl: string;
  rawUrl?: string;
  fileSize?: number;
  duration: number;
  videoWidth: number;
  videoHeight: number;
}

export interface TrimState {
  startTime: number;
  endTime: number;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  loop: boolean;
}

export interface FramingState {
  mode: FramingMode;
  zoom: number;
  panX: number; // -100 to 100 percentage
  panY: number; // -100 to 100 percentage
  bgColor: string;
}

export interface AiSmartSegment {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralScore: number;
  pacing: 'hook' | 'climactic' | 'story' | 'fast';
  hookReason: string;
  suggestedHookText: string;
  recommendedShortsTitle: string;
  captionExcerpt?: string;
}

export interface AiSmartTrimResponse {
  segments: AiSmartSegment[];
  overallAnalysis: string;
  bestSegmentId: string;
  suggestedPacingTip: string;
}

export interface AiShortsData {
  targetRegion?: ShortsRegion;
  titles: string[];
  hooks: string[];
  description: string;
  hashtags: string[];
  suggestedSubtitles: Array<{
    timeRange: string;
    text: string;
  }>;
  retentionTips: string[];
  recommendedPostTime?: string;
  targetAudienceNote?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  channelName: string;
  channelHandle: string;
  avatarUrl: string;
  isPro: boolean;
  createdAt: string;
  savedVideosCount?: number;
}

export type UploadPlatform = 'youtube' | 'tiktok';

export interface PlatformAccount {
  connected: boolean;
  username?: string;
  channelName?: string;
  avatarUrl?: string;
  subscriberCount?: string;
  accountId?: string;
  accessToken?: string;
  lastConnectedAt?: string;
  isCustomKey?: boolean;
}

export interface SocialAccountsState {
  youtube: PlatformAccount;
  tiktok: PlatformAccount;
}

export interface AutoUploadPayload {
  platforms: UploadPlatform[];
  title: string;
  description: string;
  tags: string[];
  privacyStatus: 'public' | 'unlisted' | 'private';
  tiktokPrivacy: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  videoBase64?: string;
  videoDurationSec?: number;
  thumbnailBase64?: string;
}

export interface PlatformUploadResult {
  platform: UploadPlatform;
  status: 'success' | 'failed' | 'simulated';
  videoId?: string;
  publishId?: string;
  videoUrl?: string;
  studioUrl?: string;
  message: string;
  uploadedAt: string;
  error?: string;
}

export interface UploadHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  results: PlatformUploadResult[];
  durationSec: number;
}

