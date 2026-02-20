/**
 * 檔案驗證同輸入驗證工具
 */

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB
export const MAX_TEXT_LENGTH = 50000; // 字數
export const MAX_TEXT_WORDS = 5000; // 單詞數（針對英文）
export const ALLOWED_FILE_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 驗證檔案大小
 */
export function validateFileSize(size: number): ValidationError | null {
  if (size > MAX_FILE_SIZE) {
    return {
      field: 'file',
      message: `檔案太大。最大容許 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB，你個檔案係 ${Math.round(size / 1024 / 1024)}MB`,
    };
  }
  return null;
}

/**
 * 驗證檔案類型
 */
export function validateFileType(mimeType: string): ValidationError | null {
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    return {
      field: 'file',
      message: `唔支持呢種檔案類型。容許：PDF、TXT、Markdown`,
    };
  }
  return null;
}

/**
 * 驗證檔案名
 */
export function validateFilename(filename: string): ValidationError | null {
  if (!filename || filename.trim().length === 0) {
    return {
      field: 'filename',
      message: '檔案名唔能夠係空',
    };
  }

  if (filename.length > 255) {
    return {
      field: 'filename',
      message: '檔案名太長（最多 255 隻字）',
    };
  }

  return null;
}

/**
 * 驗證原始文字
 */
export function validateRawText(text: string): ValidationError | null {
  if (!text || text.trim().length === 0) {
    return {
      field: 'text',
      message: '文字內容唔能夠係空',
    };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return {
      field: 'text',
      message: `文字太長。最大 ${MAX_TEXT_LENGTH} 隻字，你輸入咗 ${text.length} 隻字`,
    };
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount > MAX_TEXT_WORDS) {
    return {
      field: 'text',
      message: `文字單詞太多。最多 ${MAX_TEXT_WORDS} 隻詞，你輸入咗 ${wordCount} 隻詞。請刪減內容。`,
    };
  }

  return null;
}

/**
 * 驗證檔案物件
 */
export function validateFile(file: File): ValidationError | null {
  const filenameError = validateFilename(file.name);
  if (filenameError) return filenameError;

  const sizeError = validateFileSize(file.size);
  if (sizeError) return sizeError;

  const typeError = validateFileType(file.type);
  if (typeError) return typeError;

  return null;
}

/**
 * 提取檔案副檔名
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * 根據副檔名確定檔案類型
 */
export function getFileTypeFromExtension(
  filename: string
): 'pdf' | 'txt' | 'md' | 'unknown' {
  const ext = getFileExtension(filename);
  const typeMap: Record<string, 'pdf' | 'txt' | 'md' | 'unknown'> = {
    pdf: 'pdf',
    txt: 'txt',
    text: 'txt',
    md: 'md',
    markdown: 'md',
  };
  return typeMap[ext] || 'unknown';
}
