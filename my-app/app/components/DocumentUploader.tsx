'use client';

import { useState } from 'react';
import { validateFile } from '@/app/lib/validation';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import { extractTextFromPDFFile } from '@/app/lib/pdf-parser';
import type { Document, UploadResponse } from '@/app/types';

interface DocumentUploaderProps {
  onUploadSuccess: (document: Document) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function DocumentUploader({
  onUploadSuccess,
  onError,
  isLoading = false,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [rawText, setRawText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl || supabaseUrl.includes('your-project.supabase.co')) {
      onError('Supabase 未配置，未能上傳。請先喺 .env.local 設定資料庫環境變數。');
      return;
    }

    // 驗證檔案
    const validationError = validateFile(file);
    if (validationError) {
      onError(validationError.message);
      return;
    }

    try {
      setUploadProgress(10);

      // 檢查是否為 PDF，需要客戶端提取文字
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          setUploadProgress(20);
          const extractedText = await extractTextFromPDFFile(file);
          setUploadProgress(40);

          // 改為發送提取出的文字而不是 PDF 檔案
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_type: 'raw_text',
              raw_text: extractedText,
            }),
          });

          setUploadProgress(70);

          if (!response.ok) {
            const errorMsg = await getErrorMessage(response);
            onError(errorMsg);
            return;
          }

          const data = await safeParseJSON<UploadResponse>(response);
          if (!data || !data.document) {
            onError('上傳失敗：無效的伺服器回應');
            return;
          }

          setUploadProgress(100);
          onUploadSuccess(data.document);
          setUploadProgress(0);
          return;
        } catch (pdfError) {
          console.error('PDF 提取失敗:', pdfError);
          onError('無法提取 PDF 文字。檔案可能已損壞或係掃描影像。請改用 TXT/Markdown 檔案。');
          setUploadProgress(0);
          return;
        }
      }

      // 非 PDF 檔案，直接上傳
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(50);

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        return;
      }

      const data = await safeParseJSON<UploadResponse>(response);
      if (!data || !data.document) {
        onError('上傳失敗：無效的伺服器回應');
        return;
      }

      setUploadProgress(100);
      onUploadSuccess(data.document);
      setUploadProgress(0);
    } catch (error) {
      console.error('上傳錯誤:', error);
      onError('上傳失敗，請重試');
      setUploadProgress(0);
    }
  };

  const handleTextSubmit = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl || supabaseUrl.includes('your-project.supabase.co')) {
      onError('Supabase 未配置，未能提交。請先喺 .env.local 設定資料庫環境變數。');
      return;
    }

    if (!rawText.trim()) {
      onError('請輸入文字');
      return;
    }

    try {
      setUploadProgress(10);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `文字_${Date.now()}`,
          file_type: 'raw_text',
          raw_text: rawText,
        }),
      });

      setUploadProgress(50);

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        console.error('提交錯誤:', response.status);
        return;
      }

      const data = await safeParseJSON<UploadResponse>(response);
      if (!data || !data.document) {
        onError('提交失敗：無效的伺服器回應');
        return;
      }

      setUploadProgress(100);
      onUploadSuccess(data.document);
      setUploadProgress(0);
      setRawText('');
      setShowTextInput(false);
    } catch (error) {
      console.error('提交錯誤:', error);
      onError('提交失敗，請重試');
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-8">
      {/* 檔案上傳區域 */}
      {!showTextInput && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-4 transition-all duration-100 ${
            isDragging
              ? 'border-black bg-black/10'
              : 'border-black hover:bg-black/2'
          } p-12 text-center cursor-pointer relative`}
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-2"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #000 1px, #000 2px)',
              backgroundSize: '4px 100%'
            }}
          />
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            accept=".pdf,.txt,.md"
            className="hidden"
            disabled={isLoading}
          />
          <label htmlFor="file-input" className="cursor-pointer block relative z-10">
            <div className="text-6xl mb-6">📄</div>
            <h3 className="font-serif text-3xl font-bold mb-4">
              拖拽檔案或點擊上傳
            </h3>
            <p className="text-base text-black/70 mb-6 font-serif">
              支持：PDF、TXT、Markdown（最大 10MB）
            </p>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-black/20 h-2 mt-6 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </label>
        </div>
      )}

      {/* 或者文字輸入 */}
      <div className="border-t-2 border-black pt-8">
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="text-base font-serif font-semibold text-black hover:bg-black hover:text-white transition-colors duration-100 px-3 py-1 border border-black"
        >
          {showTextInput ? '← 返回檔案上傳' : '➤ 或直接貼文字'}
        </button>

        {showTextInput && (
          <div className="mt-8 space-y-6">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="喺呢度貼你嘅文字內容..."
              className="w-full h-48 border-2 border-black p-6 font-serif text-base leading-relaxed focus:outline-none focus-visible:border-4"
            />
            <div className="flex gap-4">
              <button
                onClick={handleTextSubmit}
                disabled={isLoading || !rawText.trim()}
                className="flex-1 bg-black text-white py-3 px-6 font-serif font-semibold text-base border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all duration-100 uppercase tracking-wider"
              >
                {isLoading ? '處理中...' : '📤 提交'}
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setRawText('');
                }}
                className="px-6 border-2 border-black text-black font-serif font-semibold hover:bg-black hover:text-white transition-all duration-100 uppercase tracking-wider"
              >
                ✕ 取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
