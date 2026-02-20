/**
 * 文件验证和输入验证工具
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TEXT_LENGTH = 20000; // 字符数
export const MAX_TEXT_WORDS = 2000; // 单词数（针对英文）
export const ALLOWED_FILE_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 验证文件大小
 */
export function validateFileSize(size: number): ValidationError | null {
  if (size > MAX_FILE_SIZE) {
    return {
      field: 'file',
      message: `文件过大。最大允许 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB，你的文件是 ${Math.round(size / 1024 / 1024)}MB`,
    };
  }
  return null;
}

/**
 * 验证文件类型
 */
export function validateFileType(mimeType: string): ValidationError | null {
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    return {
      field: 'file',
      message: `不支持此文件类型。允许：PDF、TXT、Markdown`,
    };
  }
  return null;
}

/**
 * 验证文件名
 */
export function validateFilename(filename: string): ValidationError | null {
  if (!filename || filename.trim().length === 0) {
    return {
      field: 'filename',
      message: '文件名不能为空',
    };
  }

  if (filename.length > 255) {
    return {
      field: 'filename',
      message: '文件名过长（最多 255 字符）',
    };
  }

  return null;
}

/**
 * 验证原始文本
 */
export function validateRawText(text: string): ValidationError | null {
  if (!text || text.trim().length === 0) {
    return {
      field: 'text',
      message: '文本内容不能为空',
    };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return {
      field: 'text',
      message: `文本过长。最大 ${MAX_TEXT_LENGTH} 字，你输入了 ${text.length} 字`,
    };
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount > MAX_TEXT_WORDS) {
    return {
      field: 'text',
      message: `文本单词过多。最大 ${MAX_TEXT_WORDS} 词，你输入了 ${wordCount} 词。请删减内容。`,
    };
  }

  return null;
}

/**
 * 验证文件对象
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
 * 提取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * 根据扩展名确定文件类型
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
