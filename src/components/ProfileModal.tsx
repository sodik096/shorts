import React, { useState } from 'react';
import {
  X,
  User,
  Youtube,
  LogOut,
  Shield,
  Film,
  Sparkles,
  Check,
  Save,
  AtSign,
  Mail,
  Calendar,
} from 'lucide-react';
import { UserProfile } from '../types';
import { clearUserSession, saveUserSession } from '../utils/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser,
}) => {
  const [name, setName] = useState(user.name);
  const [channelHandle, setChannelHandle] = useState(user.channelHandle);
  const [channelName, setChannelName] = useState(user.channelName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      channelHandle: channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`,
      channelName,
    };
    saveUserSession(updated);
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogoutClick = () => {
    clearUserSession();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Cover */}
        <div className="h-24 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 relative p-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar & Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-12 mb-3 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-xl">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Shorts Pro Creator</span>
            </span>
          </div>

          <div className="space-y-1 mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{user.name}</span>
            </h3>
            <p className="text-xs text-red-400 font-mono font-semibold">{user.channelHandle}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user.email}</span>
            </p>
          </div>

          {/* Edit Channel & Watermark */}
          <form onSubmit={handleSave} className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 mb-5 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Pengaturan Akun & Watermark Otomatis</span>
            </h4>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nama Tampilan:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Handle YouTube (Watermark):</label>
              <div className="relative">
                <AtSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={channelHandle}
                  onChange={(e) => setChannelHandle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nama Channel:</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-slate-400" />
                  <span>Perbarui Info Profil</span>
                </>
              )}
            </button>
          </form>

          {/* Logout button */}
          <button
            id="btn-profile-logout"
            onClick={handleLogoutClick}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
