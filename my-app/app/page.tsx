'use client';

import { useState } from 'react';
import DocumentUploader from '@/app/components/DocumentUploader';
import DocumentHistory from '@/app/components/DocumentHistory';
import SummaryGenerator from '@/app/components/SummaryGenerator';
import SummaryEditor from '@/app/components/SummaryEditor';

export default function Home() {
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUploadSuccess = (document: any) => {
    setCurrentDocument(document);
    setCurrentSummary(null);
    setError('');
    setSuccess('文件上传成功，现在生成摘要');
  };

  const handleGenerateSummarySuccess = (summary: any) => {
    setCurrentSummary(summary);
    setSuccess('摘要生成成功');
    setError('');
  };

  const handleSelectDocument = (document: any) => {
    setCurrentDocument(document);
    setCurrentSummary(document.summaries?.[0] || null);
    setError('');
  };

  const handleError = (msg: string) => {
    setError(msg);
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-white text-black font-serif">
      {/* 顶部横线 */}
      <div className="h-1 bg-black" />

      {/* 标题区 */}
      <header className="border-b-4 border-black px-8 py-24 md:py-32 lg:py-40">
        <h1 className="font-serif text-8xl md:text-9xl font-bold tracking-tight leading-none mb-4">
          AI Summary
        </h1>
        <p className="text-lg md:text-xl text-black/70 font-serif max-w-2xl leading-relaxed">
          上传你的文件或粘贴文本，让 AI 为你生成专业摘要。编辑、重新生成、保存。
        </p>
      </header>

      {/* 主要内容 */}
      <main className="px-8 py-24 md:py-32 lg:py-40">
        <div className="max-w-6xl mx-auto">
          {/* 错误和成功消息 */}
          {error && (
            <div className="border-2 border-black bg-black/5 p-6 mb-8 font-serif">
              <p className="text-black">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="border-2 border-black bg-black/5 p-6 mb-8 font-serif">
              <p className="text-black">✅ {success}</p>
            </div>
          )}

          {/* 两列布局（桌面） 或 单列（手机） */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* 左侧：上传和历史 */}
            <div className="lg:col-span-1 space-y-12">
              {/* 上传区 */}
              {!currentDocument ? (
                <div className="border-4 border-black p-8">
                  <h2 className="font-serif text-2xl font-semibold mb-6">上传文件</h2>
                  <DocumentUploader
                    onUploadSuccess={handleUploadSuccess}
                    onError={handleError}
                  />
                </div>
              ) : (
                <div className="border-4 border-black p-8 space-y-4">
                  <div>
                    <p className="font-serif text-sm text-black/60 mb-1">当前文件</p>
                    <h3 className="font-serif text-lg font-semibold truncate">
                      {currentDocument.filename}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentDocument(null);
                      setCurrentSummary(null);
                    }}
                    className="w-full py-2 px-4 border-2 border-black text-black font-serif font-semibold hover:bg-black hover:text-white transition-colors"
                  >
                    上传新文件
                  </button>
                </div>
              )}

              {/* 历史记录 */}
              <div className="border-4 border-black p-8">
                <DocumentHistory onSelectDocument={handleSelectDocument} />
              </div>
            </div>

            {/* 右侧：生成和编辑 */}
            <div className="lg:col-span-2 space-y-12">
              {currentDocument && !currentSummary && (
                <div className="border-4 border-black p-8">
                  <h2 className="font-serif text-2xl font-semibold mb-6">
                    生成摘要
                  </h2>
                  <SummaryGenerator
                    documentId={currentDocument.id}
                    onSuccess={handleGenerateSummarySuccess}
                    onError={handleError}
                  />
                </div>
              )}

              {currentSummary && (
                <div className="border-4 border-black p-8 space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold mb-4">
                      摘要编辑器
                    </h2>
                    <SummaryEditor
                      summary={currentSummary}
                      document={currentDocument}
                      onSuccess={(updated) => {
                        setCurrentSummary(updated);
                        setSuccess('摘要已更新');
                      }}
                      onError={handleError}
                    />
                  </div>

                  {/* 原始文本预览 */}
                  <div className="border-t-4 border-black pt-8">
                    <details className="cursor-pointer">
                      <summary className="font-serif text-lg font-semibold mb-4">
                        查看原始文本
                      </summary>
                      <div className="bg-black/5 border border-black/20 p-4 mt-4 font-serif text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {currentDocument.raw_text.substring(0, 500)}
                        {currentDocument.raw_text.length > 500 ? '...' : ''}
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {!currentDocument && (
                <div className="border-4 border-black p-8 bg-black/5 text-center py-24">
                  <p className="font-serif text-lg text-black/60">
                    上传文件或从历史中选择一个文件开始
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 底部横线 */}
      <div className="h-1 bg-black" />
      <footer className="px-8 py-12 text-center text-sm text-black/60 font-serif">
        <p>AI Summary App • 2026 • Powered by GitHub Models</p>
      </footer>
    </div>
  );
}
