'use client';

import { useState } from 'react';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import type { Summary, Document, SummaryTone, SummarizeResponse } from '@/app/types';

interface SummaryEditorProps {
  summary: Summary;
  document: Document;
  onSuccess: (updatedSummary: Summary) => void;
  onError: (error: string) => void;
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
  const [highlightedText, setHighlightedText] = useState('');

  const handleSaveEdit = async () => {
    if (!editedText.trim()) {
      onError('摘要不能為空');
      return;
    }

    setIsLoading(true);
    try {
      // 如果有編輯摘要，我哋需要經 API 儲存
      // 呢度先簡化處理，直接更新本地狀態
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

  const handleHighlightSelection = () => {
    const text = window.getSelection()?.toString() || '';
    if (text) {
      setSelectedText(text);
      setHighlightedText(text);
      // 喺實際應用中，呢度會更新編輯器文字並加入高亮標記
      setEditedText(editedText.replace(text, `**${text}**`));
    }
  };

  const displayText = editedText || summary.generated_summary || '（無摘要）';

  return (
    <div className="space-y-6">
      {/* 顯示/編輯區域 */}
      {!isEditing ? (
        <div className="border-2 border-black p-8 space-y-6">
          <div className="prose prose-sm max-w-none font-serif text-base leading-relaxed">
            <MarkdownRenderer content={displayText} />
          </div>

          <div className="border-t-2 border-black pt-6 flex gap-4 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 border-2 border-black text-black font-serif font-semibold hover:bg-black hover:text-white transition-all duration-100"
            >
              📝 編輯
            </button>
            <button
              onClick={() => setShowRegeneratePanel(!showRegeneratePanel)}
              className="px-6 py-2 border-2 border-black text-black font-serif font-semibold hover:bg-black hover:text-white transition-all duration-100"
            >
              🔄 重新生成
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayText);
                alert('已複製到剪貼板');
              }}
              className="px-6 py-2 border-2 border-black text-black font-serif font-semibold hover:bg-black hover:text-white transition-all duration-100"
            >
              📋 複製
            </button>
          </div>

          {summary.regeneration_count > 0 && (
            <p className="text-xs text-black/60 font-mono uppercase tracking-widest">
              已重新生成 {summary.regeneration_count} 次
            </p>
          )}
        </div>
      ) : (
        <div className="border-2 border-black p-8 space-y-4">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onMouseUp={handleHighlightSelection}
            className="w-full h-80 border-2 border-black p-6 font-serif text-base leading-relaxed focus:outline-none focus-visible:border-4"
          />

          <div className="flex gap-4">
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white font-serif font-semibold border-2 border-black hover:bg-white hover:text-black transition-all duration-100 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedText(summary.edited_summary || summary.generated_summary);
              }}
              className="px-4 py-2 border border-black text-black font-serif font-semibold hover:bg-black/5 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 重新生成面板 */}
      {showRegeneratePanel && (
        <div className="border-t border-black pt-6 space-y-4">
            <h4 className="font-serif font-semibold text-lg">重新生成摘要</h4>

          <div>
            <label className="block font-serif text-sm font-semibold mb-2">
              自定義提示（可選）
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：更突出關鍵點，或用更簡潔的語言..."
              className="w-full h-20 border border-black/20 p-4 font-serif text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block font-serif text-sm font-semibold mb-2">
              或選擇風格
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as SummaryTone)}
              className="w-full border border-black/20 p-2 font-serif text-sm focus:outline-none focus:border-black"
            >
              <option value="professional">專業風格</option>
              <option value="casual">隨意風格</option>
              <option value="concise">簡潔風格</option>
              <option value="detailed">詳細風格</option>
            </select>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="w-full bg-black text-white py-2 px-4 font-serif font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors"
          >
            {isLoading ? '生成中...' : '重新生成'}
          </button>
        </div>
      )}
    </div>
  );
}
