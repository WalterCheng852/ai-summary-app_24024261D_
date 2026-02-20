'use client';

import { useState } from 'react';

interface SummaryGeneratorProps {
  documentId: string;
  onSuccess: (summary: any) => void;
  onError: (error: string) => void;
}

export default function SummaryGenerator({
  documentId,
  onSuccess,
  onError,
}: SummaryGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<'professional' | 'casual' | 'concise' | 'detailed'>('professional');

  const handleGenerateSummary = async () => {
    if (!documentId) {
      onError('缺少 documentId');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          tone,
          maxLength: 300,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || '生成失败');
        setIsLoading(false);
        return;
      }

      onSuccess(data.summary);
      setIsLoading(false);
    } catch (error) {
      console.error('生成错误:', error);
      onError('生成失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-serif text-sm font-semibold mb-2">
          摘要风格
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as any)}
          disabled={isLoading}
          className="w-full border border-black/20 p-2 font-serif text-sm focus:outline-none focus:border-black"
        >
          <option value="professional">专业风格</option>
          <option value="casual">随意风格</option>
          <option value="concise">简洁风格</option>
          <option value="detailed">详细风格</option>
        </select>
      </div>

      <button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-6 font-serif font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin">⏳</span>
            生成中...
          </span>
        ) : (
          '生成摘要'
        )}
      </button>
    </div>
  );
}
