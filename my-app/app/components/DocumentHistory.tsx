'use client';

import { useState, useEffect } from 'react';

interface DocumentHistoryProps {
  onSelectDocument: (doc: any) => void;
}

export default function DocumentHistory({ onSelectDocument }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setError('获取历史失败');
      }
    } catch (err) {
      console.error('获取历史错误:', err);
      setError('获取历史失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
      } else {
        setError('删除失败');
      }
    } catch (err) {
      console.error('删除错误:', err);
      setError('删除失败');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-black/50">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-black/50 font-serif">
        还没有历史记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-serif text-lg font-semibold border-b border-black pb-3">
        历史记录
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-black/20 p-3 hover:bg-black/5 transition-colors cursor-pointer group"
          >
            <button
              onClick={() => onSelectDocument(doc)}
              className="w-full text-left"
            >
              <p className="font-serif font-semibold text-sm mb-1 truncate">
                {doc.filename}
              </p>
              <p className="text-xs text-black/50 font-mono">
                {new Date(doc.created_at).toLocaleDateString('zh-CN', {
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
              className="mt-2 w-full py-1 text-xs border border-black/20 text-black font-serif hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
