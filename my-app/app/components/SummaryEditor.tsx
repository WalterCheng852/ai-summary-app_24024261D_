'use client';

import { useState, useRef, useEffect } from 'react';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Summary, Document, SummaryTone, SummarizeResponse } from '@/app/types';

interface SummaryEditorProps {
  summary: Summary;
  document: Document;
  onSuccess: (updatedSummary: Summary) => void;
  onError: (error: string) => void;
}

interface SelectionPosition {
  x: number;
  y: number;
  selectedText: string;
}

export default function SummaryEditor({
  summary,
  document,
  onSuccess,
  onError,
}: SummaryEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(summary.edited_summary || summary.generated_summary || '');
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [tone, setTone] = useState<SummaryTone>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPos, setSelectionPos] = useState<SelectionPosition | null>(null);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rephrasePrompt, setRephrasePrompt] = useState('');

  const handleSaveEdit = async () => {
    if (!editedText.trim()) {
      onError('摘要不能為空');
      return;
    }

    setIsLoading(true);
    try {
      const updatedSummary = {
        ...summary,
        edited_summary: editedText,
      };
      onSuccess(updatedSummary);
      setIsEditing(false);
      setIsLoading(false);
    } catch (error) {
      console.error('保存失敗:', error);
      onError('保存失敗');
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    if (text.length > 0) {
      const rect = textarea.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPos({
        x: rect.left,
        y: rect.top,
        selectedText: text,
      });
    } else {
      setSelectedText('');
      setSelectionPos(null);
    }
  };

  const handleFormatBold = () => {
    if (!selectedText || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editedText.substring(0, start);
    const after = editedText.substring(end);
    
    setEditedText(`${before}**${selectedText}**${after}`);
    setSelectedText('');
    setSelectionPos(null);
  };

  const handleFormatItalic = () => {
    if (!selectedText || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editedText.substring(0, start);
    const after = editedText.substring(end);
    
    setEditedText(`${before}*${selectedText}*${after}`);
    setSelectedText('');
    setSelectionPos(null);
  };

  const handleFormatUnderline = () => {
    if (!selectedText || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editedText.substring(0, start);
    const after = editedText.substring(end);
    
    setEditedText(`${before}<u>${selectedText}</u>${after}`);
    setSelectedText('');
    setSelectionPos(null);
  };

  const handleRephrase = async (mode: 'simple' | 'professional' | 'casual' | 'custom') => {
    if (!selectedText) return;

    setIsRephrasing(true);
    try {
      const promptMap = {
        simple: '用更簡單嘅語言重寫呢句話，保留原意。',
        professional: '用更專業並正式嘅語氣重寫呢句話。',
        casual: '用更友善同隨意嘅語氣重寫呢句話。',
        custom: rephrasePrompt,
      };

      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          prompt: promptMap[mode],
        }),
      });

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        setIsRephrasing(false);
        return;
      }

      const data = await safeParseJSON<{ rephrased: string }>(response);
      if (!data || !data.rephrased) {
        onError('重寫失敗：無效的伺服器回應');
        setIsRephrasing(false);
        return;
      }

      // 用重寫的內容替換選定的文本
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = editedText.substring(0, start);
      const after = editedText.substring(end);
      
      setEditedText(`${before}${data.rephrased}${after}`);
      setSelectedText('');
      setSelectionPos(null);
      setRephrasePrompt('');
      setIsRephrasing(false);
    } catch (error) {
      console.error('重寫錯誤:', error);
      onError('重寫失敗');
      setIsRephrasing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!customPrompt.trim() && tone === 'professional') {
      onError('請輸入自定義提示或選擇不同的風格');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryId: summary.id,
          customPrompt: customPrompt.trim() || undefined,
          tone,
        }),
      });

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        setIsLoading(false);
        return;
      }

      const data = await safeParseJSON<SummarizeResponse>(response);
      if (!data || !data.summary) {
        onError('重新生成失敗：無效的伺服器回應');
        setIsLoading(false);
        return;
      }

      onSuccess(data.summary);
      setCustomPrompt('');
      setShowRegeneratePanel(false);
      setIsLoading(false);
    } catch (error) {
      console.error('重新生成錯誤:', error);
      onError('重新生成失敗');
      setIsLoading(false);
    }
  };

  const displayText = editedText || summary.generated_summary || '（無摘要）';

  return (
    <div className="space-y-6">
      {/* 非編輯模式 */}
      {!isEditing ? (
        <div className="space-y-6">
          <div className="border-4 border-black p-12 space-y-8 bg-white">
            <div className="prose prose-sm max-w-none font-serif text-lg leading-relaxed">
              <MarkdownRenderer content={displayText} />
            </div>

            {summary.regeneration_count > 0 && (
              <p className="text-xs text-black/60 font-mono uppercase tracking-widest border-t-2 border-black pt-4">
                已重新生成 {summary.regeneration_count} 次
              </p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-4 border-3 border-black text-black font-serif font-bold text-lg hover:bg-black hover:text-white transition-all duration-100 uppercase"
            >
              ✏️ 編輯摘要
            </button>
            <button
              onClick={() => setShowRegeneratePanel(!showRegeneratePanel)}
              className="px-8 py-4 border-3 border-black text-black font-serif font-bold text-lg hover:bg-black hover:text-white transition-all duration-100 uppercase"
            >
              🔄 重新生成
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayText);
                alert('已複製到剪貼板 ✓');
              }}
              className="px-8 py-4 border-3 border-black text-black font-serif font-bold text-lg hover:bg-black hover:text-white transition-all duration-100 uppercase"
            >
              📋 複製
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const link = window.document.createElement('a');
                  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(displayText));
                  link.setAttribute('download', `summary_${Date.now()}.txt`);
                  link.style.display = 'none';
                  window.document.body.appendChild(link);
                  link.click();
                  window.document.body.removeChild(link);
                }
              }}
              className="px-8 py-4 border-3 border-black text-black font-serif font-bold text-lg hover:bg-black hover:text-white transition-all duration-100 uppercase"
            >
              ⬇️ 下載
            </button>
          </div>
        </div>
      ) : (
        /* 編輯模式 - 側邊預覽 */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：編輯器 */}
          <div className="border-4 border-black p-8 space-y-4 bg-white h-fit">
            <h3 className="font-serif text-2xl font-bold">編輯摘要</h3>
            
            {/* 格式化工具欄 */}
            {selectedText && (
              <div className="border-2 border-black/50 bg-black/5 p-4 rounded space-y-3">
                <p className="font-serif text-sm font-semibold text-black/70">
                  選定的文本：「{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}」
                </p>
                
                <div className="space-y-2">
                  <div className="font-serif text-xs font-bold text-black/60 uppercase">格式化</div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleFormatBold}
                      className="px-3 py-2 border-2 border-black text-sm font-bold hover:bg-black hover:text-white transition-all"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={handleFormatItalic}
                      className="px-3 py-2 border-2 border-black text-sm italic hover:bg-black hover:text-white transition-all"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={handleFormatUnderline}
                      className="px-3 py-2 border-2 border-black text-sm underline hover:bg-black hover:text-white transition-all"
                      title="Underline"
                    >
                      U
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border-t border-black/30 pt-3">
                  <div className="font-serif text-xs font-bold text-black/60 uppercase">AI 重寫</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRephrase('simple')}
                      disabled={isRephrasing}
                      className="px-2 py-2 border border-black text-xs font-serif font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50"
                    >
                      簡化
                    </button>
                    <button
                      onClick={() => handleRephrase('professional')}
                      disabled={isRephrasing}
                      className="px-2 py-2 border border-black text-xs font-serif font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50"
                    >
                      專業
                    </button>
                    <button
                      onClick={() => handleRephrase('casual')}
                      disabled={isRephrasing}
                      className="px-2 py-2 border border-black text-xs font-serif font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50"
                    >
                      隨意
                    </button>
                  </div>

                  {/* 自定義提示 */}
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="自定義重寫指令..."
                      value={rephrasePrompt}
                      onChange={(e) => setRephrasePrompt(e.target.value)}
                      className="w-full px-2 py-1 border border-black text-xs font-serif focus:outline-none focus:border-2"
                    />
                    <button
                      onClick={() => handleRephrase('custom')}
                      disabled={isRephrasing || !rephrasePrompt.trim()}
                      className="w-full mt-1 px-2 py-1 border-2 border-black text-xs font-serif font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50"
                    >
                      {isRephrasing ? '處理中...' : '執行'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 大型文本編輯區 */}
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              placeholder="編輯你的摘要... （選擇文字可進行格式化或 AI 重寫）"
              className="w-full h-96 border-3 border-black p-6 font-serif text-base leading-relaxed focus:outline-none resize-none"
            />

            {/* 保存按鈕 */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-black text-white font-serif font-bold text-lg border-3 border-black hover:bg-white hover:text-black transition-all duration-100 uppercase disabled:opacity-50"
              >
                {isLoading ? '保存中...' : '✓ 保存變更'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(summary.edited_summary || summary.generated_summary);
                  setSelectedText('');
                  setSelectionPos(null);
                }}
                className="px-6 py-4 border-3 border-black text-black font-serif font-bold text-lg hover:bg-black/5 transition-colors uppercase"
              >
                ✕ 取消
              </button>
            </div>
          </div>

          {/* 右側：實時預覽 */}
          <div className="border-4 border-black p-8 space-y-4 bg-white h-fit lg:sticky lg:top-8">
            <h3 className="font-serif text-2xl font-bold">預覽</h3>
            <div className="border-2 border-black/20 p-6 bg-black/2 min-h-96 font-serif text-base leading-relaxed max-h-96 overflow-y-auto">
              <MarkdownRenderer content={editedText || '...'} />
            </div>
            <p className="text-xs text-black/50 font-mono uppercase tracking-widest">
              {editedText.length} 字符
            </p>
          </div>
        </div>
      )}

      {/* 重新生成面板 */}
      {showRegeneratePanel && (
        <div className="border-4 border-black p-8 space-y-6 bg-black/2">
          <h3 className="font-serif text-2xl font-bold">重新生成摘要</h3>

          <div>
            <label className="block font-serif text-sm font-bold mb-3 uppercase tracking-wider">
              自定義提示（可選）
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：更突出關鍵點，或用更簡潔的語言... 或用 5 句話總結..."
              className="w-full h-24 border-3 border-black p-4 font-serif text-base focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-serif text-sm font-bold mb-3 uppercase tracking-wider">
              或選擇風格
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as SummaryTone)}
              className="w-full border-3 border-black p-3 font-serif text-base focus:outline-none"
            >
              <option value="professional">✓ 專業風格</option>
              <option value="casual">😊 隨意風格</option>
              <option value="concise">⚡ 簡潔風格</option>
              <option value="detailed">📖 詳細風格</option>
            </select>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="w-full bg-black text-white py-4 px-6 font-serif font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors border-3 border-black uppercase"
          >
            {isLoading ? '生成中...' : '🔄 重新生成'}
          </button>
        </div>
      )}
    </div>
  );
}
