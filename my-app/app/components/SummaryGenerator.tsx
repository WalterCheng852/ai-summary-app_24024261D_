'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import { supabase } from '@/app/lib/supabase';
import type { Summary, SummaryTone, SummarizeResponse } from '@/app/types';
import { Sparkles, Loader2, Zap, LayoutList, MessageSquare, ListTree } from 'lucide-react';

interface SummaryGeneratorProps {
  documentId: string;
  onSuccess: (summary: Summary) => void;
  onError: (error: string) => void;
}

const TONES: { id: SummaryTone; label: string; desc: string; icon: any }[] = [
  { id: 'professional', label: '專業風格', desc: '正式嚴謹，啱晒商業或學術', icon: LayoutList },
  { id: 'casual', label: '輕鬆口語', desc: '好似同朋友傾偈咁解讀', icon: MessageSquare },
  { id: 'concise', label: '精簡摘要', desc: '幾句重點，一眼睇晒', icon: Zap },
  { id: 'detailed', label: '詳細分析', desc: '全面深入，不放過細節', icon: ListTree },
];

export default function SummaryGenerator({
  documentId,
  onSuccess,
  onError,
}: SummaryGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<SummaryTone>('professional');

  const handleGenerateSummary = async () => {
    if (!documentId) {
      onError('未揀檔案喎');
      return;
    }

    setIsLoading(true);
    try {
      // 取得 access token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        onError('認證失敗，請重新登入。');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId,
          tone,
          maxLength: 500,
        }),
      });

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        setIsLoading(false);
        return;
      }

      const data = await safeParseJSON<SummarizeResponse>(response);
      if (data?.summary) {
        onSuccess(data.summary);
      } else {
        onError('生成失敗：伺服器冇反應');
      }
    } catch (error) {
      onError('生成失敗，請再試下啦。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold mb-2 text-white">準備好未？</h3>
        <p className="text-zinc-500">揀個你鍾意嘅風格，我會幫你搞掂佢。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TONES.map((t) => {
          const Icon = t.icon;
          const isActive = tone === t.id;
          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTone(t.id)}
              disabled={isLoading}
              className={`flex flex-col items-start p-5 rounded-xl border transition-all text-left ${
                isActive 
                  ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:border-zinc-500 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 mb-3 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
              <div className="font-bold text-lg mb-1">{t.label}</div>
              <div className={`text-sm ${isActive ? 'text-black/70' : 'text-zinc-500'}`}>
                {t.desc}
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={handleGenerateSummary}
        disabled={isLoading}
        className="w-full btn-primary py-6 relative overflow-hidden flex items-center justify-center gap-3 disabled:opacity-50 interactive-glow"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>AI 諗緊點寫好...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            <span className="text-lg">生成摘要</span>
          </>
        )}
      </button>
    </div>
  );
}
