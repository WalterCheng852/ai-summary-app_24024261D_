'use client';

import { useState } from 'react';

interface SummaryEditorProps {
  summary: any;
  document: any;
  onSuccess: (updatedSummary: any) => void;
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
  const [tone, setTone] = useState('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  const handleSaveEdit = async () => {
    if (!editedText.trim()) {
      onError('摘要不能为空');
      return;
    }

    setIsLoading(true);
    try {
      // 如果有编辑摘要，我们需要通过 API 保存它
      // 这里简化处理，直接更新本地状态
      const updatedSummary = {
        ...summary,
        edited_summary: editedText,
      };
      onSuccess(updatedSummary);
      setIsEditing(false);
      setIsLoading(false);
    } catch (error) {
      console.error('保存失败:', error);
      onError('保存失败');
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!customPrompt.trim() && tone === 'professional') {
      onError('请输入自定义提示或选择不同的风格');
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

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || '重新生成失败');
        setIsLoading(false);
        return;
      }

      onSuccess(data.summary);
      setCustomPrompt('');
      setShowRegeneratePanel(false);
      setIsLoading(false);
    } catch (error) {
      console.error('重新生成错误:', error);
      onError('重新生成失败');
      setIsLoading(false);
    }
  };

  const handleHighlightSelection = () => {
    const text = window.getSelection()?.toString() || '';
    if (text) {
      setSelectedText(text);
      setHighlightedText(text);
      // 在实际应用中，这里会更新编辑器中的文本以包含高亮标记
      setEditedText(editedText.replace(text, `**${text}**`));
    }
  };

  const displayText = editedText || summary.generated_summary || '（无摘要）';

  return (
    <div className="space-y-6">
      {/* 显示/编辑区域 */}
      {!isEditing ? (
        <div className="border border-black p-6 space-y-4">
          <div className="prose prose-sm max-w-none font-serif text-base leading-relaxed whitespace-pre-wrap">
            {displayText}
          </div>

          <div className="border-t border-black/20 pt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-black text-black font-serif font-semibold hover:bg-black/5 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={() => setShowRegeneratePanel(!showRegeneratePanel)}
              className="px-4 py-2 border border-black text-black font-serif font-semibold hover:bg-black/5 transition-colors"
            >
              重新生成
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayText);
                alert('已复制到剪贴板');
              }}
              className="px-4 py-2 border border-black text-black font-serif font-semibold hover:bg-black/5 transition-colors"
            >
              复制
            </button>
          </div>

          {summary.regeneration_count > 0 && (
            <p className="text-xs text-black/50 font-mono">
              已重新生成 {summary.regeneration_count} 次
            </p>
          )}
        </div>
      ) : (
        <div className="border border-black p-6 space-y-4">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onMouseUp={handleHighlightSelection}
            className="w-full h-64 border border-black/20 p-4 font-serif text-sm leading-relaxed focus:outline-none focus:border-black"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="flex-1 bg-black text-white py-2 px-4 font-serif font-semibold disabled:opacity-50 hover:bg-black/90 transition-colors"
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
              自定义提示（可选）
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：更突出关键点，或用更简洁的语言..."
              className="w-full h-20 border border-black/20 p-4 font-serif text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block font-serif text-sm font-semibold mb-2">
              或选择风格
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border border-black/20 p-2 font-serif text-sm focus:outline-none focus:border-black"
            >
              <option value="professional">专业风格</option>
              <option value="casual">随意风格</option>
              <option value="concise">简洁风格</option>
              <option value="detailed">详细风格</option>
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
