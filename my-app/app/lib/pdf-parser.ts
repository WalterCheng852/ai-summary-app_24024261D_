/**
 * PDF 文本提取工具
 */

import * as pdfjsLib from 'pdfjs-dist';

// 设置 Worker（在浏览器中使用）
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * 从 PDF 文件提取文本（前端使用）
 */
export async function extractTextFromPDFFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    return extractTextFromPDFBuffer(arrayBuffer);
  } catch (error) {
    console.error('PDF 提取失败:', error);
    throw new Error('无法读取 PDF 文件。文件可能已损坏或格式不支持。');
  }
}

/**
 * 从 PDF ArrayBuffer 提取文本
 */
export async function extractTextFromPDFBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('PDF 中未找到文本内容。此文件可能是扫描图像。');
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF 缓冲区提取失败:', error);
    throw error;
  }
}

/**
 * 从 Base64 字符串提取 PDF 文本
 */
export async function extractTextFromBase64PDF(base64: string): Promise<string> {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return extractTextFromPDFBuffer(bytes.buffer);
  } catch (error) {
    console.error('Base64 PDF 提取失败:', error);
    throw new Error('无法处理 Base64 编码的 PDF');
  }
}

/**
 * 验证 PDF 文件是否有效
 */
export async function validatePDF(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const view = new Uint8Array(arrayBuffer);

    // 检查 PDF 魔数（PDF 文件应以 %PDF 开头）
    const header = new TextDecoder().decode(view.slice(0, 4));
    if (!header.startsWith('%PDF')) {
      throw new Error('文件不是有效的 PDF');
    }

    // 尝试解析 PDF 以验证其有效性
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages > 0;
  } catch (error) {
    console.error('PDF 验证失败:', error);
    return false;
  }
}

/**
 * 获取 PDF 页码
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('获取 PDF 页数失败:', error);
    throw new Error('无法确定 PDF 页数');
  }
}
