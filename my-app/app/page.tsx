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
    setSuccess('檔案上傳成功，而家可以生成摘要');
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
    <div className="min-h-screen bg-white text-black">
      {/* 頂部分隔線 */}
      <div className="h-1 bg-black" />

      {/* 標題區 - Drama through scale and negative space */}
      <header className="border-b-4 border-black px-8 py-24 md:py-32 lg:py-40 relative">
        {/* Subtle grid texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10">
          <h1 className="font-serif text-9xl md:text-9xl font-bold tracking-tighter leading-none mb-6">
            AI<br/>Summary
          </h1>
          <div className="h-1 w-24 bg-black mb-8" />
          <p className="text-xl md:text-2xl text-black/80 font-serif max-w-3xl leading-relaxed">
            上傳你嘅檔案或者直接貼文字，等 AI 幫你生成專業摘要。可以編輯、重新生成同儲存。
          </p>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="px-8 py-24 md:py-32 lg:py-40">
        <div className="max-w-6xl mx-auto">
          {/* 錯誤同成功訊息 */}
          {error && (
            <div className="border-4 border-black bg-black/5 p-8 mb-12 font-serif">
              <p className="text-base text-black font-semibold">⚠️ {error}</p>
            </div>
          )}

          {success && (
            <div className="border-4 border-black bg-black/5 p-8 mb-12 font-serif">
              <p className="text-base text-black font-semibold">✓ {success}</p>
            </div>
          )}

          {/* 兩欄佈局（桌面）或單欄（手機） */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* 左側：上傳同歷史 */}
            <div className="lg:col-span-1 space-y-16">
              {/* 上傳區 */}
              {!currentDocument ? (
                <div className="border-4 border-black p-12 bg-white relative">
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-3"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px)',
                      backgroundSize: '100% 4px'
                    }}
                  />
                  <div className="relative z-10">
                    <h2 className="font-serif text-5xl font-bold mb-8 tracking-tight">上傳</h2>
                    <DocumentUploader
                      onUploadSuccess={handleUploadSuccess}
                      onError={handleError}
                    />
                  </div>
                </div>
              ) : (
                <div className="border-4 border-black p-12 space-y-6 bg-white">
                  <div className="border-b-2 border-black pb-4">
                    <p className="font-serif text-xs uppercase tracking-widest text-black/60 mb-2">當前檔案</p>
                    <h3 className="font-serif text-3xl font-bold truncate">
                      {currentDocument.filename}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentDocument(null);
                      setCurrentSummary(null);
                    }}
                    className="w-full py-3 px-6 border-2 border-black text-black font-serif font-semibold text-base hover:bg-black hover:text-white transition-all duration-100 uppercase tracking-wider"
                  >
                    + 上傳新檔案
                  </button>
                </div>
              )}

              {/* 歷史記錄 */}
              <div className="border-4 border-black p-12 bg-white relative">
                <div 
                  className="absolute inset-0 pointer-events-none opacity-3"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, #00000008 40px, #00000008 42px)',
                  }}
                />
                <div className="relative z-10">
                  <h2 className="font-serif text-4xl font-bold mb-8 tracking-tight">歷史記錄</h2>
                  <DocumentHistory onSelectDocument={handleSelectDocument} />
                </div>
              </div>
            </div>

            {/* 右側：生成同編輯 */}
            <div className="lg:col-span-2 space-y-16">
              {currentDocument && !currentSummary && (
                <div className="border-4 border-black p-12 bg-white relative">
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-3"
                    style={{
                      backgroundImage: 'linear-gradient(#00000008 1px, transparent 1px)',
                      backgroundSize: '100% 4px'
                    }}
                  />
                  <div className="relative z-10">
                    <h2 className="font-serif text-5xl font-bold mb-8 tracking-tight">
                      生成摘要
                    </h2>
                    <SummaryGenerator
                      documentId={currentDocument.id}
                      onSuccess={handleGenerateSummarySuccess}
                      onError={handleError}
                    />
                  </div>
                </div>
              )}

              {currentSummary && (
                <div className="border-4 border-black p-12 space-y-12 bg-white relative">
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-2"
                    style={{
                      backgroundImage: 'linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="mb-8">
                      <h2 className="font-serif text-5xl font-bold mb-4 tracking-tight">
                        摘要
                      </h2>
                      <div className="h-1 w-32 bg-black" />
                    </div>
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

                  {/* 原始文字預覽 */}
                  <div className="border-t-4 border-black pt-12 relative">
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-2"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #00000008 1px, #00000008 2px)',
                        backgroundSize: '4px 100%'
                      }}
                    />
                    <details className="cursor-pointer group">
                      <summary className="font-serif text-3xl font-bold mb-6 tracking-tight select-none hover:underline">
                        📄 查看原始文字
                      </summary>
                      <div className="bg-black/5 border-2 border-black p-8 mt-6 font-serif text-base leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {currentDocument.raw_text ? (
                          <>
                            {currentDocument.raw_text.substring(0, 500)}
                            {currentDocument.raw_text.length > 500 ? '...' : ''}
                          </>
                        ) : (
                          <p className="text-black/50">沒有原始文字可用</p>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {!currentDocument && (
                <div className="border-4 border-black p-24 bg-black text-white text-center py-32 relative">
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage: 'radial-gradient(circle at top center, #ffffff, transparent 70%)',
                    }}
                  />
                  <div className="relative z-10">
                    <p className="font-serif text-3xl text-white leading-relaxed">
                      上傳檔案
                      <br/>
                      開始生成
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 底部區域 */}
      <div className="h-1 bg-black" />
      <footer className="px-8 py-16 text-center text-sm text-black/60 font-serif bg-black/2 relative">
        <div 
          className="absolute inset-0 pointer-events-none opacity-3"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, #000 1px, #000 2px)',
            backgroundSize: '4px 100%'
          }}
        />
        <div className="relative z-10">
          <p className="uppercase tracking-widest">AI Summary • 2026</p>
          <p className="mt-2">Powered by GitHub Models & Advanced AI</p>
        </div>
      </footer>
    </div>
  );
}
