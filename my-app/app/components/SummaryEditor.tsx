'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import { usePromptSettings } from '@/app/lib/usePromptSettings';
import { useAuth } from '@/app/lib/auth-context';
import { supabase } from '@/app/lib/supabase';
import type { Summary, Document, SummaryTone, SummarizeResponse } from '@/app/types';
import { Edit3, RefreshCw, Copy, Check, Save, X, Sparkles, Bold, Italic, Underline, Wand2 } from 'lucide-react';

interface SummaryEditorProps {
  summary: Summary;
  document: Document;
  onSuccess: (updatedSummary: Summary) => void;
  onError: (error: string) => void;
  onNewSession?: () => void;
}

export default function SummaryEditor({
  summary,
  document,
  onSuccess,
  onError,
  onNewSession,
}: SummaryEditorProps) {
  const { settings } = usePromptSettings();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(summary.edited_summary || summary.generated_summary || '');
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [tone, setTone] = useState<SummaryTone>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Text selection toolbar state
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [showRephrasMenu, setShowRephrasMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 獲取認證 token
  const getAuthHeader = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('認證失敗，請重新登入');
    }
    return `Bearer ${session.access_token}`;
  };

  // 同步滾動功能
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!previewRef.current) return;
    
    const textarea = e.currentTarget;
    // 計算滾動比例 (0 到 1)
    const scrollRatio = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    
    // 套用到預覽
    const previewHeight = previewRef.current.scrollHeight - previewRef.current.clientHeight;
    previewRef.current.scrollTop = scrollRatio * previewHeight;
  };

  const handleSaveEdit = async () => {
    if (!editedText.trim()) {
      onError('摘要唔可以係空白。');
      return;
    }

    if (!document?.id) {
      onError('文檔 ID 遺失，請重新加載。');
      return;
    }

    setIsLoading(true);
    try {
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/documents/${document.id}/summaries`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          summaryId: summary.id,
          editedSummary: editedText,
        }),
      });

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg || '保存失敗，請再試過。');
        return;
      }

      const data = await safeParseJSON<any>(response);
      if (data?.summary) {
        onSuccess(data.summary);
        setIsEditing(false);
      } else {
        onError('保存失敗，請再試過。');
      }
    } catch (error) {
      onError('保存失敗，請再試過。');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const authHeader = await getAuthHeader();

      const response = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          summaryId: summary.id,
          customPrompt: customPrompt.trim() || undefined,
          tone,
        }),
      });

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        return;
      }

      const data = await safeParseJSON<SummarizeResponse>(response);
      if (data?.summary) {
        onSuccess(data.summary);
        setShowRegeneratePanel(false);
        setCustomPrompt('');
      } else {
        onError('生成失敗，請再試過。');
      }
    } catch (error) {
      onError('網絡出咗錯。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = editedText || summary.generated_summary || '（無內容）';

  // Handle text selection in textarea
  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editedText.substring(start, end);

    if (selected.length > 0) {
      setSelectedText(selected);
      setSelectionStart(start);
      setSelectionEnd(end);
      
      // Get position for toolbar
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      setToolbarPos({
        top: rect.top - 60,
        left: rect.left + 10,
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const applyFormat = (formatType: 'bold' | 'italic' | 'underline') => {
    const formatMap = {
      bold: (text: string) => `**${text}**`,
      italic: (text: string) => `*${text}*`,
      underline: (text: string) => `<u>${text}</u>`,
    };

    const formatted = formatMap[formatType](selectedText);
    const newText = editedText.substring(0, selectionStart) + formatted + editedText.substring(selectionEnd);
    setEditedText(newText);
    setShowToolbar(false);
  };

  const handleRephrase = async (rephraseMode: string) => {
    setIsLoading(true);
    try {
      let prompt = '';
      if (rephraseMode === 'simplify') {
        prompt = settings.rephraseSimplify;
      } else if (rephraseMode === 'professional') {
        prompt = settings.rephraseProfessional;
      } else if (rephraseMode === 'casual') {
        prompt = settings.rephraseCasual;
      }

      const authHeader = await getAuthHeader();

      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          text: selectedText,
          prompt,
        }),
      });

      if (!response.ok) {
        onError('重寫失敗，請再試過。');
        return;
      }

      const data = await safeParseJSON<any>(response);
      if (data?.rephrased) {
        const newText = editedText.substring(0, selectionStart) + data.rephrased + editedText.substring(selectionEnd);
        setEditedText(newText);
        setShowToolbar(false);
      }
    } catch (error) {
      onError('重寫失敗，請再試過。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="prose prose-invert prose-zinc max-w-none font-serif text-lg leading-relaxed text-zinc-100/90">
              <MarkdownRenderer content={displayText} />
            </div>

            <div className="flex flex-wrap gap-3 pt-8 border-t border-white/10">
              <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> 編輯內容
              </button>
              <button 
                onClick={() => setShowRegeneratePanel(!showRegeneratePanel)} 
                className={`btn-secondary flex items-center gap-2 ${showRegeneratePanel ? 'bg-white/20' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> 重新生成
              </button>
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 min-w-[100px]">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? '已複製' : '複製'}
              </button>
              {onNewSession && (
                <button onClick={onNewSession} className="btn-secondary flex items-center gap-2 ml-auto">
                  <Sparkles className="w-4 h-4" /> 開始新工作
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Editor */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">編輯器</label>
                <textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onScroll={handleEditorScroll}
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  className="w-full h-[600px] bg-black/40 border border-white/20 rounded-xl p-6 font-serif text-lg leading-relaxed text-white focus:outline-none focus:border-white/40 transition-all custom-scrollbar"
                  placeholder="喺度輸入..."
                />
                
                {/* Text Selection Toolbar */}
                <AnimatePresence>
                  {showToolbar && selectedText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="fixed z-50 bg-zinc-950 border border-white/20 rounded-xl shadow-2xl p-2 flex gap-1"
                      style={{
                        top: `${toolbarPos.top}px`,
                        left: `${toolbarPos.left}px`,
                      }}
                    >
                      <button
                        onClick={() => applyFormat('bold')}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                        title="粗體 (Bold)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyFormat('italic')}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                        title="斜體 (Italic)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => applyFormat('underline')}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                        title="底線 (Underline)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <div className="w-px bg-white/20" />
                      <div className="relative">
                        <button
                          onClick={() => setShowRephrasMenu(!showRephrasMenu)}
                          disabled={isLoading}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white flex items-center gap-1"
                          title="AI 重寫"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {showRephrasMenu && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute top-full right-0 mt-2 bg-zinc-950 border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[150px]"
                            >
                              <button
                                onClick={() => {
                                  handleRephrase('simplify');
                                  setShowRephrasMenu(false);
                                }}
                                disabled={isLoading}
                                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
                              >
                                簡化
                              </button>
                              <button
                                onClick={() => {
                                  handleRephrase('professional');
                                  setShowRephrasMenu(false);
                                }}
                                disabled={isLoading}
                                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
                              >
                                專業
                              </button>
                              <button
                                onClick={() => {
                                  handleRephrase('casual');
                                  setShowRephrasMenu(false);
                                }}
                                disabled={isLoading}
                                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
                              >
                                隨意
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Live Preview */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  實時預覽 · {editedText.length} 字
                </label>
                <div 
                  ref={previewRef}
                  className="h-[600px] bg-black/20 border border-white/20 rounded-xl p-6 overflow-y-auto custom-scrollbar prose prose-invert prose-zinc max-w-none font-serif text-lg leading-relaxed text-zinc-100/90"
                >
                  <MarkdownRenderer content={editedText || '（預覽將在此顯示）'} />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} disabled={isLoading} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> {isLoading ? '保存中...' : '保存'}
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary flex items-center gap-2">
                <X className="w-4 h-4" /> 取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegeneratePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6 mt-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h4 className="font-bold text-lg">進階生成模式</h4>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  追加指令（可選）
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="例如：講得簡潔啲、或者用列點方式..."
                  className="w-full h-24 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    風格選擇
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as SummaryTone)}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2 text-sm text-white"
                  >
                    <option value="professional">💼 專業客觀 (Professional)</option>
                    <option value="concise">⚡ 核心要點 (Concise)</option>
                    <option value="creative">🎨 創意啟發 (Creative)</option>
                  </select>
                </div>
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="place-self-end btn-primary whitespace-nowrap"
                >
                  {isLoading ? '生成中...' : '開始生成'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
