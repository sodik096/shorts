import { UserProfile } from '../types';

const STORAGE_KEY = 'shortsforge_user_session';

export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'user_creator_01',
  name: 'Kabum Aian',
  email: 'kabumaian@gmail.com',
  channelName: 'Kabum Shorts Gaming',
  channelHandle: '@kabumaian',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isPro: true,
  createdAt: '2025-01-15',
  savedVideosCount: 12,
};

export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse user session:', e);
    return null;
  }
};

export const saveUserSession = (user: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-changed'));
  } catch (e) {
    console.error('Failed to save user session:', e);
  }
};

export const clearUserSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('auth-changed'));
  } catch (e) {
    console.error('Failed to remove user session:', e);
  }
};
