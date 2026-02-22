'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import HeroCanvas from '@/app/components/HeroCanvas';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <HeroCanvas />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white z-50"
      >
        <ChevronLeft className="w-4 h-4" />
        返回
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <LogIn className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">AI 文檔摘要系統</h1>
            <p className="text-slate-400">登入你嘅帳戶</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                電郵地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="你嘅電郵"
                disabled={isLoading}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="你嘅密碼"
                disabled={isLoading}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  登入中...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  登入
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">
              <span className="font-semibold text-blue-400">測試帳戶：</span>
            </p>
            <p className="text-xs text-slate-500 font-mono break-all">
              Email: test@example.com
            </p>
            <p className="text-xs text-slate-500 font-mono break-all">
              Password: password123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

