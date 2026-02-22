'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateFile } from '@/app/lib/validation';
import { safeParseJSON, getErrorMessage } from '@/app/lib/api-client';
import { extractTextFromPDFFile } from '@/app/lib/pdf-parser';
import type { Document, UploadResponse } from '@/app/types';
import { FileUp, Type, Loader2, CheckCircle2 } from 'lucide-react';

interface DocumentUploaderProps {
  onUploadSuccess: (document: Document) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function DocumentUploader({
  onUploadSuccess,
  onError,
  isLoading: externalLoading = false,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [rawText, setRawText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading || internalLoading;

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
    setInternalLoading(true);
    const validationError = validateFile(file);
    if (validationError) {
      onError(validationError.message);
      setInternalLoading(false);
      return;
    }

    try {
      setUploadProgress(10);
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const extractedText = await extractTextFromPDFFile(file);
        setUploadProgress(40);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            file_type: 'raw_text',
            raw_text: extractedText,
          }),
        });
        if (!response.ok) {
          const errorMsg = await getErrorMessage(response);
          onError(errorMsg);
          setInternalLoading(false);
          return;
        }
        const data = await safeParseJSON<UploadResponse>(response);
        if (data?.document) {
          setUploadProgress(100);
          setTimeout(() => {
            onUploadSuccess(data.document);
            setInternalLoading(false);
            setUploadProgress(0);
          }, 500);
        }
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorMsg = await getErrorMessage(response);
          onError(errorMsg);
          setInternalLoading(false);
          return;
        }
        const data = await safeParseJSON<UploadResponse>(response);
        if (data?.document) {
          setUploadProgress(100);
          setTimeout(() => {
            onUploadSuccess(data.document);
            setInternalLoading(false);
            setUploadProgress(0);
          }, 500);
        }
      }
    } catch (error) {
      onError('衰咗，上傳唔到，請再試下。');
      setInternalLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!rawText.trim()) {
      onError('請先輸入一啲內容。');
      return;
    }
    setInternalLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `文字貼上 - ${new Date().toLocaleTimeString()}`,
          file_type: 'raw_text',
          raw_text: rawText,
        }),
      });
      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        onError(errorMsg);
        setInternalLoading(false);
        return;
      }
      const data = await safeParseJSON<UploadResponse>(response);
      if (data?.document) onUploadSuccess(data.document);
      setRawText('');
      setShowTextInput(false);
    } catch (error) {
      onError('提交失敗，請檢查網絡。');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
        <button
          onClick={() => setShowTextInput(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            !showTextInput ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileUp className="w-4 h-4" /> 傳檔案
        </button>
        <button
          onClick={() => setShowTextInput(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            showTextInput ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" /> 貼文字
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showTextInput ? (
          <motion.div
            key="file-upload"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`relative group border-2 border-dashed transition-all duration-300 rounded-xl p-10 text-center cursor-pointer ${
              isDragging ? 'border-white bg-white/10 scale-[0.98]' : 'border-zinc-800 hover:border-zinc-500 bg-white/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.md"
            />
            
            <div className="flex flex-col items-center gap-4">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                  <p className="font-medium text-white">上傳緊... {uploadProgress > 0 && `${uploadProgress}%`}</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">揼個檔案入嚟</p>
                    <p className="text-sm text-zinc-500 mt-1">支援 PDF, TXT, Markdown (最大 10MB)</p>
                  </div>
                </>
              )}
            </div>
            {uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900 overflow-hidden rounded-b-xl">
                <motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="text-input"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <textarea
              className="w-full h-48 bg-white/5 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors resize-none font-serif text-lg"
              placeholder="喺呢度貼上你想摘要嘅文字..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button
              onClick={handleTextSubmit}
              disabled={isLoading || !rawText.trim()}
              className="w-full btn-primary disabled:opacity-50 h-14"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '確認提交'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
