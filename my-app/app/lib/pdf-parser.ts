/**
 * PDF 文字提取工具 - 僅客戶端使用
 * 使用動態導入確保只在瀏覽器中載入 pdfjs-dist
 */

// Polyfill for DOMMatrix - 在任何導入前執行
if (typeof window !== 'undefined' && !window.DOMMatrix) {
  (window as any).DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
  };
}

let pdfjsLib: any = null;

/**
 * 延遲加載 pdfjs-dist - 確保只在客戶端
 */
async function loadPdfLibrary() {
  if (pdfjsLib) return pdfjsLib;

  if (typeof window === 'undefined') {
    throw new Error('PDF 提取只支持瀏覽器環境');
  }

  try {
    const lib = await import('pdfjs-dist');
    lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    pdfjsLib = lib;
    return lib;
  } catch (error) {
    console.error('載入 pdfjs-dist 失敗:', error);
    throw error;
  }
}

/**
 * 從 PDF 檔案提取文字（前端使用）
 */
export async function extractTextFromPDFFile(file: File): Promise<string> {
  try {
    const lib = await loadPdfLibrary();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'str' in item) {
            return (item as { str: string }).str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('PDF 中未搵著文字。呢個檔案可能係掃描圖像。');
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF 提取失敗:', error);
    throw new Error('冇辦法讀取 PDF 檔案。檔案可能已毀壞或格式唔支持。');
  }
}

/**
 * 驗證 PDF 檔案係咪有效
 */
export async function validatePDF(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const view = new Uint8Array(arrayBuffer);

    // 檢查 PDF 魔數（PDF 檔案應該以 %PDF 開始）
    const header = new TextDecoder().decode(view.slice(0, 4));
    if (!header.startsWith('%PDF')) {
      throw new Error('檔案唔係有效嘅 PDF');
    }

    return true;
  } catch (error) {
    console.error('PDF 驗證失敗:', error);
    return false;
  }
}
