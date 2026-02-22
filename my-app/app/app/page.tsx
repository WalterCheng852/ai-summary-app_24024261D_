'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/lib/auth-context';
import DocumentUploader from '@/app/components/DocumentUploader';
import DocumentHistory from '@/app/components/DocumentHistory';
import SummaryGenerator from '@/app/components/SummaryGenerator';
import SummaryEditor from '@/app/components/SummaryEditor';
import HeroCanvas from '@/app/components/HeroCanvas';
import SettingsModal from '@/app/components/SettingsModal';
import { Sparkles, History, Upload, FileText, ChevronLeft, Settings, LogOut, Loader2 } from 'lucide-react';

export default function AppPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 檢查認證狀態
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登出失敗');
      setIsLoggingOut(false);
    }
  };

  const handleUploadSuccess = (document: any) => {
    setCurrentDocument(document);
    setCurrentSummary(null);
    setError('');
    setSuccess('正！檔案上傳成功，而家可以生成摘要。');
  };

  const handleGenerateSummarySuccess = (summary: any) => {
    setCurrentSummary(summary);
    setSuccess('搞掂！摘要已經生成好。');
    setError('');
  };

  const handleSelectDocument = (document: any) => {
    setCurrentDocument(document);
    setCurrentSummary(document.summaries?.[0] || null);
    setError('');
  };

  const handleError = (msg: string) => {
    setError(msg);
    setSuccess('');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <HeroCanvas />

      {/* Header with User Info & Controls */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        {/* Back to Landing */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-300">
              <p className="text-xs text-slate-500">登入為</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 hover:text-white transition"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-red-300 hover:text-red-200 transition disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                登出
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Main Content Area */}
      <main className="relative z-10 px-3 py-24 w-full pt-20">
        <div className="mx-auto" style={{ maxWidth: '1800px' }}>
          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12"
              >
                <div className={`glass-panel p-6 border-l-4 ${error ? 'border-red-500 bg-red-500/10' : 'border-white bg-white/5'}`}>
                  <p className="text-lg font-medium flex items-center gap-3">
                    {error ? '⚠️ ' + error : '✓ ' + success}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Sidebar: Upload & History (Sticky) */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-3 space-y-4 lg:sticky lg:top-32"
            >
              {/* Upload Section */}
              <motion.div variants={itemVariants} className="glass-panel p-3 interactive-glow">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="text-zinc-400 w-4 h-4" />
                  <h2 className="text-sm font-bold">上傳</h2>
                </div>
                
                {!currentDocument ? (
                  <DocumentUploader
                    onUploadSuccess={handleUploadSuccess}
                    onError={handleError}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">當前處理緊</p>
                      <h3 className="text-xl font-bold truncate flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {currentDocument.filename}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentDocument(null);
                        setCurrentSummary(null);
                      }}
                      className="w-full btn-secondary text-sm"
                    >
                      + 上傳另一個
                    </button>
                  </div>
                )}
              </motion.div>

              {/* History Section */}
              <motion.div variants={itemVariants} className="glass-panel p-3 interactive-glow">
                <div className="flex items-center gap-2 mb-3">
                  <History className="text-zinc-400 w-4 h-4" />
                  <h2 className="text-sm font-bold">歷史</h2>
                </div>
                <DocumentHistory onSelectDocument={handleSelectDocument} />
              </motion.div>
            </motion.div>

            {/* Right Main Column: Generator & Editor */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-9"
            >
              <AnimatePresence mode="wait">
                {!currentDocument ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel p-20 flex flex-col items-center justify-center text-center opacity-50"
                  >
                    <Sparkles className="w-16 h-16 mb-6 text-zinc-600" />
                    <p className="text-xl font-serif italic text-zinc-500">
                      喺左邊揀個檔案或者上傳新嘢，<br />我哋就開始生成摘要。
                    </p>
                  </motion.div>
                ) : currentDocument && !currentSummary ? (
                  <motion.div 
                    key="generator"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="glass-panel p-10 neon-border"
                  >
                    <SummaryGenerator
                      documentId={currentDocument.id}
                      onSuccess={handleGenerateSummarySuccess}
                      onError={handleError}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="glass-panel p-10"
                  >
                    <SummaryEditor
                      summary={currentSummary}
                      document={currentDocument}
                      onSuccess={(updatedSummary) => {
                        setCurrentSummary(updatedSummary);
                        setSuccess('✅ 摘要已保存！');
                      }}
                      onError={handleError}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
