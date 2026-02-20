import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase environment variables missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// 前端客户端（用于公开操作）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端客户端（用于 API routes，需要 SERVICE_ROLE_KEY）
export function createServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 未设置');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// 类型定义
export interface Document {
  id: string;
  filename: string;
  file_url?: string;
  file_type: 'pdf' | 'txt' | 'raw_text';
  raw_text: string;
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  document_id: string;
  original_text: string;
  generated_summary: string;
  edited_summary?: string | null;
  regeneration_count: number;
  created_at: string;
  updated_at: string;
}
