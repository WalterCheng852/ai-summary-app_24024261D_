'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import type { Document, DocumentsResponse } from '@/app/types';
import { FileText, Trash2, Clock, Loader2 } from 'lucide-react';

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
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        setError(errorMsg);
        return;
      }
      const data = await safeParseJSON<DocumentsResponse>(response);
      if (data?.success) {
        setDocuments(data.documents || []);
      } else {
        setError('攞唔到歷史紀錄，試下重刷網頁。');
      }
    } catch (err) {
      setError('網絡好似有啲問題，攞唔到紀錄。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm('你確定要永久刪除呢個檔案同相關摘要？')) return;
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
      } else {
        setError('衰咗，刪除失敗。');
      }
    } catch (err) {
      setError('刪除期間出咗錯。');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        <p className="text-zinc-500 text-sm">搵緊之前嘅檔案...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm italic">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 opacity-40">
        <p className="text-zinc-500 font-serif italic text-lg">仲未有任何紀錄喎。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence initial={false}>
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => onSelectDocument(doc)}
            className="group relative flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <FileText className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg truncate group-hover:text-white transition-colors text-white">
                {doc.filename}
              </h4>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 uppercase tracking-tighter">
                  {doc.file_type}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(e, doc.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
