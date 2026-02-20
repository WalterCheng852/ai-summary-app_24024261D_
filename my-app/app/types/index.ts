/**
 * Shared type definitions for the AI Summary App
 */

/**
 * Document type - represents an uploaded file or text
 */
export interface Document {
  id: string;
  filename: string;
  file_url: string | null;
  file_type: 'pdf' | 'txt' | 'md' | 'raw_text';
  raw_text: string;
  created_at: string;
  updated_at: string;
  summaries?: Summary[];
}

/**
 * Summary type - represents a generated summary
 */
export interface Summary {
  id: string;
  document_id: string;
  original_text: string;
  generated_summary: string;
  edited_summary: string | null;
  regeneration_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * API Response types
 */
export interface UploadResponse {
  success: boolean;
  document: Document;
  textPreview: string;
}

export interface SummarizeResponse {
  success: boolean;
  summary: Summary;
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  count: number;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Tone type for summary generation
 */
export type SummaryTone = 'professional' | 'casual' | 'concise' | 'detailed';

/**
 * Type guard for checking if response is an error
 */
export function isErrorResponse(
  response: UploadResponse | SummarizeResponse | DocumentsResponse | ErrorResponse
): response is ErrorResponse {
  return 'error' in response && !('success' in response);
}
