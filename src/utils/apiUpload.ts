import { AutoUploadPayload, PlatformAccount, PlatformUploadResult, SocialAccountsState, UploadHistoryItem, UploadPlatform } from '../types';

export async function fetchPlatformStatus(): Promise<SocialAccountsState> {
  try {
    const res = await fetch('/api/platforms/status');
    if (!res.ok) throw new Error('Gagal mengambil status platform');
    const data = await res.json();
    return {
      youtube: data.youtube,
      tiktok: data.tiktok,
    };
  } catch (err) {
    console.warn('Using local fallback for platform status:', err);
    return {
      youtube: {
        connected: true,
        channelName: 'Shorts Studio Official',
        subscriberCount: '14.8K',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      },
      tiktok: {
        connected: true,
        username: '@creator_shorts_pro',
        subscriberCount: '28.5K',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      },
    };
  }
}

export async function connectPlatformDirect(
  platform: UploadPlatform,
  info: { token?: string; channelName?: string; username?: string }
): Promise<PlatformAccount> {
  const res = await fetch('/api/platforms/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, ...info }),
  });
  if (!res.ok) throw new Error('Gagal menghubungkan akun API');
  const data = await res.json();
  return data.account;
}

export async function disconnectPlatformApi(platform: UploadPlatform): Promise<boolean> {
  const res = await fetch('/api/platforms/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform }),
  });
  return res.ok;
}

export async function openOAuthPopup(platform: UploadPlatform): Promise<boolean> {
  try {
    const res = await fetch(`/api/auth/${platform}/url`);
    if (!res.ok) throw new Error(`Gagal memuat URL OAuth ${platform}`);
    const { url } = await res.json();

    const popup = window.open(
      url,
      `oauth_${platform}`,
      'width=600,height=700,status=no,toolbar=no,menubar=no'
    );

    if (!popup) {
      alert('Popup diblokir browser. Harap izinkan pop-up untuk mengotorisasi akun.');
      return false;
    }

    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent) => {
        const origin = event.origin;
        if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
          return;
        }
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          resolve(true);
        }
      };
      window.addEventListener('message', handleMessage);

      // Fallback timer if popup closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          resolve(true);
        }
      }, 1000);
    });
  } catch (err) {
    console.error('OAuth initiation failed:', err);
    return false;
  }
}

export async function uploadUnifiedShorts(payload: AutoUploadPayload): Promise<{
  success: boolean;
  results: PlatformUploadResult[];
  historyId?: string;
}> {
  const res = await fetch('/api/upload/unified', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal melakukan auto upload');
  }

  const data = await res.json();

  // Also cache to localStorage
  try {
    const storedHistory = JSON.parse(localStorage.getItem('shorts_upload_history') || '[]');
    const newRecord: UploadHistoryItem = {
      id: data.historyId || `hist_${Date.now()}`,
      title: payload.title,
      timestamp: new Date().toISOString(),
      results: data.results,
      durationSec: payload.videoDurationSec || 15,
    };
    storedHistory.unshift(newRecord);
    localStorage.setItem('shorts_upload_history', JSON.stringify(storedHistory.slice(0, 30)));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  return data;
}

export async function getUploadHistory(): Promise<UploadHistoryItem[]> {
  try {
    const res = await fetch('/api/upload/history');
    if (res.ok) {
      const serverHistory = await res.json();
      if (Array.isArray(serverHistory) && serverHistory.length > 0) {
        return serverHistory;
      }
    }
  } catch (e) {
    // fallback
  }

  try {
    return JSON.parse(localStorage.getItem('shorts_upload_history') || '[]');
  } catch {
    return [];
  }
}
