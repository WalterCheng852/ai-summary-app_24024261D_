'use client';

import { useState, useEffect } from 'react';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import type { Document, DocumentsResponse } from '@/app/types';

interface DocumentHistoryProps {
  onSelectDocument: (doc: Document) => void;
}

export default function DocumentHistory({ onSelectDocument }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl || supabaseUrl.includes('your-project.supabase.co')) {
      setDocuments([]);
      setError('Supabase 未配置，暫時未能讀取歷史記錄。請先設定 .env.local。');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/documents');

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        setError(errorMsg);
        return;
      }

      const data = await safeParseJSON<DocumentsResponse>(response);
      if (!data) {
        setError('獲取歷史失敗：無效的伺服器回應');
        return;
      }

      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setError('獲取歷史失敗');
      }
    } catch (err) {
      console.error('獲取歷史錯誤:', err);
      setError('獲取歷史失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('確定要刪除這個檔案嗎？')) return;

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
      } else {
        setError('刪除失敗');
      }
    } catch (err) {
      console.error('刪除錯誤:', err);
      setError('刪除失敗');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-black/50 font-serif text-base">載入中...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-black font-serif text-base border-2 border-black/20 p-4">{error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-black/60 font-serif text-lg">
        😴 還沒有歷史記錄
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border-2 border-black p-6 hover:bg-black hover:text-white transition-all duration-100 cursor-pointer group relative"
          >
            <div 
              className="absolute inset-0 pointer-events-none opacity-3 group-hover:opacity-5"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #fff 1px, #fff 2px)',
                backgroundSize: '4px 100%'
              }}
            />
            <button
              onClick={() => onSelectDocument(doc)}
              className="w-full text-left relative z-10"
            >
              <p className="font-serif font-bold text-lg mb-2 truncate group-hover:underline">
                {doc.filename}
              </p>
              <p className="text-xs text-black/60 font-mono group-hover:text-white/70 uppercase tracking-wider">
                {new Date(doc.created_at).toLocaleDateString('zh-TW', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(doc.id);
              }}
              className="mt-4 w-full py-2 text-sm border-2 border-current text-current font-serif font-semibold hover:bg-white hover:text-black transition-all duration-100 opacity-0 group-hover:opacity-100 relative z-10"
              >
              🗑️ 刪除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
