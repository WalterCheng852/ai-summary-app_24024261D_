'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { PromptSettings, DEFAULT_PROMPTS } from '@/app/lib/usePromptSettings';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<PromptSettings>(DEFAULT_PROMPTS);
  const [isSaved, setIsSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiSummarySettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('aiSummarySettings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_PROMPTS);
    localStorage.removeItem('aiSummarySettings');
    setIsSaved(false);
  };

  const handleChange = (key: keyof PromptSettings, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-zinc-950 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur border-b border-white/10 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">⚙️ 設置</h2>
                  <p className="text-sm text-zinc-400">自定義 AI 提示詞</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6 space-y-8">
                {/* Summarize Prompt */}
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm uppercase tracking-widest font-semibold text-white">
                        摘要生成提示詞
                      </span>
                      <span className="text-xs text-zinc-500">(摘要功能使用)</span>
                    </div>
                  </label>
                  <textarea
                    value={settings.summarizePrompt}
                    onChange={(e) => handleChange('summarizePrompt', e.target.value)}
                    className="w-full h-48 bg-black/40 border border-white/20 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-white/40 transition-all custom-scrollbar"
                    placeholder="Enter summarize prompt..."
                  />
                  <p className="text-sm text-zinc-500 italic">
                    默認：{DEFAULT_PROMPTS.summarizePrompt}
                  </p>
                </div>

                {/* Rephrase Prompts */}
                <div className="space-y-6 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white">AI 重寫提示詞</h3>

                  {/* Simplify */}
                  <div className="space-y-3">
                    <label className="block">
                      <div className="text-sm font-semibold text-white mb-2">簡化模式</div>
                    </label>
                    <textarea
                      value={settings.rephraseSimplify}
                      onChange={(e) => handleChange('rephraseSimplify', e.target.value)}
                      className="w-full h-48 bg-black/40 border border-white/20 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-white/40 transition-all custom-scrollbar"
                    />
                    <p className="text-sm text-zinc-500 italic">
                      默認：{DEFAULT_PROMPTS.rephraseSimplify}
                    </p>
                  </div>

                  {/* Professional */}
                  <div className="space-y-3">
                    <label className="block">
                      <div className="text-sm font-semibold text-white mb-2">專業模式</div>
                    </label>
                    <textarea
                      value={settings.rephraseProfessional}
                      onChange={(e) => handleChange('rephraseProfessional', e.target.value)}
                      className="w-full h-48 bg-black/40 border border-white/20 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-white/40 transition-all custom-scrollbar"
                    />
                    <p className="text-sm  text-zinc-500 italic">
                      默認：{DEFAULT_PROMPTS.rephraseProfessional}
                    </p>
                  </div>

                  {/* Casual */}
                  <div className="space-y-3">
                    <label className="block">
                      <div className="text-sm font-semibold text-white mb-2">隨意模式</div>
                    </label>
                    <textarea
                      value={settings.rephraseCasual}
                      onChange={(e) => handleChange('rephraseCasual', e.target.value)}
                      className="w-full h-48 bg-black/40 border border-white/20 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-white/40 transition-all custom-scrollbar"
                    />
                    <p className="text-sm text-zinc-500 italic">
                      默認：{DEFAULT_PROMPTS.rephraseCasual}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur border-t border-white/10 px-8 py-6 flex gap-3 justify-end">
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-green-400 mr-auto"
                  >
                    ✓ 設置已保存
                  </motion.div>
                )}
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> 重置
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                >
                  保存設置
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors"
                >
                  關閉
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
