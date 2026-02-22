'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentUploader from '@/app/components/DocumentUploader';
import DocumentHistory from '@/app/components/DocumentHistory';
import SummaryGenerator from '@/app/components/SummaryGenerator';
import SummaryEditor from '@/app/components/SummaryEditor';
import HeroCanvas from '@/app/components/HeroCanvas';
import SettingsModal from '@/app/components/SettingsModal';
import { Sparkles, History, Upload, FileText, ChevronRight, Settings } from 'lucide-react';

export default function Home() {
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <HeroCanvas />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-6 neon-text">
            AI <span className="italic">Summary</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-serif max-w-2xl mx-auto leading-relaxed mb-12">
            將繁瑣嘅文件，化成精煉嘅智慧。<br className="hidden md:block" />
            上傳檔案、生成摘要、管理歷史，一站式搞掂。
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary flex items-center gap-2 group"
            >
              即刻開始 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="btn-secondary flex items-center gap-2 group"
            >
              <Settings className="w-4 h-4" /> 設置
            </button>
          </div>
        </motion.div>
      </section>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Main Content Area */}
      <main id="main-content" className="relative z-10 px-3 py-20 w-full">
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
            className="lg:col-span-3 space-y-4 lg:sticky lg:top-8"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SummaryEditor
                    summary={currentSummary}
                    document={currentDocument}
                    onSuccess={(updatedSummary) => {
                      setCurrentSummary(updatedSummary);
                      setSuccess('更新成功！');
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

      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
          <p>© 2026 AI Summary App - 繁體粵語版</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">使用條款</a>
            <a href="#" className="hover:text-white transition-colors">隱私政策</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
