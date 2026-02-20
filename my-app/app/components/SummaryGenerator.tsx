'use client';

import { useState } from 'react';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import type { Summary, SummaryTone, SummarizeResponse } from '@/app/types';

interface SummaryGeneratorProps {
  documentId: string;
  onSuccess: (summary: Summary) => void;
  onError: (error: string) => void;
}

export default function SummaryGenerator({
  documentId,
  onSuccess,
  onError,
}: SummaryGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<SummaryTone>('professional');

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

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        setIsLoading(false);
        return;
      }

      const data = await safeParseJSON<SummarizeResponse>(response);
      if (!data || !data.summary) {
        onError('生成失敗：無效的伺服器回應');
        setIsLoading(false);
        return;
      }

      onSuccess(data.summary);
      setIsLoading(false);
    } catch (error) {
      console.error('生成錯誤:', error);
      onError('生成失敗，請重試');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-serif text-base font-bold mb-4 uppercase tracking-widest">
          選擇摘要風格
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as SummaryTone)}
          disabled={isLoading}
          className="w-full border-2 border-black p-4 font-serif text-base focus:outline-none focus-visible:border-4 bg-white cursor-pointer"
        >
          <option value="professional">✓ 專業風格 - 正式嚴肅</option>
          <option value="casual">✓ 隨意風格 - 輕鬆友善</option>
          <option value="concise">✓ 簡潔風格 - 短而精</option>
          <option value="detailed">✓ 詳細風格 - 全面深入</option>
        </select>
      </div>

      <button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="w-full bg-black text-white py-4 px-8 font-serif font-bold text-base border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all duration-100 uppercase tracking-widest"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="inline-block">⏳</span>
            生成中...
          </span>
        ) : (
          '⚡ 生成摘要'
        )}
      </button>
    </div>
  );
}
