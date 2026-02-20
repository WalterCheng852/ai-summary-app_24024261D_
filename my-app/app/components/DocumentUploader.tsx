'use client';

import { useState } from 'react';
import { validateFile } from '@/app/lib/validation';

interface DocumentUploaderProps {
  onUploadSuccess: (document: any) => void;
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
    // 验证文件
    const validationError = validateFile(file);
    if (validationError) {
      onError(validationError.message);
      return;
    }

    try {
      setUploadProgress(10);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(50);

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || '上传失败');
        return;
      }

      setUploadProgress(100);
      onUploadSuccess(data.document);
      setUploadProgress(0);
    } catch (error) {
      console.error('上传错误:', error);
      onError('上传失败，请重试');
      setUploadProgress(0);
    }
  };

  const handleTextSubmit = async () => {
    if (!rawText.trim()) {
      onError('请输入文本');
      return;
    }

    try {
      setUploadProgress(10);

      // 创建一个虚拟的 document 记录用于文本输入
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `text_${Date.now()}`,
          file_type: 'raw_text',
          raw_text: rawText,
        }),
      });

      setUploadProgress(50);

      const data = await response.json();

      if (!response.ok) {
        onError(data.error || '提交失败');
        return;
      }

      setUploadProgress(100);
      onUploadSuccess(data.document);
      setUploadProgress(0);
      setRawText('');
      setShowTextInput(false);
    } catch (error) {
      console.error('提交错误:', error);
      onError('提交失败，请重试');
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      {!showTextInput && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? 'border-black bg-black/5'
              : 'border-black/20 hover:border-black/40'
          } p-8 text-center cursor-pointer`}
        >
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            accept=".pdf,.txt,.md"
            className="hidden"
            disabled={isLoading}
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              拖拽文件或点击上传
            </h3>
            <p className="text-sm text-black/60 mb-4">
              支持：PDF、TXT、Markdown（最大 10MB）
            </p>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-black/10 h-1 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </label>
        </div>
      )}

      {/* 或者文本输入 */}
      <div className="border-t border-black/20 pt-6">
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="text-sm underline hover:no-underline text-black/70"
        >
          {showTextInput ? '或使用文件上传' : '或直接粘贴文本'}
        </button>

        {showTextInput && (
          <div className="mt-4 space-y-4">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="在这里粘贴你的文本内容..."
              className="w-full h-40 border border-black/20 p-4 font-serif text-sm leading-relaxed focus:outline-none focus:border-black"
            />
            <div className="flex gap-4">
              <button
                onClick={handleTextSubmit}
                disabled={isLoading || !rawText.trim()}
                className="flex-1 bg-black text-white py-3 px-6 font-serif font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors"
              >
                {isLoading ? '处理中...' : '提交'}
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setRawText('');
                }}
                className="px-6 border border-black/20 text-black font-serif font-semibold hover:bg-black/5 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
