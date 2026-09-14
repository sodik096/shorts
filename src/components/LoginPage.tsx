import React, { useState } from 'react';
import {
  Youtube,
  Mail,
  Lock,
  User,
  AtSign,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Film,
  Flame,
  KeyRound,
  X,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_DEMO_USER, saveUserSession } from '../utils/auth';

interface LoginPageProps {
  onSuccessLogin: (user: UserProfile) => void;
  onBackToStudio: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccessLogin,
  onBackToStudio,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [channelHandle, setChannelHandle] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Quick Demo Login
  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      saveUserSession(DEFAULT_DEMO_USER);
      setSuccessMsg(`Selamat datang kembali, ${DEFAULT_DEMO_USER.name}!`);
      setTimeout(() => {
        onSuccessLogin(DEFAULT_DEMO_USER);
      }, 600);
    }, 400);
  };

  // Google Login
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const googleUser: UserProfile = {
        id: 'google_user_' + Date.now(),
        name: 'Kabum Aian',
        email: 'kabumaian@gmail.com',
        channelName: 'Kabum Creator Channel',
        channelHandle: '@kabumaian',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isPro: true,
        createdAt: new Date().toISOString().split('T')[0],
        savedVideosCount: 5,
      };
      saveUserSession(googleUser);
      setSuccessMsg('Berhasil masuk dengan akun Google!');
      setTimeout(() => {
        onSuccessLogin(googleUser);
      }, 600);
    }, 600);
  };

  // Submit Login or Register
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !email.includes('@')) {
      setError('Harap masukkan alamat email yang valid.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Harap isi nama lengkap Anda.');
        return;
      }
      if (!channelHandle.trim()) {
        setError('Harap masukkan nama channel atau handle YouTube Anda.');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      const formattedHandle = channelHandle
        ? channelHandle.startsWith('@')
          ? channelHandle
          : `@${channelHandle}`
        : `@${email.split('@')[0]}`;

      const user: UserProfile = {
        id: 'user_' + Date.now(),
        name: mode === 'register' ? name : (email.split('@')[0].toUpperCase() || 'Shorts Creator'),
        email,
        channelName: mode === 'register' ? `${name} Channel` : 'YouTube Shorts Studio',
        channelHandle: formattedHandle,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        isPro: true,
        createdAt: new Date().toISOString().split('T')[0],
        savedVideosCount: 0,
      };

      saveUserSession(user);
      setSuccessMsg(
        mode === 'register'
          ? 'Pendaftaran berhasil! Mengalihkan ke Studio...'
          : 'Berhasil masuk! Mengalihkan ke Studio...'
      );

      setTimeout(() => {
        onSuccessLogin(user);
      }, 700);
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
      setSuccessMsg(`Instruksi reset sandi telah dikirim ke ${forgotEmail}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="max-w-4xl w-full mx-auto mb-6 flex items-center justify-between z-10">
        <button
          id="btn-back-to-studio"
          onClick={onBackToStudio}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Studio</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Keamanan Enkripsi 256-Bit</span>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand & Creator Perks Info */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-red-600/30">
              <Youtube className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              ShortsForge Creator Hub
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform all-in-one untuk memproduksi video pendek YouTube Shorts 9:16 berkecepatan tinggi dengan integrasi AI Gemini.
            </p>
          </div>

          {/* Value cards */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-white mb-0.5">Watermark Channel Otomatis</h4>
                <p className="text-slate-400 leading-relaxed">
                  Watermark handle YouTube Anda langsung tertempel otomatis di setiap video yang Anda edit.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-white mb-0.5">Akses AI Shorts Generator</h4>
                <p className="text-slate-400 leading-relaxed">
                  Generate judul click-worthy, 3s hook retention, dan hashtag viral tanpa batasan harian.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-white mb-0.5">Export Cepat 9:16 HD</h4>
                <p className="text-slate-400 leading-relaxed">
                  Rendering langsung di browser dengan format WebM 9:16 siap upload ke YouTube Studio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card Form */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Masuk ke Akun Creator' : 'Daftar Akun Baru'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'login'
                    ? 'Kelola template shorts dan watermark channel Anda'
                    : 'Mulai produksi video Shorts 9:16 viral hari ini'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs">
                <button
                  id="tab-mode-login"
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    mode === 'login'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Masuk
                </button>
                <button
                  id="tab-mode-register"
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    mode === 'register'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daftar
                </button>
              </div>
            </div>

            {/* Quick Demo 1-Click Login Button */}
            <div className="mb-5">
              <button
                id="btn-quick-demo-login"
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
              >
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Masuk Instan sebagai Demo Creator (1-Klik)</span>
              </button>
            </div>

            {/* Google Sign In Button */}
            <button
              id="btn-google-login"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-sm mb-5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                atau via email
              </span>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-register-name"
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Channel Handle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Handle / Channel YouTube:
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-register-handle"
                        type="text"
                        placeholder="misal: @budishorts"
                        value={channelHandle}
                        onChange={(e) => setChannelHandle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Handle ini akan otomatis digunakan sebagai watermark video Anda.
                    </p>
                  </div>
                </>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Email:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Kata Sandi:</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      Lupa kata sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-slate-400">Ingat sesi login saya</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{mode === 'login' ? 'Masuk ke Studio' : 'Buat Akun Creator Sekarang'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Footer Switcher */}
            <div className="mt-5 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
              {mode === 'login' ? (
                <p>
                  Belum punya akun?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              ) : (
                <p>
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    Masuk Sekarang
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-red-400" />
                <span>Reset Kata Sandi</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tautan reset berhasil dikirim! Silakan periksa kotak masuk email Anda.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Kirim Tautan Reset
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
