import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function isPlaceholderValue(value: string): boolean {
  return (
    !value ||
    value.includes('your-project.supabase.co') ||
    value.includes('your-anon-key-here') ||
    value.includes('your-service-role-key-here') ||
    value.includes('your_anon_key_here') ||
    value.includes('your_service_role_key_here')
  );
}

export function isSupabaseConfigured(): boolean {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return (
    !isPlaceholderValue(supabaseUrl) &&
    !isPlaceholderValue(supabaseAnonKey) &&
    !isPlaceholderValue(serviceRoleKey)
  );
}

export function getSupabaseConfigMessage(): string {
  return 'Supabase 未配置。請喺 .env.local 設定 NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY 同 SUPABASE_SERVICE_ROLE_KEY。';
}

if (isPlaceholderValue(supabaseUrl) || isPlaceholderValue(supabaseAnonKey)) {
  console.warn(
    '⚠️ Supabase 環境變數未正確配置。請設定 NEXT_PUBLIC_SUPABASE_URL 同 NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// 前端客戶端（用於公開操作）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服務端客戶端（用於 API routes，需要 SERVICE_ROLE_KEY）
export function createServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigMessage());
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// 型別定義
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
