import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, isSupabaseConfigured, getSupabaseConfigMessage } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/documents
 * 獲取所有 documents 和對應嘅 summaries
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        documents: [],
        count: 0,
        warning: getSupabaseConfigMessage(),
      });
    }

    // 從 Authorization header 取得 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登入先至可以查看檔案' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 用 token 建立 client（而唔係用 SERVICE_ROLE_KEY）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    // 驗證用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '認證失敗，請重新登入' },
        { status: 401 }
      );
    }

    // 獲取同一用戶嘅所有 documents，按 created_at 降序排列（最新喑在前）
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select(
        `
        id,
        filename,
        file_type,
        created_at,
        updated_at,
        summaries (
          id,
          generated_summary,
          edited_summary,
          regeneration_count
        )
      `
      )
      .eq('user_id', user.id) // 🔐 只查詢同一用戶嘅文件
      .order('created_at', { ascending: false });

    if (docError) {
      console.error('獲取檔案清單失敗:', docError);
      return NextResponse.json(
        { error: '獲取檔案清單失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      count: documents?.length || 0,
    });
  } catch (error) {
    console.error('檔案清單 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}
